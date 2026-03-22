import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";
import { isSupportedNewsVideoType } from "../../../shared/newsMedia.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const BUCKET = "news-media";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getFileExtension(file: File) {
  const fileName = file.name.trim();
  const parts = fileName.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  switch (file.type) {
    case "video/webm":
      return "webm";
    case "video/ogg":
      return "ogv";
    default:
      return "mp4";
  }
}

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

  const admin = await verifyAdminToken(req);
  if (!admin) {
    return jsonResponse({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401);
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return jsonResponse({ error: "Invalid form data" }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "Missing file" }, 400);
  }

  if (!isSupportedNewsVideoType(file.type)) {
    return jsonResponse({ error: "Unsupported video type" }, 400);
  }

  if (file.size > MAX_FILE_BYTES) {
    return jsonResponse({ error: "Video file too large" }, 413);
  }

  const articleIdValue = formData.get("articleId");
  const articleId =
    typeof articleIdValue === "string" && UUID_REGEX.test(articleIdValue.trim())
      ? articleIdValue.trim()
      : "drafts";

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const objectPath = `articles/${articleId}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error("[news-media] upload", error);
    return jsonResponse({ error: "Failed to upload news video" }, 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return jsonResponse({ path: objectPath, publicUrl }, 200);
});
