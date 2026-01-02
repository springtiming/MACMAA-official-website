import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "PATCH" && req.method !== "DELETE") {
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

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const url = new URL(req.url);

  try {
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) {
        console.error("[members] delete", error);
        return new Response(JSON.stringify({ error: "Failed to delete member" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === "PATCH") {
      let body: {
        id?: string;
        status?: "pending" | "approved" | "rejected";
        expectedStatus?: "pending" | "approved" | "rejected";
        expectedUpdatedAt?: string | null;
      };

      try {
        body = await req.json();
      } catch {
        body = {};
      }

      const id = url.searchParams.get("id") ?? body?.id ?? null;
      if (!id) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nextStatus = body?.status;
      if (!nextStatus || !["pending", "approved", "rejected"].includes(nextStatus)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase
        .from("members")
        .update({
          status: nextStatus,
          handled_by: admin.id,
        })
        .eq("id", id);

      if (body?.expectedStatus) {
        query = query.eq("status", body.expectedStatus);
      }
      if (body?.expectedUpdatedAt) {
        query = query.eq("updated_at", body.expectedUpdatedAt);
      }

      const { data, error } = await query
        .select(
          "id, chinese_name, english_name, gender, birthday, phone, email, address, emergency_name, emergency_phone, emergency_relation, apply_date, status, notes, handled_by, created_at, updated_at",
        )
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.message?.includes("0 rows")) {
          return new Response(JSON.stringify({ error: "Conflict" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("[members] update", error);
        return new Response(JSON.stringify({ error: "Failed to update member" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ member: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("members")
      .select(
        "id, chinese_name, english_name, gender, birthday, phone, email, address, emergency_name, emergency_phone, emergency_relation, apply_date, status, notes, handled_by, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[members] list", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch members" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ members: data ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[members] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
