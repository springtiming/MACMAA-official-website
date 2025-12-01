import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      logSupabaseError("api.news.delete", error);
      return res.status(500).json({ error: "Failed to delete article" });
    }

    return res.status(204).end();
  } catch (err) {
    logSupabaseError("api.news.delete.unhandled", err as Error);
    return res.status(500).json({ error: "Internal error" });
  }
}
