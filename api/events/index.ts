import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const EVENT_COLUMNS =
  "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

type UpsertEventPayload = {
  id?: string;
  title_zh?: string;
  title_en?: string;
  description_zh?: string | null;
  description_en?: string | null;
  event_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string;
  fee?: number;
  member_fee?: number | null;
  capacity?: number | null;
  access_type?: "members-only" | "all-welcome" | null;
  image_type?: "unsplash" | "upload" | null;
  image_keyword?: string | null;
  image_url?: string | null;
  published?: boolean;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return listEvents(res);
  }

  if (req.method === "POST") {
    return upsertEvent(req, res);
  }

  res.setHeader("Allow", "GET, POST, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function listEvents(res: VercelResponse) {
  setCors(res);
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true });

    if (error) {
      logSupabaseError("api.events.list", error);
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    return res.status(200).json({ events: data ?? [] });
  } catch (err) {
    logSupabaseError("api.events.list.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

async function upsertEvent(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const body = parseJsonBody(req.body) as UpsertEventPayload | null;

  if (
    !body ||
    !body.title_zh ||
    !body.title_en ||
    !body.event_date ||
    !body.location
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const payload: Record<string, unknown> = {
      title_zh: body.title_zh,
      title_en: body.title_en,
      description_zh: body.description_zh ?? null,
      description_en: body.description_en ?? null,
      event_date: body.event_date,
      start_time: body.start_time ?? null,
      end_time: body.end_time ?? null,
      location: body.location,
      fee: body.fee ?? 0,
      member_fee: body.member_fee ?? null,
      capacity: body.capacity ?? null,
      access_type: body.access_type ?? null,
      image_type: body.image_type ?? null,
      image_keyword: body.image_keyword ?? null,
      image_url: body.image_url ?? null,
      published: body.published ?? true,
    };
    if (body.id) payload.id = body.id;

    const { data, error } = await supabase
      .from("events")
      .upsert(payload)
      .select(EVENT_COLUMNS)
      .single();

    if (error) {
      logSupabaseError("api.events.upsert", error);
      return res.status(500).json({ error: "Failed to save event" });
    }

    return res.status(200).json({ event: data });
  } catch (err) {
    logSupabaseError("api.events.upsert.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

function parseJsonBody(body: unknown) {
  if (!body) return null;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}
