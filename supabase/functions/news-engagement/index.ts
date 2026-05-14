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

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

type EngagementAction = "view" | "like" | "unlike";

type EngagementPayload = {
  articleId?: string;
  action?: EngagementAction;
};

type EngagementResult = {
  view_count: number;
  like_count: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const body = (await req.json().catch(() => null)) as EngagementPayload | null;
  const articleId = body?.articleId?.trim() ?? "";
  const action = body?.action;

  if (!UUID_REGEX.test(articleId)) {
    return json({ error: "Invalid articleId" }, 400);
  }

  if (action !== "view" && action !== "like" && action !== "unlike") {
    return json({ error: "Invalid action" }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data, error } = await supabase.rpc("record_article_engagement", {
    target_article_id: articleId,
    engagement_action: action,
  });

  if (error) {
    console.error("[news-engagement] record", error);
    return json({ error: "Failed to update news engagement" }, 500);
  }

  const result = Array.isArray(data)
    ? (data[0] as EngagementResult | undefined)
    : undefined;

  if (!result) {
    return json({ error: "Article not found" }, 404);
  }

  return json({
    viewCount: Number(result.view_count ?? 0),
    likeCount: Number(result.like_count ?? 0),
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
