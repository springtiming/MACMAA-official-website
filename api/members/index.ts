import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseServiceClient, logSupabaseError } from "../_supabaseAdminClient.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("members")
      .select(
        "id, chinese_name, english_name, gender, birthday, phone, email, address, emergency_name, emergency_phone, emergency_relation, apply_date, status, notes, handled_by, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      logSupabaseError("api.members.list", error);
      return res.status(500).json({ error: "Failed to fetch members" });
    }

    return res.status(200).json({ members: data ?? [] });
  } catch (err) {
    logSupabaseError("api.members.list.unhandled", err as Error);
    return res.status(500).json({ error: "Internal error", detail: (err as Error).message });
  }
}
