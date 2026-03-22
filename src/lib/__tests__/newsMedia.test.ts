import { describe, expect, it } from "vitest";
import {
  buildNewsVideoEmbedHtml,
  isSupportedNewsVideoType,
} from "../newsMedia";

describe("newsMedia", () => {
  it("accepts supported video mime types", () => {
    expect(isSupportedNewsVideoType("video/mp4")).toBe(true);
    expect(isSupportedNewsVideoType("video/webm")).toBe(true);
    expect(isSupportedNewsVideoType("video/ogg")).toBe(true);
    expect(isSupportedNewsVideoType("image/png")).toBe(false);
    expect(isSupportedNewsVideoType("")).toBe(false);
  });

  it("builds playable video embed markup", () => {
    expect(buildNewsVideoEmbedHtml("https://cdn.example.com/demo.mp4")).toBe(
      '<p><video class="news-inline-video" controls preload="metadata" playsinline src="https://cdn.example.com/demo.mp4"></video></p>'
    );
  });
});
