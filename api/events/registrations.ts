import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const REG_COLUMNS =
  "id, event_id, user_id, name, phone, email, tickets, payment_method, registration_date, created_at";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  setCors(res);
  const eventId = typeof req.query.eventId === "string" ? req.query.eventId : null;

  try {
    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from("event_registrations")
      .select(REG_COLUMNS)
      .order("registration_date", { ascending: false });

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error } = await query;

    if (error) {
      logSupabaseError("api.events.registrations.list", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch event registrations" });
    }

    return res.status(200).json({ registrations: data ?? [] });
  } catch (err) {
    logSupabaseError("api.events.registrations.list.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}
