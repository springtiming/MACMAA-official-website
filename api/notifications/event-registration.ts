import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEventRegistrationEmails } from "../_emailService.js";

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
    eventTitleZh?: string | null;
    eventTitleEn?: string | null;
    name?: string;
    email?: string | null;
    tickets?: number;
    paymentMethod?: string | null;
    notes?: string | null;
    notifyAdminNotes?: boolean;
  };

  if (!body.name) {
    return res.status(400).json({ error: "Missing registration name" });
  }

  try {
    const result = await sendEventRegistrationEmails(
      {
        eventTitleZh: body.eventTitleZh,
        eventTitleEn: body.eventTitleEn,
        name: body.name,
        email: body.email,
        tickets: body.tickets,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
      },
      { sendNotesToAdmin: Boolean(body.notifyAdminNotes && body.notes) }
    );

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("[notifications] event-registration", err);
    return res.status(500).json({
      ok: false,
      error: (err as Error).message ?? "Failed to send notification",
    });
  }
}
