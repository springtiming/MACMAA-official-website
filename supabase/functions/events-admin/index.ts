import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = await verifyAdminToken(req);
  if (!admin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", code: "INVALID_TOKEN" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published"
        )
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: true });

      if (error) {
        console.error("[events-admin] list", error);
        return json({ error: "Failed to fetch events" }, 500);
      }

      return json({ events: data ?? [] });
    }

    if (req.method === "POST") {
      const payload = (await req.json().catch(() => null)) as {
        id?: string;
        title_zh?: string;
        title_en?: string;
        description_zh?: string | null;
        description_en?: string | null;
        event_date?: string;
        start_time?: string | null;
        end_time?: string | null;
        location?: string;
        fee?: number;
        member_fee?: number | null;
        capacity?: number | null;
        access_type?: "members-only" | "all-welcome" | null;
        image_type?: "unsplash" | "upload" | null;
        image_keyword?: string | null;
        image_url?: string | null;
        published?: boolean;
      } | null;

      if (
        !payload ||
        !payload.title_zh ||
        !payload.title_en ||
        !payload.event_date ||
        !payload.location
      ) {
        return json({ error: "Missing required fields" }, 400);
      }

      let createdBy = admin.id;
      if (payload.id) {
        const { data: existingEvent, error: existingEventError } = await supabase
          .from("events")
          .select("created_by")
          .eq("id", payload.id)
          .maybeSingle();

        if (existingEventError) {
          console.error("[events-admin] fetch existing event", existingEventError);
          return json({ error: "Failed to save event" }, 500);
        }

        if (existingEvent) {
          createdBy = existingEvent.created_by ?? null;
        }
      }

      const { data, error } = await supabase
        .from("events")
        .upsert({
          id: payload.id ?? undefined,
          title_zh: payload.title_zh,
          title_en: payload.title_en,
          description_zh: payload.description_zh ?? null,
          description_en: payload.description_en ?? null,
          event_date: payload.event_date,
          start_time: payload.start_time ?? null,
          end_time: payload.end_time ?? null,
          location: payload.location,
          fee: payload.fee ?? 0,
          member_fee: payload.member_fee ?? null,
          capacity: payload.capacity ?? null,
          access_type: payload.access_type ?? null,
          image_type: payload.image_type ?? null,
          image_keyword: payload.image_keyword ?? null,
          image_url: payload.image_url ?? null,
          published: payload.published ?? true,
          created_by: createdBy,
        })
        .select(
          "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published"
        )
        .single();

      if (error) {
        console.error("[events-admin] upsert", error);
        return json({ error: "Failed to save event" }, 500);
      }

      return json({ event: data });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return json({ error: "Missing id" }, 400);
      }

      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        console.error("[events-admin] delete", error);
        return json({ error: "Failed to delete event" }, 500);
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("[events-admin] unhandled", err);
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
