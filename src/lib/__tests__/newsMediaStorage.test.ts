import { describe, expect, it } from "vitest";
import {
  collectNewsMediaObjectPaths,
  collectNewsMediaObjectPathsFromHtml,
  getNewsMediaObjectPath,
} from "../../../shared/newsMediaStorage";

describe("newsMediaStorage", () => {
  it("extracts news-media object paths from public storage URLs", () => {
    expect(
      getNewsMediaObjectPath(
        "https://vnjplsgluxhfkafyzrcs.supabase.co/storage/v1/object/public/news-media/articles/article-1/photo.jpg"
      )
    ).toBe("articles/article-1/photo.jpg");
  });

  it("ignores external, inline, and unsafe paths", () => {
    expect(
      getNewsMediaObjectPath("https://cdn.example.com/photo.jpg")
    ).toBeNull();
    expect(getNewsMediaObjectPath("data:image/png;base64,abc")).toBeNull();
    expect(getNewsMediaObjectPath("articles/../secret.jpg")).toBeNull();
  });

  it("collects media paths from article fields and html content", () => {
    const html =
      '<p><img src="https://vnjplsgluxhfkafyzrcs.supabase.co/storage/v1/object/public/news-media/articles/article-1/body.jpg"></p>' +
      '<p><video src="https://vnjplsgluxhfkafyzrcs.supabase.co/storage/v1/object/public/news-media/articles/article-1/clip.mp4"></video></p>';

    expect([...collectNewsMediaObjectPathsFromHtml(html)]).toEqual([
      "articles/article-1/body.jpg",
      "articles/article-1/clip.mp4",
    ]);
    expect([
      ...collectNewsMediaObjectPaths({
        cover_url:
          "https://vnjplsgluxhfkafyzrcs.supabase.co/storage/v1/object/public/news-media/articles/article-1/cover.jpg",
        content_zh: html,
      }),
    ]).toEqual([
      "articles/article-1/cover.jpg",
      "articles/article-1/body.jpg",
      "articles/article-1/clip.mp4",
    ]);
  });
});
