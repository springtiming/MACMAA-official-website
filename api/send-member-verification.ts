import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEmail } from "./_emailService.js";
import { getSupabaseServiceClient } from "./_supabaseAdminClient.js";
import {
  generateVerificationCode,
  normalizeEmail,
  setVerificationCode,
} from "./_memberVerificationStore.js";

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
      : (req.body ?? {})) as { email?: string };
  const rawEmail = body.email ?? "";
  const email = normalizeEmail(rawEmail);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const supabase = getSupabaseServiceClient();
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
    setVerificationCode(email, code);

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
