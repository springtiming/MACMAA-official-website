import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const BUCKET = "payment-proofs";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const DEFAULT_SIGNED_URL_TTL = 60 * 60;
const MAX_SIGNED_URL_TTL = 60 * 60 * 24;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  if (req.method === "POST") {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return jsonResponse({ error: "Invalid form data" }, 400);
    }

    const file = formData.get("file");
    const eventIdValue = formData.get("eventId");
    const eventId = typeof eventIdValue === "string" ? eventIdValue.trim() : "";

    if (!eventId) {
      return jsonResponse({ error: "Missing eventId" }, 400);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
      return jsonResponse({ error: "Invalid eventId" }, 400);
    }

    if (!(file instanceof File)) {
      return jsonResponse({ error: "Missing file" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return jsonResponse({ error: "Invalid file type" }, 400);
    }

    if (file.size > MAX_FILE_BYTES) {
      return jsonResponse({ error: "File too large" }, 413);
    }

    const nameParts = file.name.split(".");
    const ext =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1].toLowerCase()
        : "jpg";
    const objectPath = `event-registrations/${eventId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(
      objectPath,
      file,
      {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      }
    );

    if (error) {
      console.error("[payment-proofs] upload", error);
      return jsonResponse({ error: "Failed to upload payment proof" }, 500);
    }

    return jsonResponse({ path: objectPath }, 200);
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const path = url.searchParams.get("path")?.trim() ?? "";
    const expiresInRaw = url.searchParams.get("expiresIn");

    if (!path) {
      return jsonResponse({ error: "Missing path" }, 400);
    }

    const parsedTtl = Number.parseInt(expiresInRaw ?? "", 10);
    const expiresIn = Number.isFinite(parsedTtl)
      ? Math.min(Math.max(parsedTtl, 60), MAX_SIGNED_URL_TTL)
      : DEFAULT_SIGNED_URL_TTL;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("[payment-proofs] sign", error);
      return jsonResponse({ error: "Failed to sign payment proof URL" }, 500);
    }

    return jsonResponse({ signedUrl: data?.signedUrl ?? "" }, 200);
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
