import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("news engagement API", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("records article views through the news-engagement Edge Function", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ viewCount: 8, likeCount: 3 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { recordNewsArticleView } = await import("../supabaseApi");
    const result = await recordNewsArticleView(
      "11111111-1111-4111-8111-111111111111"
    );

    expect(result).toEqual({ viewCount: 8, likeCount: 3 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/news-engagement",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          articleId: "11111111-1111-4111-8111-111111111111",
          action: "view",
        }),
      })
    );
  });

  it("toggles article likes through the news-engagement Edge Function", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ viewCount: 8, likeCount: 4 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { updateNewsArticleLike } = await import("../supabaseApi");
    await updateNewsArticleLike("11111111-1111-4111-8111-111111111111", true);
    await updateNewsArticleLike("11111111-1111-4111-8111-111111111111", false);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://example.supabase.co/functions/v1/news-engagement",
      expect.objectContaining({
        body: JSON.stringify({
          articleId: "11111111-1111-4111-8111-111111111111",
          action: "like",
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://example.supabase.co/functions/v1/news-engagement",
      expect.objectContaining({
        body: JSON.stringify({
          articleId: "11111111-1111-4111-8111-111111111111",
          action: "unlike",
        }),
      })
    );
  });
});
