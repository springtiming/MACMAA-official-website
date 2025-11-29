import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const ARTICLE_COLUMNS =
  "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id";

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

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .order("published_at", { ascending: false });

    if (error) {
      logSupabaseError("api.news.list", error);
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    return res.status(200).json({ articles: data ?? [] });
  } catch (err) {
    logSupabaseError("api.news.list.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}
