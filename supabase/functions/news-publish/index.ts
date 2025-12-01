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

    // 使用 article_id 作为统一的新闻编号
    // - 如果草稿已经有 article_id，则直接复用
    // - 否则生成新的 UUID 并写回该版本记录，确保之后的草稿/发布都使用同一编号
    let articleId = draft.article_id || crypto.randomUUID();
    const publishedAt = new Date().toISOString();

    if (!draft.article_id) {
      const { error: updateDraftArticleIdError } = await supabase
        .from("article_versions")
        .update({ article_id: articleId })
        .eq("id", draft.id);
      if (updateDraftArticleIdError) {
        console.error("[news-publish] set article_id on draft", updateDraftArticleIdError);
        return new Response(
          JSON.stringify({ error: "Failed to prepare draft for publish" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

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

    // 将当前草稿标记为已发布版本
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

    // 删除同一新闻编号下所有仍为草稿状态的版本
    const { error: deleteDraftsError } = await supabase
      .from("article_versions")
      .delete()
      .eq("article_id", articleId)
      .eq("status", "draft");

    if (deleteDraftsError) {
      console.error("[news-publish] delete remaining drafts", deleteDraftsError);
      return new Response(
        JSON.stringify({ error: "Failed to clean up drafts after publish" }),
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
