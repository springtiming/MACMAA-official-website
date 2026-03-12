import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type ReviewModule = "member_review" | "payment_review";

const ALLOWED_MODULES: ReviewModule[] = ["member_review", "payment_review"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
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
  const moduleParam = url.searchParams.get("module");
  const targetId = url.searchParams.get("targetId");
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

  if (!moduleParam || !ALLOWED_MODULES.includes(moduleParam as ReviewModule)) {
    return new Response(JSON.stringify({ error: "Invalid module" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!targetId) {
    return new Response(JSON.stringify({ error: "Missing targetId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data, error } = await supabase
      .from("review_audit_logs")
      .select(
        "id, module, target_type, target_id, action_type, from_status, to_status, reviewed_by, reviewed_at, metadata, admin_accounts!review_audit_logs_reviewed_by_fkey (username)",
      )
      .eq("module", moduleParam)
      .eq("target_id", targetId)
      .order("reviewed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[review-logs] query", error);
      return new Response(JSON.stringify({ error: "Failed to fetch review logs" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const logs = (data ?? []).map((row) => ({
      id: row.id,
      module: row.module,
      target_type: row.target_type,
      target_id: row.target_id,
      action_type: row.action_type,
      from_status: row.from_status,
      to_status: row.to_status,
      reviewed_by: row.reviewed_by,
      reviewed_by_username:
        (row as { admin_accounts?: { username?: string | null } | null })
          .admin_accounts?.username ?? null,
      reviewed_at: row.reviewed_at,
      metadata: row.metadata,
    }));

    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[review-logs] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
