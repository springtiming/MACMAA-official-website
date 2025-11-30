import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseServiceClient, logSupabaseError } from "../_supabaseAdminClient.js";

type LoginPayload = { username?: string; password?: string };

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    setCors(res);
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  setCors(res);
  const body = parseJson(req.body) as LoginPayload | null;
  if (!body?.username || !body?.password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const password_hash = createHash("sha256").update(body.password).digest("hex");

    const { data, error } = await supabase
      .from("admin_accounts")
      .select("id, username, role, status, password_hash")
      .eq("username", body.username)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      logSupabaseError("api.admin-auth.lookup", error);
      return res.status(500).json({ error: "Auth lookup failed" });
    }

    if (!data || data.password_hash !== password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({ id: data.id, username: data.username, role: data.role });
  } catch (err) {
    logSupabaseError("api.admin-auth.unhandled", err as Error);
    return res.status(500).json({ error: "Internal error" });
  }
}

function parseJson(payload: unknown) {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return payload;
}
