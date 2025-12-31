import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "DELETE") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const admin = await verifyAdminToken(req);
  if (!admin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", code: "INVALID_TOKEN" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(
          JSON.stringify({ error: "Missing id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) {
        console.error("[news-admin] delete", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete article" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response("", { status: 204, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, cover_type, cover_keyword, cover_url, published_at, published, author_id"
      )
      .order("published_at", { ascending: false });

    if (error) {
      console.error("[news-admin] list", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch news" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ articles: data ?? [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[news-admin] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
