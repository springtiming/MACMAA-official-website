import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";
import { requireOwner } from "../_auth.js";
import { hashPassword } from "../_password.js";

const ACCOUNT_COLUMNS =
  "id, username, email, role, status, created_at, last_login_at";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

type UpdatePayload = {
  email?: string;
  password?: string;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method === "PATCH") {
    return updateAccount(id, req, res);
  }

  if (req.method === "DELETE") {
    return deleteAccount(id, req, res);
  }

  setCors(res);
  res.setHeader("Allow", "PATCH, DELETE, OPTIONS");
  return res.status(405).json({ error: "Method not allowed" });
}

async function updateAccount(id: string, req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const admin = requireOwner(req, res);
  if (!admin) {
    return;
  }

  const body = parseJsonBody(req.body) as UpdatePayload | null;
  if (!body || (!body.email && !body.password)) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  const updates: Record<string, unknown> = {};
  if (body.email) updates.email = body.email;
  if (body.password) {
    updates.password_hash = await hashPassword(body.password);
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("admin_accounts")
      .update(updates)
      .eq("id", id)
      .select(ACCOUNT_COLUMNS)
      .single();

    if (error) {
      logSupabaseError("api.admin-accounts.update", error);
      return res.status(500).json({ error: "Failed to update account" });
    }

    return res.status(200).json({ account: data });
  } catch (err) {
    logSupabaseError("api.admin-accounts.update.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}

async function deleteAccount(id: string, req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const admin = requireOwner(req, res);
  if (!admin) {
    return;
  }

  try {
    const supabase = getSupabaseServiceClient();

    // Prevent deleting owner accounts
    const { data: existing, error: fetchError } = await supabase
      .from("admin_accounts")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      logSupabaseError("api.admin-accounts.fetchBeforeDelete", fetchError);
      return res.status(500).json({ error: "Failed to delete account" });
    }

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }
    if (existing.role === "owner") {
      return res.status(403).json({ error: "Cannot delete owner account" });
    }

    const { error } = await supabase
      .from("admin_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      logSupabaseError("api.admin-accounts.delete", error);
      return res.status(500).json({ error: "Failed to delete account" });
    }

    return res.status(204).end();
  } catch (err) {
    logSupabaseError("api.admin-accounts.delete.unhandled", err as Error);
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
