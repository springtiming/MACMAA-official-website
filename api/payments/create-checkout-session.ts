import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripeClient, STRIPE_DEFAULT_CURRENCY } from "../../server/stripe";
import { getServiceRoleSupabase } from "../../server/supabaseClient";

type CreateCheckoutPayload = {
  eventId?: string;
  tickets?: number;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  successUrl?: string;
  cancelUrl?: string;
};

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
    typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  const payload = body as CreateCheckoutPayload;

  if (!payload.eventId || !payload.name) {
    return res
      .status(400)
      .json({ error: "Missing required fields: eventId or name" });
  }

  const tickets = Number(payload.tickets ?? 1);
  if (!Number.isFinite(tickets) || tickets <= 0) {
    return res.status(400).json({ error: "Tickets must be greater than 0" });
  }

  try {
    const supabase = getServiceRoleSupabase();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title_zh, title_en, fee")
      .eq("id", payload.eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const unitAmount = Math.round(Number(event.fee ?? 0) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Free events do not require Stripe payment" });
    }

    const stripe = getStripeClient();
    const origin = resolveOrigin(req);
    const name = payload.name.trim();
    const customerEmail = payload.email?.trim();
    const phone = payload.phone?.trim() ?? "";
    const notes = payload.notes?.trim() ?? "";

    const successUrl =
      payload.successUrl ??
      `${origin}/events/${event.id}/register?status=success`;
    const cancelUrl =
      payload.cancelUrl ?? `${origin}/events/${event.id}/register?status=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: event.id,
      metadata: {
        event_id: event.id,
        tickets: String(tickets),
        name,
        email: customerEmail ?? "",
        phone,
        notes,
      },
      line_items: [
        {
          quantity: tickets,
          price_data: {
            currency: STRIPE_DEFAULT_CURRENCY,
            unit_amount: unitAmount,
            product_data: {
              name: event.title_zh ?? event.title_en ?? "Event",
              metadata: {
                event_id: event.id,
              },
            },
          },
        },
      ],
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("[stripe] create-checkout-session error", err);
    return res.status(500).json({
      error: "Failed to create checkout session",
      detail: (err as Error).message ?? String(err),
    });
  }
}

function resolveOrigin(req: VercelRequest): string {
  const originHeader = req.headers.origin;
  if (typeof originHeader === "string") return originHeader;

  const referer = req.headers.referer;
  if (typeof referer === "string") {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {
      // fall through
    }
  }

  const host =
    (req.headers["x-forwarded-host"] as string | undefined) ||
    (req.headers.host as string | undefined);
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined) || "https";
  return host ? `${protocol}://${host}` : "http://localhost:5173";
}
