import Stripe from "stripe";

// Centralized Stripe client for server-side API routes.

let cachedStripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedStripe) return cachedStripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  cachedStripe = new Stripe(secretKey);

  return cachedStripe;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export const STRIPE_DEFAULT_CURRENCY =
  process.env.STRIPE_PAYMENT_CURRENCY ?? "aud";
