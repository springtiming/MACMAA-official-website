import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
    let versionNumber = 1;
    if (body.id) {
      const { data: latest, error: latestError } = await supabase
        .from("article_versions")
        .select("version_number")
        .eq("article_id", body.id)
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
    }

    const { data, error } = await supabase
      .from("article_versions")
      .insert({
        article_id: body.id ?? null,
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
      .select()
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
