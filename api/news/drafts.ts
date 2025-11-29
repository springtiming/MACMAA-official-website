import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const DRAFT_COLUMNS =
  "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

type DraftPayload = {
  id?: string;
  title_zh?: string;
  title_en?: string;
  summary_zh?: string | null;
  summary_en?: string | null;
  content_zh?: string | null;
  content_en?: string | null;
  cover_source?: string | null;
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
    return listDrafts(res);
  }

  if (req.method === "POST") {
    return saveDraft(req, res);
  }

  res.setHeader("Allow", "GET, POST, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function listDrafts(res: VercelResponse) {
  setCors(res);
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("article_versions")
      .select(DRAFT_COLUMNS)
      .eq("status", "draft")
      .order("updated_at", { ascending: false });

    if (error) {
      logSupabaseError("api.news.drafts.list", error);
      return res.status(500).json({ error: "Failed to fetch drafts" });
    }

    return res.status(200).json({ drafts: data ?? [] });
  } catch (err) {
    logSupabaseError("api.news.drafts.list.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

async function saveDraft(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const body = parseJsonBody(req.body);
  if (!body) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const payload = body as DraftPayload;
  if (!payload.title_zh || !payload.title_en) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const supabase = getSupabaseServiceClient();

    let versionNumber = 1;
    if (payload.id) {
      const { data: latest, error: latestError } = await supabase
        .from("article_versions")
        .select("version_number")
        .eq("article_id", payload.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        logSupabaseError("api.news.drafts.nextVersion", latestError);
        return res
          .status(500)
          .json({ error: "Failed to determine next version" });
      }
      if (latest?.version_number) {
        versionNumber = latest.version_number + 1;
      }
    }

    const { data, error } = await supabase
      .from("article_versions")
      .insert({
        article_id: payload.id ?? null,
        title_zh: payload.title_zh,
        title_en: payload.title_en,
        summary_zh: payload.summary_zh ?? null,
        summary_en: payload.summary_en ?? null,
        content_zh: payload.content_zh ?? null,
        content_en: payload.content_en ?? null,
        cover_source: payload.cover_source ?? null,
        status: "draft",
        version_number: versionNumber,
      })
      .select()
      .single();

    if (error) {
      logSupabaseError("api.news.drafts.save", error);
      return res.status(500).json({ error: "Failed to save draft" });
    }

    return res.status(200).json({ draft: data });
  } catch (err) {
    logSupabaseError("api.news.drafts.save.unhandled", err as Error);
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
