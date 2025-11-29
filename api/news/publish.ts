import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const DRAFT_COLUMNS =
  "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number";
const ARTICLE_COLUMNS =
  "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  setCors(res);
  const body = parseJsonBody(req.body);
  const versionId = typeof body?.versionId === "string" ? body.versionId : null;
  if (!versionId) {
    return res.status(400).json({ error: "Missing versionId" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data: draft, error: draftError } = await supabase
      .from("article_versions")
      .select(DRAFT_COLUMNS)
      .eq("id", versionId)
      .maybeSingle();

    if (draftError || !draft) {
      logSupabaseError("api.news.publish.loadDraft", draftError);
      return res.status(404).json({ error: "Draft not found" });
    }

    const articleId = draft.article_id || randomUUID();
    const publishedAt = new Date().toISOString();

    const { data: article, error: articleError } = await supabase
      .from("articles")
      .upsert({
        id: articleId,
        title_zh: draft.title_zh,
        title_en: draft.title_en,
        summary_zh: draft.summary_zh,
        summary_en: draft.summary_en,
        content_zh: draft.content_zh,
        content_en: draft.content_en,
        cover_source: draft.cover_source,
        published: true,
        published_at: publishedAt,
      })
      .select(ARTICLE_COLUMNS)
      .single();

    if (articleError) {
      logSupabaseError("api.news.publish.upsertArticle", articleError);
      return res.status(500).json({ error: "Failed to publish article" });
    }

    const { data: version, error: versionError } = await supabase
      .from("article_versions")
      .update({ status: "published", article_id: articleId })
      .eq("id", draft.id)
      .select(DRAFT_COLUMNS)
      .single();

    if (versionError) {
      logSupabaseError("api.news.publish.updateDraft", versionError);
      return res.status(500).json({ error: "Failed to mark draft published" });
    }

    return res.status(200).json({ article, version });
  } catch (err) {
    logSupabaseError("api.news.publish.unhandled", err as Error);
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
