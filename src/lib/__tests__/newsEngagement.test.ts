import { describe, expect, it } from "vitest";
import {
  NEWS_VIEW_DEDUPE_MS,
  formatNewsEngagementCount,
  getNewsLikeStorageKey,
  getNewsViewStorageKey,
  hasRecentNewsView,
  isNewsArticleLiked,
  rememberNewsArticleLike,
  rememberNewsView,
} from "../newsEngagement";

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  };
}

describe("newsEngagement", () => {
  it("deduplicates view tracking within the configured window", () => {
    const storage = createStorage();
    const articleId = "article-1";
    const now = 1_000_000;

    expect(hasRecentNewsView(articleId, now, storage)).toBe(false);
    rememberNewsView(articleId, now, storage);
    expect(storage.getItem(getNewsViewStorageKey(articleId))).toBe(String(now));
    expect(
      hasRecentNewsView(articleId, now + NEWS_VIEW_DEDUPE_MS - 1, storage)
    ).toBe(true);
    expect(
      hasRecentNewsView(articleId, now + NEWS_VIEW_DEDUPE_MS + 1, storage)
    ).toBe(false);
  });

  it("stores and clears local like state", () => {
    const storage = createStorage();
    const articleId = "article-1";

    expect(isNewsArticleLiked(articleId, storage)).toBe(false);
    rememberNewsArticleLike(articleId, true, storage);
    expect(storage.getItem(getNewsLikeStorageKey(articleId))).toBe("true");
    expect(isNewsArticleLiked(articleId, storage)).toBe(true);
    rememberNewsArticleLike(articleId, false, storage);
    expect(isNewsArticleLiked(articleId, storage)).toBe(false);
  });

  it("formats counts for the active language without negative values", () => {
    expect(formatNewsEngagementCount(1240, "zh")).toBe("1,240");
    expect(formatNewsEngagementCount(1240, "en")).toBe("1,240");
    expect(formatNewsEngagementCount(-3, "en")).toBe("0");
  });
});
