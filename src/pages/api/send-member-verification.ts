import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/server/api/_emailService";
import { getSupabaseServiceClient } from "@/server/api/_supabaseAdminClient";
import {
  CODE_TTL_MS,
  generateVerificationCode,
  hashVerificationCode,
  normalizeEmail,
} from "@/server/api/_memberVerificationStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      : (req.body ?? {})) as { email?: string };
  const rawEmail = body.email ?? "";
  const email = normalizeEmail(rawEmail);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const now = new Date().toISOString();
    await supabase
      .from("member_verification_codes")
      .delete()
      .lt("expires_at", now);
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

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    const { error: upsertError } = await supabase
      .from("member_verification_codes")
      .upsert(
        {
          email,
          code_hash: codeHash,
          expires_at: expiresAt,
          updated_at: now,
        },
        { onConflict: "email" }
      );

    if (upsertError) {
      return res.status(500).json({ error: "Failed to save verification code" });
    }

    const result = await sendEmail({
      to: email,
      subject: "MACMAA Member Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <p>Your MACMAA verification code is:</p>
          <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">${code}</p>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    if (!result.ok && !result.skipped) {
      return res.status(500).json({ error: result.error || "Send failed" });
    }

    return res.status(200).json({ ok: true, skipped: result.skipped ?? false });
  } catch (err) {
    console.error("[member] send verification error", err);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
}
