import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "@/server/api/_stripe";
import { getServiceRoleSupabase } from "@/server/api/_supabaseAdminClient";
import { sendEventRegistrationEmails } from "@/server/api/_emailService";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  const rawBody = await readRawBody(req);

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return res.status(400).send("Invalid signature");
  }

  let handledSuccessfully = true;
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    handledSuccessfully = false;
  }

  if (!handledSuccessfully) {
    return res.status(500).send("Webhook handling failed");
  }

  return res.status(200).json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.payment_status !== "paid") {
    throw new Error(`Payment not completed for session ${session.id}`);
  }

  const metadata = session.metadata ?? {};
  const eventId = metadata.event_id;

  if (!eventId) {
    console.warn("[stripe-webhook] missing event_id in metadata");
    throw new Error("Missing event_id in metadata");
  }

  const name = metadata.name || "Guest";
  const email = metadata.email || null;
  const phone = metadata.phone || "";
  const tickets = Number(metadata.tickets ?? 1) || 1;
  const notes = metadata.notes || null;

  const supabase = getServiceRoleSupabase();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title_zh, title_en")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error(
      `Event lookup failed for id ${eventId}: ${eventError?.message ?? "not found"}`
    );
  }

  const { error: insertError } = await supabase.from("event_registrations").insert(
    {
      event_id: event.id,
      name,
      email,
      phone,
      tickets,
      payment_method: "card",
    }
  );

  if (insertError) {
    throw new Error(
      `Failed to record registration: ${insertError.message ?? "unknown error"}`
    );
  }

  try {
    await sendEventRegistrationEmails(
      {
        eventTitleZh: event.title_zh,
        eventTitleEn: event.title_en,
        name,
        email: email ?? undefined,
        tickets,
        paymentMethod: "card",
        notes: notes || undefined,
      },
      { sendNotesToAdmin: Boolean(notes) }
    );
  } catch (err) {
    console.error("[stripe-webhook] notification failed", err);
  }
}

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
