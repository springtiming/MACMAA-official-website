import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseServiceClient,
  logSupabaseError,
} from "../_supabaseAdminClient.js";

type ActivityType = "registration" | "member" | "news";

type Activity = {
  id: string;
  type: ActivityType;
  timestamp: string;
  user: string;
  action: { zh: string; en: string };
  metadata: Record<string, unknown>;
};

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  setCors(res);

  const limit = parseInt(String(req.query.limit ?? "5"), 10) || 5;
  const days = parseInt(String(req.query.days ?? "7"), 10) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const perQueryLimit = Math.max(limit * 3, limit);

  try {
    const supabase = getSupabaseServiceClient();

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
      .select(
        "id, chinese_name, english_name, created_at"
      )
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

    const [{ data: regData, error: regError }, { data: memberData, error: memberError }, { data: newsData, error: newsError }] =
      await Promise.all([registrationsPromise, membersPromise, newsPromise]);

    if (regError || memberError || newsError) {
      logSupabaseError("api.activities.query", regError || memberError || newsError);
      return res.status(500).json({ error: "Failed to fetch activities" });
    }

    const registrations: Activity[] =
      regData?.map((r) => {
        const titleZh = (r as any).events?.title_zh ?? "";
        const titleEn = (r as any).events?.title_en ?? "";
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
      newsData?.map((n) => {
        const author = (n as any).admin_accounts?.username || "Admin";
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

    const activities = [...registrations, ...members, ...news]
      .filter((a) => a.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return res.status(200).json({ activities });
  } catch (err) {
    logSupabaseError("api.activities.unhandled", err as Error);
    return res.status(500).json({
      error: "Internal error",
      detail: (err as Error).message,
    });
  }
}
