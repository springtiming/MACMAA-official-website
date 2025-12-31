import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "PATCH") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const admin = await verifyAdminToken(req);
  if (!admin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", code: "INVALID_TOKEN" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    if (req.method === "GET") {
      let query = supabase
        .from("event_registrations")
        .select("*")
        .order("registration_date", { ascending: false });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[events-registrations] query", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch event registrations" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ registrations: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json().catch(() => null)) as
      | {
          registrationId?: string;
          id?: string;
          paymentStatus?: string;
          status?: string;
        }
      | null;

    const registrationId = payload?.registrationId ?? payload?.id;
    const paymentStatus = payload?.paymentStatus ?? payload?.status;
    const allowedStatuses = ["pending", "confirmed", "expired", "cancelled"];

    if (!registrationId || !paymentStatus) {
      return new Response(
        JSON.stringify({ error: "Missing registrationId or paymentStatus" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!allowedStatuses.includes(paymentStatus)) {
      return new Response(
        JSON.stringify({ error: "Invalid payment status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const updates: Record<string, unknown> = {
      payment_status: paymentStatus,
      confirmed_at: new Date().toISOString(),
      confirmed_by: admin.id,
    };

    const { data, error } = await supabase
      .from("event_registrations")
      .update(updates)
      .eq("id", registrationId)
      .select("*")
      .single();

    if (error) {
      console.error("[events-registrations] update", error);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ registration: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[events-registrations] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
