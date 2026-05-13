export const NEWS_MEDIA_BUCKET = "news-media";
export const NEWS_MEDIA_OBJECT_PREFIX = "articles/";

const NEWS_MEDIA_SRC_REGEX = /<(?:img|video)\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>/gi;

export type NewsMediaReferenceFields = {
  cover_source?: string | null;
  cover_url?: string | null;
  content_zh?: string | null;
  content_en?: string | null;
};

function normalizeNewsMediaObjectPath(path: string) {
  const normalized = path.replace(/^\/+/, "");
  if (!normalized.startsWith(NEWS_MEDIA_OBJECT_PREFIX)) return null;
  if (normalized.includes("..")) return null;
  return normalized;
}

export function getNewsMediaObjectPath(value?: string | null) {
  const raw = value?.trim() ?? "";
  if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return null;

  if (raw.startsWith(NEWS_MEDIA_OBJECT_PREFIX)) {
    return normalizeNewsMediaObjectPath(raw);
  }

  try {
    const url = new URL(raw);
    const marker = `/storage/v1/object/public/${NEWS_MEDIA_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    const path = decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length)
    );
    return normalizeNewsMediaObjectPath(path);
  } catch {
    return null;
  }
}

export function collectNewsMediaObjectPathsFromHtml(value?: string | null) {
  const paths = new Set<string>();
  if (!value) return paths;

  for (const match of value.matchAll(NEWS_MEDIA_SRC_REGEX)) {
    const path = getNewsMediaObjectPath(match[2]);
    if (path) paths.add(path);
  }

  return paths;
}

export function collectNewsMediaObjectPaths(
  record: NewsMediaReferenceFields | null | undefined
) {
  const paths = new Set<string>();
  if (!record) return paths;

  [record.cover_source, record.cover_url].forEach((value) => {
    const path = getNewsMediaObjectPath(value);
    if (path) paths.add(path);
  });

  [record.content_zh, record.content_en].forEach((value) => {
    collectNewsMediaObjectPathsFromHtml(value).forEach((path) =>
      paths.add(path)
    );
  });

  return paths;
}
