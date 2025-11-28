import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseServiceClient, logSupabaseError } from "../_supabaseAdminClient";

type MemberStatus = "pending" | "approved" | "rejected";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "PATCH") {
    return handleUpdateStatus(id, req, res);
  }

  if (req.method === "DELETE") {
    return handleDelete(id, res);
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleUpdateStatus(id: string, req: VercelRequest, res: VercelResponse) {
  const { status, expectedStatus, expectedUpdatedAt } = (req.body ?? {}) as {
    status?: MemberStatus;
    expectedStatus?: MemberStatus;
    expectedUpdatedAt?: string | null;
  };

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("members")
    .update({ status })
    .eq("id", id);

  if (expectedStatus) {
    query = query.eq("status", expectedStatus);
  }
  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const { data, error } = await query.select().single();

  if (error) {
    if (error.code === "PGRST116" || error.message?.includes("0 rows")) {
      return res.status(409).json({ error: "Conflict" });
    }
    logSupabaseError("api.members.updateStatus", error);
    return res.status(500).json({ error: "Failed to update member" });
  }

  return res.status(200).json({ member: data });
}

async function handleDelete(id: string, res: VercelResponse) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    logSupabaseError("api.members.delete", error);
    return res.status(500).json({ error: "Failed to delete member" });
  }

  return res.status(204).end();
}
