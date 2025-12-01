import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type ActivityType = "registration" | "member" | "news" | "event";

type Activity = {
  id: string;
  type: ActivityType;
  timestamp: string;
  user: string;
  action: { zh: string; en: string };
  metadata: Record<string, unknown>;
};

type RegistrationWithEvent = {
  id: string;
  name: string | null;
  created_at: string;
  event_id: string;
  events: {
    title_zh: string | null;
    title_en: string | null;
  } | null;
};

type NewsWithAuthor = {
  id: string;
  title_zh: string | null;
  title_en: string | null;
  published_at: string | null;
  published: boolean;
  admin_accounts: {
    username: string | null;
  } | null;
};

type EventRow = {
  id: string;
  title_zh: string | null;
  title_en: string | null;
  created_at: string | null;
  access_type: "members-only" | "all-welcome" | null;
  published: boolean | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "5", 10) || 5;
  const days = Number.parseInt(url.searchParams.get("days") ?? "7", 10) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const perQueryLimit = Math.max(limit * 3, limit);

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const registrationsPromise = supabase
      .from("event_registrations")
      .select(
        "id, name, created_at, event_id, events (title_zh, title_en)"
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(perQueryLimit);

    const membersPromise = supabase
      .from("members")
      .select("id, chinese_name, english_name, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(perQueryLimit);

    const newsPromise = supabase
      .from("articles")
      .select(
        "id, title_zh, title_en, published_at, published, admin_accounts (username)"
      )
      .eq("published", true)
      .gte("published_at", since)
      .order("published_at", { ascending: false })
      .limit(perQueryLimit);

    const eventsPromise = supabase
      .from("events")
      .select(
        "id, title_zh, title_en, created_at, access_type, published"
      )
      .eq("published", true)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(perQueryLimit);

    const [
      { data: regData, error: regError },
      { data: memberData, error: memberError },
      { data: newsData, error: newsError },
      { data: eventsData, error: eventsError },
    ] = await Promise.all([
      registrationsPromise,
      membersPromise,
      newsPromise,
      eventsPromise,
    ]);

    if (regError || memberError || newsError || eventsError) {
      console.error(
        "[activities] query error",
        regError || memberError || newsError || eventsError,
      );
      return new Response(
        JSON.stringify({ error: "Failed to fetch activities" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const registrations: Activity[] =
      regData?.map((r: RegistrationWithEvent) => {
        const event = r.events ?? { title_zh: null, title_en: null };
        const titleZh = event.title_zh ?? "";
        const titleEn = event.title_en ?? "";
        return {
          id: `registration-${r.id}`,
          type: "registration",
          timestamp: r.created_at,
          user: r.name || "Guest",
          action: {
            zh: titleZh ? `报名了“${titleZh}”` : "提交了活动报名",
            en: titleEn ? `registered for "${titleEn}"` : "registered for an event",
          },
          metadata: {
            event_id: r.event_id,
            title_zh: titleZh,
            title_en: titleEn,
          },
        };
      }) ?? [];

    const members: Activity[] =
      memberData?.map((m) => ({
        id: `member-${m.id}`,
        type: "member",
        timestamp: m.created_at ?? new Date().toISOString(),
        user: m.chinese_name || m.english_name || "Member",
        action: {
          zh: "提交了会员申请",
          en: "submitted membership application",
        },
        metadata: {
          member_id: m.id,
          chinese_name: m.chinese_name,
          english_name: m.english_name,
        },
      })) ?? [];

    const news: Activity[] =
      newsData?.map((n: NewsWithAuthor) => {
        const author = n.admin_accounts?.username || "Admin";
        return {
          id: `news-${n.id}`,
          type: "news",
          timestamp: n.published_at ?? new Date().toISOString(),
          user: author,
          action: {
            zh: n.title_zh ? `发布了新闻“${n.title_zh}”` : "发布了新闻",
            en: n.title_en ? `published news "${n.title_en}"` : "published news",
          },
          metadata: {
            article_id: n.id,
            title_zh: n.title_zh,
            title_en: n.title_en,
          },
        };
      }) ?? [];

    const events: Activity[] =
      eventsData?.map((e: EventRow) => {
        const titleZh = e.title_zh ?? "";
        const titleEn = e.title_en ?? "";
        const primaryTitle = titleZh || titleEn;

        const zhAction = primaryTitle
          ? `发布了活动“${primaryTitle}”`
          : "发布了活动";
        const enAction = primaryTitle
          ? `published event "${primaryTitle}"`
          : "published event";

        return {
          id: `event-${e.id}`,
          type: "event",
          timestamp: e.created_at ?? new Date().toISOString(),
          user: "Admin",
          action: {
            zh: zhAction,
            en: enAction,
          },
          metadata: {
            event_id: e.id,
            title_zh: titleZh || null,
            title_en: titleEn || null,
            access_type: e.access_type,
          },
        };
      }) ?? [];

    const activities = [...registrations, ...members, ...news, ...events]
      .filter((a) => a.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return new Response(JSON.stringify({ activities }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[activities] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
