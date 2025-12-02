import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendMemberApplicationSubmitted } from "../_emailService.js";

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

  const body = (req.body ?? {}) as {
    chineseName?: string | null;
    englishName?: string | null;
    email?: string | null;
    phone?: string | null;
    applyDate?: string | null;
  };

  if (!body.email && !body.chineseName && !body.englishName) {
    return res.status(400).json({ error: "Missing applicant info" });
  }

  try {
    const result = await sendMemberApplicationSubmitted({
      chineseName: body.chineseName,
      englishName: body.englishName,
      email: body.email,
      phone: body.phone,
      applyDate: body.applyDate,
    });
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("[notifications] member-application", err);
    return res.status(500).json({
      ok: false,
      error: (err as Error).message ?? "Failed to send notification",
    });
  }
}
