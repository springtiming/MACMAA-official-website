import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseServiceClient } from "./_supabaseAdminClient.js";
import { hashVerificationCode, normalizeEmail } from "./_memberVerificationStore.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const body =
    (typeof req.body === "string"
      ? JSON.parse(req.body)
      : (req.body ?? {})) as { email?: string; code?: string };
  const email = normalizeEmail(body.email ?? "");
  const code = String(body.code ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: "Invalid verification code" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data: verification, error: verificationError } = await supabase
      .from("member_verification_codes")
      .select("code_hash, expires_at")
      .eq("email", email)
      .maybeSingle();

    if (verificationError) {
      return res.status(500).json({ error: "Failed to verify code" });
    }

    if (!verification) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    const isExpired =
      new Date(verification.expires_at).getTime() <= Date.now();
    if (isExpired) {
      await supabase
        .from("member_verification_codes")
        .delete()
        .eq("email", email);
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    const codeHash = hashVerificationCode(code);
    if (verification.code_hash !== codeHash) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    const { data: member, error } = await supabase
      .from("members")
      .select("email, status, chinese_name, english_name")
      .eq("status", "approved")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to verify member" });
    }
    if (!member) {
      return res
        .status(404)
        .json({ error: "Email not found in member database" });
    }

    const name = member.chinese_name || member.english_name || "Member";
    await supabase
      .from("member_verification_codes")
      .delete()
      .eq("email", email);
    return res.status(200).json({
      success: true,
      data: {
        name,
        email: member.email ?? email,
      },
    });
  } catch (err) {
    console.error("[member] verify error", err);
    return res.status(500).json({ error: "Failed to verify member" });
  }
}
