import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyPassword } from "../_shared/password.ts";
import { generateToken } from "../_shared/jwt.ts";

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

    if (!data) {
      return json({ error: "Invalid credentials" }, 401);
    }

    // 验证密码（支持bcrypt和旧SHA-256兼容）
    const isPasswordValid = await verifyPasswordOrLegacy(
      payload.password,
      data.password_hash
    );

    if (!isPasswordValid) {
      return json({ error: "Invalid credentials" }, 401);
    }

    // 生成JWT token
    const token = await generateToken(data.id, data.role);

    // 更新最后登录时间
    await supabase
      .from("admin_accounts")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    return json({
      token,
      admin: {
        id: data.id,
        username: data.username,
        role: data.role,
      },
    });
  } catch (err) {
    console.error("[admin-auth] unhandled", err);
    return json({ error: "Internal error" }, 500);
  }
});

/**
 * 验证密码，支持bcrypt和旧SHA-256格式（向后兼容）
 */
async function verifyPasswordOrLegacy(
  password: string,
  storedHash: string
): Promise<boolean> {
  // 先尝试bcrypt验证（新格式）
  try {
    const isValid = await verifyPassword(password, storedHash);
    if (isValid) {
      return true;
    }
  } catch {
    // bcrypt验证失败，继续尝试SHA-256
  }

  // 如果bcrypt验证失败，尝试SHA-256（旧格式兼容）
  // 注意：这只是为了向后兼容，新密码应该使用bcrypt
  const sha256Hash = await sha256Hex(password);
  return sha256Hash === storedHash;
}

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
