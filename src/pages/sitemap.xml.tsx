import type { GetServerSideProps } from "next";
import { getSupabaseClient, logSupabaseError } from "@/lib/supabaseClient";
import { absoluteUrl } from "@/lib/seo/config";

type NewsSitemapRecord = {
  id: string;
  published_at: string | null;
};

type EventSitemapRecord = {
  id: string;
  updated_at: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrl(input: { loc: string; lastmod?: string | null }) {
  const loc = escapeXml(input.loc);
  const lastmod = input.lastmod?.trim()
    ? escapeXml(input.lastmod.trim())
    : null;
  return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
}

function buildSitemapXml(
  urls: Array<{ loc: string; lastmod?: string | null }>
) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  ${renderUrl(url)}`)
    .join("\n")}\n</urlset>\n`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const supabase = getSupabaseClient();

  const staticPaths = ["/", "/about", "/membership", "/news", "/events"];
  const urls: Array<{ loc: string; lastmod?: string | null }> = staticPaths.map(
    (path) => ({ loc: absoluteUrl(path) })
  );

  try {
    const [newsResult, eventsResult] = await Promise.all([
      supabase
        .from("articles")
        .select("id, published_at")
        .eq("published", true),
      supabase.from("events").select("id, updated_at").eq("published", true),
    ]);

    if (newsResult.error) {
      logSupabaseError("sitemap:articles", newsResult.error);
    } else {
      const news = (newsResult.data ?? []) as NewsSitemapRecord[];
      urls.push(
        ...news.map((item) => ({
          loc: absoluteUrl(`/news/${item.id}`),
          lastmod: item.published_at,
        }))
      );
    }

    if (eventsResult.error) {
      logSupabaseError("sitemap:events", eventsResult.error);
    } else {
      const events = (eventsResult.data ?? []) as EventSitemapRecord[];
      urls.push(
        ...events.map((item) => ({
          loc: absoluteUrl(`/events/${item.id}`),
          lastmod: item.updated_at,
        }))
      );
    }
  } catch (err) {
    logSupabaseError("sitemap:build", err as Error);
  }

  const xml = buildSitemapXml(urls);

  res.setHeader("Content-Type", "text/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
