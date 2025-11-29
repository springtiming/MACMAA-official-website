import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

const ACCOUNT_COLUMNS =
  "id, username, email, role, status, created_at, last_login_at";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

type CreateAccountPayload = {
  username?: string;
  email?: string;
  password?: string;
  role?: "owner" | "admin";
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return listAccounts(res);
  }

  if (req.method === "POST") {
    return createAccount(req, res);
  }

  res.setHeader("Allow", "GET, POST, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function listAccounts(res: VercelResponse) {
  setCors(res);
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("admin_accounts")
      .select(ACCOUNT_COLUMNS)
      .order("created_at", { ascending: true });

    if (error) {
      logSupabaseError("api.admin-accounts.list", error);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }

    return res.status(200).json({ accounts: data ?? [] });
  } catch (err) {
    logSupabaseError("api.admin-accounts.list.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

async function createAccount(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const body = parseJsonBody(req.body) as CreateAccountPayload | null;
  if (
    !body ||
    !body.username ||
    !body.email ||
    !body.password ||
    !body.role
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const password_hash = createHash("sha256")
      .update(body.password)
      .digest("hex");

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("admin_accounts")
      .insert({
        username: body.username,
        email: body.email,
        password_hash,
        role: body.role,
        status: "active",
      })
      .select(ACCOUNT_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Username or email already used" });
      }
      logSupabaseError("api.admin-accounts.create", error);
      return res.status(500).json({ error: "Failed to create account" });
    }

    return res.status(201).json({ account: data });
  } catch (err) {
    logSupabaseError("api.admin-accounts.create.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

function parseJsonBody(body: unknown) {
  if (!body) return null;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}
