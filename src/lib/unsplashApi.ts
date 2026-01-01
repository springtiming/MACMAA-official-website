export type UnsplashPhoto = {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw?: string;
    full?: string;
    regular?: string;
    small?: string;
    thumb?: string;
  };
  user: {
    name?: string;
    username?: string;
  };
  links: {
    html?: string;
  };
};

export type UnsplashSearchResponse = {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
};

async function requestUnsplash<T>(
  endpoint: "search" | "random",
  params: Record<string, string | number | undefined>
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars for Unsplash proxy");
  }

  const url = new URL(
    `${supabaseUrl.replace(/\/$/, "")}/functions/v1/unsplash/${endpoint}`
  );
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Unsplash ${endpoint} request failed`);
  }

  return (await res.json()) as T;
}

export async function searchPhotos(
  query: string,
  page = 1,
  perPage = 12
): Promise<UnsplashSearchResponse> {
  return requestUnsplash<UnsplashSearchResponse>("search", {
    query,
    page,
    per_page: perPage,
  });
}

export async function getRandomPhoto(
  query?: string,
  count = 1
): Promise<UnsplashPhoto[]> {
  const data = await requestUnsplash<{ results: UnsplashPhoto[] }>("random", {
    query: query || undefined,
    count,
  });
  return data.results;
}
