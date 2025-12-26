const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") ?? "";
const UNSPLASH_API_BASE = "https://api.unsplash.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

function parseAction(req: Request) {
  const url = new URL(req.url);
  const queryAction =
    url.searchParams.get("route") ??
    url.searchParams.get("action") ??
    url.searchParams.get("type");
  if (queryAction === "search" || queryAction === "random") {
    return queryAction;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last === "search" || last === "random") {
    return last;
  }

  return null;
}

async function handleSearch(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();
  const page = Math.max(Number(url.searchParams.get("page") ?? 1) || 1, 1);
  const perPageRaw = Number(
    url.searchParams.get("per_page") ?? url.searchParams.get("perPage") ?? 12
  );
  const perPage = Math.min(Math.max(perPageRaw || 12, 1), 30);

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Missing query parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const upstreamUrl = new URL(`${UNSPLASH_API_BASE}/search/photos`);
  upstreamUrl.searchParams.set("query", query);
  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("per_page", String(perPage));

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "Unknown error");
    return new Response(
      JSON.stringify({ error: "Unsplash search failed", detail }),
      { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const data = (await upstream.json()) as {
    total: number;
    total_pages: number;
    results: UnsplashPhoto[];
  };

  return new Response(
    JSON.stringify({
      total: data.total,
      total_pages: data.total_pages,
      results: (data.results ?? []).map(pickPhotoFields),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

async function handleRandom(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();
  const count = Math.min(
    Math.max(Number(url.searchParams.get("count") ?? 1) || 1, 1),
    30
  );

  const upstreamUrl = new URL(`${UNSPLASH_API_BASE}/photos/random`);
  upstreamUrl.searchParams.set("count", String(count));
  if (query) {
    upstreamUrl.searchParams.set("query", query);
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "Unknown error");
    return new Response(
      JSON.stringify({ error: "Unsplash random failed", detail }),
      { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const payload = (await upstream.json()) as UnsplashPhoto | UnsplashPhoto[];
  const photos = Array.isArray(payload) ? payload : [payload];

  return new Response(
    JSON.stringify({
      results: photos.map(pickPhotoFields),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

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

  if (!UNSPLASH_ACCESS_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing UNSPLASH_ACCESS_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const action = parseAction(req);
  try {
    if (action === "search") {
      return await handleSearch(req);
    }
    if (action === "random") {
      return await handleRandom(req);
    }
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[unsplash] unhandled", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
