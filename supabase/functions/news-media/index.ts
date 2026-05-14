import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";
import {
  getSupportedNewsMediaType,
  NEWS_IMAGE_MAX_BYTES,
  NEWS_VIDEO_MAX_BYTES,
} from "../../../shared/newsMedia.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const BUCKET = "news-media";
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
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/ogg":
      return "ogv";
  }

  const fileName = file.name.trim();
  const parts = fileName.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  switch (file.type) {
    default:
      return "bin";
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

  const mediaType = getSupportedNewsMediaType(file.type);

  if (!mediaType) {
    return jsonResponse({ error: "Unsupported news media type" }, 400);
  }

  const maxFileBytes =
    mediaType === "image" ? NEWS_IMAGE_MAX_BYTES : NEWS_VIDEO_MAX_BYTES;
  if (file.size > maxFileBytes) {
    return jsonResponse(
      {
        error:
          mediaType === "image"
            ? "Image file too large"
            : "Video file too large",
      },
      413
    );
  }

  const articleIdValue = formData.get("articleId");
  const articleId =
    typeof articleIdValue === "string" && UUID_REGEX.test(articleIdValue.trim())
      ? articleIdValue.trim()
      : "drafts";

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const objectPath = `articles/${articleId}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[news-media] upload", error);
    return jsonResponse({ error: "Failed to upload news media" }, 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return jsonResponse({ path: objectPath, publicUrl, mediaType }, 200);
});
