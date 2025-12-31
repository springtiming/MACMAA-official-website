import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";
import { requireAdmin, requireOwner } from "../_auth.js";
import { hashPassword } from "../_password.js";

const ACCOUNT_COLUMNS =
  "id, username, email, role, status, created_at, last_login_at";

const DEFAULT_ACCOUNTS: Required<CreateAccountPayload>[] = [
  {
    username: "owner_admin",
    email: "owner@macmaa.org",
    password: "Owner@123",
    role: "owner",
  },
  {
    username: "zhang_admin",
    email: "zhang_admin@macmaa.org",
    password: "Admin@123",
    role: "admin",
  },
  {
    username: "admin",
    email: "admin@macmaa.org",
    password: "demo123",
    role: "admin",
  },
];

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
    return listAccounts(req, res);
  }

  if (req.method === "POST") {
    return createAccount(req, res);
  }

  res.setHeader("Allow", "GET, POST, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function listAccounts(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const admin = requireAdmin(req, res);
  if (!admin) {
    return;
  }

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

    if (data && data.length > 0) {
      return res.status(200).json({ accounts: data });
    }

    const seeded = await seedDefaultAccounts(supabase);
    return res.status(200).json({ accounts: seeded });
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
  const admin = requireOwner(req, res);
  if (!admin) {
    return;
  }

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
    const password_hash = await hashPassword(body.password);

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("admin_accounts")
      .insert({
        id: randomUUID(),
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

async function seedDefaultAccounts(supabase: ReturnType<typeof getSupabaseServiceClient>) {
  const inserts = await Promise.all(
    DEFAULT_ACCOUNTS.map(async (acc) => ({
      id: randomUUID(),
      username: acc.username,
      email: acc.email,
      password_hash: await hashPassword(acc.password),
      role: acc.role,
      status: "active",
    }))
  );

  const { data, error } = await supabase
    .from("admin_accounts")
    .insert(inserts)
    .select(ACCOUNT_COLUMNS);

  if (error) {
    logSupabaseError("api.admin-accounts.seed", error);
    return [];
  }

  return data ?? [];
}
