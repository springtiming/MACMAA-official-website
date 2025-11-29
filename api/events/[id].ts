import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const EVENT_COLUMNS =
  "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published";

function setCors(res: VercelResponse, methods: string[] = ["GET", "DELETE"]) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", `${methods.join(", ")}, OPTIONS`);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return getEvent(id, res);
  }

  if (req.method === "DELETE") {
    return deleteEvent(id, res);
  }

  setCors(res);
  res.setHeader("Allow", "GET, DELETE, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function getEvent(id: string, res: VercelResponse) {
  setCors(res);
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logSupabaseError("api.events.get", error);
      return res.status(500).json({ error: "Failed to fetch event" });
    }

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json({ event: data });
  } catch (err) {
    logSupabaseError("api.events.get.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

async function deleteEvent(id: string, res: VercelResponse) {
  setCors(res, ["DELETE"]);
  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      logSupabaseError("api.events.delete", error);
      return res.status(500).json({ error: "Failed to delete event" });
    }

    return res.status(204).end();
  } catch (err) {
    logSupabaseError("api.events.delete.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}
