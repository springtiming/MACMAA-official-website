export const NEWS_VIEW_DEDUPE_MS = 12 * 60 * 60 * 1000;

export function getNewsViewStorageKey(articleId: string) {
  return `macmaa.news.viewed.${articleId}`;
}

export function getNewsLikeStorageKey(articleId: string) {
  return `macmaa.news.liked.${articleId}`;
}

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function hasRecentNewsView(
  articleId: string,
  now = Date.now(),
  storage: Pick<Storage, "getItem"> | null = getBrowserStorage()
) {
  const storedValue = storage?.getItem(getNewsViewStorageKey(articleId));
  if (!storedValue) return false;
  const viewedAt = Number(storedValue);
  return Number.isFinite(viewedAt) && now - viewedAt < NEWS_VIEW_DEDUPE_MS;
}

export function rememberNewsView(
  articleId: string,
  now = Date.now(),
  storage: Pick<Storage, "setItem"> | null = getBrowserStorage()
) {
  storage?.setItem(getNewsViewStorageKey(articleId), String(now));
}

export function isNewsArticleLiked(
  articleId: string,
  storage: Pick<Storage, "getItem"> | null = getBrowserStorage()
) {
  return storage?.getItem(getNewsLikeStorageKey(articleId)) === "true";
}

export function rememberNewsArticleLike(
  articleId: string,
  liked: boolean,
  storage: Pick<Storage, "setItem" | "removeItem"> | null = getBrowserStorage()
) {
  if (liked) {
    storage?.setItem(getNewsLikeStorageKey(articleId), "true");
    return;
  }
  storage?.removeItem(getNewsLikeStorageKey(articleId));
}

export function formatNewsEngagementCount(
  count: number | null | undefined,
  language: "zh" | "en"
) {
  const numericCount = Number(count ?? 0);
  return Math.max(
    0,
    Number.isFinite(numericCount) ? numericCount : 0
  ).toLocaleString(language === "zh" ? "zh-CN" : "en-US");
}
