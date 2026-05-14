import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { verifyAdminToken } from "../_shared/auth.ts";
import {
  collectNewsMediaObjectPaths,
  NEWS_MEDIA_BUCKET,
  NEWS_MEDIA_OBJECT_PREFIX,
} from "../../../shared/newsMediaStorage.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const cleanupSecret = Deno.env.get("NEWS_MEDIA_CLEANUP_SECRET")?.trim() ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cleanup-secret",
};

type SupabaseClient = ReturnType<typeof createClient>;

type StorageListItem = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_accessed_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type StorageFile = {
  path: string;
  timestamp: string | null;
};

type CleanupRequest = {
  dryRun?: boolean;
  olderThanHours?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!(await isAuthorized(req))) {
    return json({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const options = await parseCleanupRequest(req);
    const cutoffMs = Date.now() - options.olderThanHours * 60 * 60 * 1000;
    const referencedPaths = await fetchReferencedNewsMediaPaths(supabase);
    const files = await listNewsMediaStorageFiles(supabase, "articles");
    const candidates = files.filter((file) => {
      if (referencedPaths.has(file.path)) return false;
      if (!file.timestamp) return false;
      return new Date(file.timestamp).getTime() <= cutoffMs;
    });
    const deletedPaths = options.dryRun
      ? []
      : await removeNewsMediaStoragePaths(
          supabase,
          candidates.map((file) => file.path)
        );

    return json({
      dryRun: options.dryRun,
      olderThanHours: options.olderThanHours,
      referencedCount: referencedPaths.size,
      scannedCount: files.length,
      orphanCount: candidates.length,
      deletedCount: deletedPaths.length,
      candidates: candidates.map((file) => file.path),
      deletedPaths,
    });
  } catch (err) {
    console.error("[news-media-cleanup] unhandled", err);
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});

async function isAuthorized(req: Request) {
  if (cleanupSecret) {
    const authorization = req.headers.get("authorization") ?? "";
    const headerSecret = req.headers.get("x-cleanup-secret") ?? "";
    if (
      authorization === `Bearer ${cleanupSecret}` ||
      headerSecret === cleanupSecret
    ) {
      return true;
    }
  }

  return !!(await verifyAdminToken(req));
}

async function parseCleanupRequest(req: Request) {
  const url = new URL(req.url);
  const body =
    req.method === "POST"
      ? ((await req.json().catch(() => null)) as CleanupRequest | null)
      : null;
  const dryRunValue =
    body?.dryRun ?? parseBoolean(url.searchParams.get("dryRun"));
  const olderThanHoursValue =
    body?.olderThanHours ?? Number(url.searchParams.get("olderThanHours"));
  const olderThanHours =
    Number.isFinite(olderThanHoursValue) && olderThanHoursValue > 0
      ? olderThanHoursValue
      : 24;

  return {
    dryRun: dryRunValue ?? req.method === "GET",
    olderThanHours,
  };
}

function parseBoolean(value: string | null) {
  if (value === null) return undefined;
  if (["1", "true", "yes"].includes(value.toLowerCase())) return true;
  if (["0", "false", "no"].includes(value.toLowerCase())) return false;
  return undefined;
}

async function fetchReferencedNewsMediaPaths(supabase: SupabaseClient) {
  const paths = new Set<string>();
  const selectFields = "cover_source, cover_url, content_zh, content_en";
  const [articlesResult, draftsResult] = await Promise.all([
    supabase.from("articles").select(selectFields),
    supabase.from("article_versions").select(selectFields),
  ]);

  if (articlesResult.error) {
    throw articlesResult.error;
  }
  if (draftsResult.error) {
    throw draftsResult.error;
  }

  [...(articlesResult.data ?? []), ...(draftsResult.data ?? [])].forEach(
    (record) => {
      collectNewsMediaObjectPaths(record).forEach((path) => paths.add(path));
    }
  );

  return paths;
}

async function listNewsMediaStorageFiles(
  supabase: SupabaseClient,
  prefix: string
) {
  const files: StorageFile[] = [];
  const queue = [prefix.replace(/\/$/, "")];
  const limit = 1000;

  while (queue.length > 0) {
    const currentPrefix =
      queue.shift() ?? NEWS_MEDIA_OBJECT_PREFIX.replace(/\/$/, "");
    let offset = 0;

    while (true) {
      const { data, error } = await supabase.storage
        .from(NEWS_MEDIA_BUCKET)
        .list(currentPrefix, {
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        throw error;
      }

      const items = (data ?? []) as StorageListItem[];
      items.forEach((item) => {
        const path = `${currentPrefix}/${item.name}`;
        if (item.metadata === null) {
          queue.push(path);
          return;
        }
        files.push({ path, timestamp: getStorageTimestamp(item) });
      });

      if (items.length < limit) break;
      offset += limit;
    }
  }

  return files;
}

function getStorageTimestamp(item: StorageListItem) {
  return item.created_at ?? item.updated_at ?? item.last_accessed_at ?? null;
}

async function removeNewsMediaStoragePaths(
  supabase: SupabaseClient,
  paths: string[]
) {
  const deletedPaths: string[] = [];
  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);
    const { error } = await supabase.storage
      .from(NEWS_MEDIA_BUCKET)
      .remove(batch);
    if (error) {
      console.error("[news-media-cleanup] remove storage", error);
      continue;
    }
    deletedPaths.push(...batch);
  }
  return deletedPaths;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
