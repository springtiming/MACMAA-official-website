import type { NextApiRequest, NextApiResponse } from "next";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "@/server/api/_supabaseAdminClient";
import { sendMemberApprovedEmail } from "@/server/api/_emailService";
import { requireAdmin } from "@/server/api/_auth";

type MemberStatus = "pending" | "approved" | "rejected";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid id" });
    }

    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(200).end();
    }

    if (req.method === "PATCH") {
      return handleUpdateStatus(id, req, res);
    }

    if (req.method === "DELETE") {
      return handleDelete(id, req, res);
    }

    res.setHeader("Allow", "PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    logSupabaseError("api.members.unhandled", err as Error);
    return res.status(500).json({ error: "Internal error", detail: (err as Error).message });
  }
}

async function handleUpdateStatus(id: string, req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const admin = requireAdmin(req, res);
  if (!admin) {
    return;
  }

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

  if (status === "approved") {
    // Fire-and-forget: do not block the response on email failures
    void sendMemberApprovedEmail({
      chinese_name: data?.chinese_name,
      english_name: data?.english_name,
      email: data?.email,
    });
  }

  return res.status(200).json({ member: data });
}

async function handleDelete(id: string, req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const admin = requireAdmin(req, res);
  if (!admin) {
    return;
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    logSupabaseError("api.members.delete", error);
    return res.status(500).json({ error: "Failed to delete member" });
  }

  return res.status(204).end();
}
