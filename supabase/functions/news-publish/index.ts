import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await req.json().catch(() => null) as { versionId?: string } | null;
    const versionId = body?.versionId;

    if (!versionId) {
      return new Response(
        JSON.stringify({ error: "Missing versionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: draft, error: draftError } = await supabase
      .from("article_versions")
      .select(
        "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number"
      )
      .eq("id", versionId)
      .maybeSingle();

    if (draftError || !draft) {
      console.error("[news-publish] draft fetch", draftError);
      return new Response(
        JSON.stringify({ error: "Draft not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const articleId = draft.article_id || crypto.randomUUID();
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
      .select(
        "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id"
      )
      .single();

    if (articleError) {
      console.error("[news-publish] article upsert", articleError);
      return new Response(
        JSON.stringify({ error: "Failed to publish article" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: version, error: versionError } = await supabase
      .from("article_versions")
      .update({ status: "published", article_id: articleId })
      .eq("id", draft.id)
      .select(
        "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at"
      )
      .single();

    if (versionError) {
      console.error("[news-publish] draft update", versionError);
      return new Response(
        JSON.stringify({ error: "Failed to mark draft published" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ article, version }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[news-publish] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
