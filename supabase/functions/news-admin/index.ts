import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";
import {
  collectNewsMediaObjectPaths,
  NEWS_MEDIA_BUCKET,
} from "../../../shared/newsMediaStorage.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

type SupabaseClient = ReturnType<typeof createClient>;

type StorageListItem = {
  name: string;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
};

async function listNewsMediaStoragePaths(
  supabase: SupabaseClient,
  prefix: string
) {
  const paths = new Set<string>();
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(NEWS_MEDIA_BUCKET)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("[news-admin] list media storage", error);
      break;
    }

    const items = (data ?? []) as StorageListItem[];
    items.forEach((item) => {
      if (item.metadata === null) return;
      paths.add(`${prefix}/${item.name}`);
    });

    if (items.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function removeNewsMediaStoragePaths(
  supabase: SupabaseClient,
  paths: string[]
) {
  if (paths.length === 0) return;

  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);
    const { error } = await supabase.storage
      .from(NEWS_MEDIA_BUCKET)
      .remove(batch);
    if (error) {
      console.error("[news-admin] remove media storage", error);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "DELETE") {
    return json({ error: "Method not allowed" }, 405);
  }

  const admin = await verifyAdminToken(req);
  if (!admin) {
    return json({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return json({ error: "Missing id" }, 400);
      }
      if (!UUID_REGEX.test(id)) {
        return json({ error: "Invalid id (expected UUID)" }, 400);
      }

      const { data: article, error: fetchArticleError } = await supabase
        .from("articles")
        .select("cover_source, cover_url, content_zh, content_en")
        .eq("id", id)
        .maybeSingle();

      if (fetchArticleError) {
        console.error("[news-admin] fetch before delete", fetchArticleError);
        return json(
          {
            error: "Failed to fetch article before delete",
            detail: fetchArticleError.message,
          },
          500
        );
      }

      const referencedMediaPaths = collectNewsMediaObjectPaths(article);
      const articleFolderMediaPaths = await listNewsMediaStoragePaths(
        supabase,
        `articles/${id}`
      );

      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) {
        console.error("[news-admin] delete", error);
        return json(
          {
            error: "Failed to delete article",
            detail: error.message,
            code: (error as { code?: string }).code,
            hint: (error as { hint?: string }).hint,
            details: (error as { details?: string }).details,
          },
          500
        );
      }

      await removeNewsMediaStoragePaths(supabase, [
        ...new Set([...referencedMediaPaths, ...articleFolderMediaPaths]),
      ]);

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, cover_type, cover_keyword, cover_url, published_at, published, author_id, view_count, like_count"
      )
      .order("published_at", { ascending: false });

    if (error) {
      console.error("[news-admin] list", error);
      return json(
        {
          error: "Failed to fetch news",
          detail: error.message,
          code: (error as { code?: string }).code,
          hint: (error as { hint?: string }).hint,
          details: (error as { details?: string }).details,
        },
        500
      );
    }

    return json({ articles: data ?? [] }, 200);
  } catch (err) {
    console.error("[news-admin] unhandled", err);
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
