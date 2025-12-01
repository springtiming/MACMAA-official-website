import type { VercelRequest, VercelResponse } from "@vercel/node";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = "https://api.unsplash.com";

type UnsplashPhoto = {
  id: string;
  description?: string | null;
  alt_description?: string | null;
  urls?: {
    raw?: string;
    full?: string;
    regular?: string;
    small?: string;
    thumb?: string;
  };
  user?: {
    name?: string;
    username?: string;
  };
  links?: {
    html?: string;
  };
};

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function pickPhotoFields(photo: UnsplashPhoto) {
  return {
    id: photo.id,
    description: photo.description ?? null,
    alt_description: photo.alt_description ?? null,
    urls: photo.urls ?? {},
    user: photo.user ?? {},
    links: photo.links ?? {},
  };
}

function parseAction(req: VercelRequest) {
  const queryAction = (req.query.route ??
    req.query.action ??
    req.query.type) as string | undefined;
  if (queryAction === "search" || queryAction === "random") {
    return queryAction;
  }

  if (req.url) {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last === "search" || last === "random") {
      return last;
    }
  }

  return null;
}

async function handleSearch(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.query as string | undefined)?.trim();
  const page = Math.max(Number(req.query.page ?? 1) || 1, 1);
  const perPageRaw = Number(req.query.per_page ?? req.query.perPage ?? 12);
  const perPage = Math.min(Math.max(perPageRaw || 12, 1), 30);

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const url = new URL(`${UNSPLASH_API_BASE}/search/photos`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const upstream = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "Unknown error");
    return res
      .status(upstream.status)
      .json({ error: "Unsplash search failed", detail });
  }

  const data = (await upstream.json()) as {
    total: number;
    total_pages: number;
    results: UnsplashPhoto[];
  };

  return res.status(200).json({
    total: data.total,
    total_pages: data.total_pages,
    results: (data.results ?? []).map(pickPhotoFields),
  });
}

async function handleRandom(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.query as string | undefined)?.trim();
  const count = Math.min(
    Math.max(Number(req.query.count ?? 1) || 1, 1),
    30
  );

  const url = new URL(`${UNSPLASH_API_BASE}/photos/random`);
  url.searchParams.set("count", String(count));
  if (query) {
    url.searchParams.set("query", query);
  }

  const upstream = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "Unknown error");
    return res
      .status(upstream.status)
      .json({ error: "Unsplash random failed", detail });
  }

  const payload = (await upstream.json()) as UnsplashPhoto | UnsplashPhoto[];
  const photos = Array.isArray(payload) ? payload : [payload];

  return res.status(200).json({
    results: photos.map(pickPhotoFields),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({ error: "Missing UNSPLASH_ACCESS_KEY" });
  }

  const action = parseAction(req);

  try {
    if (action === "search") {
      return await handleSearch(req, res);
    }
    if (action === "random") {
      return await handleRandom(req, res);
    }
    return res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error("[api.unsplash] unhandled", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
