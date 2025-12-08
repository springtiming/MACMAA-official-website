import { describe, expect, it } from "vitest";
import {
  buildUnsplashUrl,
  formatEventDateTime,
  pickLocalized,
  resolveEventImage,
  resolveNewsCover,
} from "../supabaseHelpers";

describe("supabaseHelpers", () => {
  it("picks localized text with fallback", () => {
    expect(pickLocalized("中文", "English", "zh")).toBe("中文");
    expect(pickLocalized("中文", "English", "en")).toBe("English");
    expect(pickLocalized(null, "English", "zh")).toBe("English");
    expect(pickLocalized("中文", null, "en")).toBe("中文");
  });

  it("builds Unsplash URLs by size", () => {
    expect(buildUnsplashUrl("community", "thumb")).toContain("800x600");
    expect(buildUnsplashUrl("community", "hero")).toContain("1200x675");
  });

  it("resolves news cover preferring url then keyword", () => {
    const keywordUrl = resolveNewsCover(null, "thumb", "hello world", null);
    expect(keywordUrl).toContain("hello%20world");

    const directUrl = resolveNewsCover(
      null,
      "hero",
      "hello world",
      "https://example.com/image.png"
    );
    expect(directUrl).toBe("https://example.com/image.png");
  });

  it("resolves event images preferring uploaded URL", () => {
    const upload = resolveEventImage(
      "upload",
      null,
      "/uploads/image.png",
      "thumb"
    );
    expect(upload).toBe("/uploads/image.png");

    const keyword = resolveEventImage(
      "unsplash",
      "culture event",
      null,
      "hero"
    );
    expect(keyword).toContain("culture%20event");
  });

  it("formats event date and time ranges", () => {
    expect(
      formatEventDateTime("2025-04-10", "14:00:00", "16:00:00", "en")
    ).toContain("14:00");
    expect(formatEventDateTime("2025-04-10", "14:00:00", null, "zh")).toContain(
      "14:00"
    );
  });
});
