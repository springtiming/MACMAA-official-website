import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LoginPayload = { username?: string; password?: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const payload = (await parseJson(req).catch(() => null)) as LoginPayload | null;
  if (!payload?.username || !payload?.password) {
    return json({ error: "Missing username or password" }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const passwordHash = await sha256Hex(payload.password);
    const { data, error } = await supabase
      .from("admin_accounts")
      .select("id, username, role, status, password_hash")
      .eq("username", payload.username)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("[admin-auth] lookup", error);
      return json({ error: "Auth lookup failed" }, 500);
    }

    if (!data || data.password_hash !== passwordHash) {
      return json({ error: "Invalid credentials" }, 401);
    }

    return json({ id: data.id, username: data.username, role: data.role });
  } catch (err) {
    console.error("[admin-auth] unhandled", err);
    return json({ error: "Internal error" }, 500);
  }
});

async function parseJson(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return req.json();
  }
  return null;
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
