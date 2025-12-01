import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return listDrafts();
  }

  if (req.method === "POST") {
    return saveDraft(req);
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});

async function listDrafts() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  try {
    const { data, error } = await supabase
      .from("article_versions")
      .select(
        "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at"
      )
      .eq("status", "draft")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[news-drafts] list", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch drafts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ drafts: data ?? [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[news-drafts] list unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

async function saveDraft(req: Request) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const body = (await req.json().catch(() => null)) as DraftPayload | null;
  if (!body || !body.title_zh || !body.title_en) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    // 业务约定：
    // - 使用 article_id 作为“新闻编号”，同一编号下最多只保留 1 条草稿（status = 'draft'）
    // - 若已存在草稿，则覆盖更新；否则按当前最大 version_number + 1 创建新草稿

    // 1. 确定 articleId（新闻编号）
    //    - 如果前端传入 id（表示 article_id），则复用
    //    - 否则生成一个新的 UUID，作为之后草稿和已发布新闻的统一编号
    let articleId = body.id && body.id.trim().length > 0 ? body.id : null;
    if (!articleId) {
      articleId = crypto.randomUUID();
    }

    // 2. 查询是否已有该 articleId 对应的草稿
    const { data: existingDraft, error: existingError } = await supabase
      .from("article_versions")
      .select("id, version_number")
      .eq("article_id", articleId)
      .eq("status", "draft")
      .maybeSingle();

    if (existingError) {
      console.error("[news-drafts] existingDraft", existingError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing draft" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const now = new Date().toISOString();

    if (existingDraft) {
      // 2.a 覆盖已有草稿
      const { data, error } = await supabase
        .from("article_versions")
        .update({
          title_zh: body.title_zh,
          title_en: body.title_en,
          summary_zh: body.summary_zh ?? null,
          summary_en: body.summary_en ?? null,
          content_zh: body.content_zh ?? null,
          content_en: body.content_en ?? null,
          cover_source: body.cover_source ?? null,
          // 保持 status = 'draft' 与 version_number 不变，仅更新时间
          updated_at: now,
        })
        .eq("id", existingDraft.id)
        .select(
          "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at",
        )
        .single();

      if (error) {
        console.error("[news-drafts] update draft", error);
        return new Response(
          JSON.stringify({ error: "Failed to save draft" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ draft: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2.b 尚无草稿，则基于历史版本号创建新的草稿版本
    let versionNumber = 1;
    const { data: latest, error: latestError } = await supabase
      .from("article_versions")
      .select("version_number")
      .eq("article_id", articleId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error("[news-drafts] nextVersion", latestError);
      return new Response(
        JSON.stringify({ error: "Failed to determine next version" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (latest?.version_number) {
      versionNumber = latest.version_number + 1;
    }

    const { data, error } = await supabase
      .from("article_versions")
      .insert({
        article_id: articleId,
        title_zh: body.title_zh,
        title_en: body.title_en,
        summary_zh: body.summary_zh ?? null,
        summary_en: body.summary_en ?? null,
        content_zh: body.content_zh ?? null,
        content_en: body.content_en ?? null,
        cover_source: body.cover_source ?? null,
        status: "draft",
        version_number: versionNumber,
      })
      .select(
        "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error("[news-drafts] save", error);
      return new Response(
        JSON.stringify({ error: "Failed to save draft" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ draft: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[news-drafts] save unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}
