import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "DELETE") {
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

  const url = new URL(req.url);
  const versionId = url.searchParams.get("versionId");

  if (!versionId) {
    return new Response(
      JSON.stringify({ error: "Missing versionId" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { error } = await supabase
      .from("article_versions")
      .delete()
      .eq("id", versionId)
      .eq("status", "draft");

    if (error) {
      console.error("[news-drafts-delete] delete", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete draft" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("[news-drafts-delete] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
