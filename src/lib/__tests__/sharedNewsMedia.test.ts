import { describe, expect, it } from "vitest";
import {
  NEWS_VIDEO_ACCEPT,
  getSupportedNewsMediaType,
  hasPendingNewsMediaUploads,
} from "../../../shared/newsMedia";

describe("shared news media helpers", () => {
  it("exposes the video accept string used by upload controls", () => {
    expect(NEWS_VIDEO_ACCEPT).toBe("video/mp4,video/webm,video/ogg");
  });

  it("classifies supported news media without treating images as videos", () => {
    expect(getSupportedNewsMediaType("image/jpeg")).toBe("image");
    expect(getSupportedNewsMediaType("image/png")).toBe("image");
    expect(getSupportedNewsMediaType("video/mp4")).toBe("video");
    expect(getSupportedNewsMediaType("application/octet-stream")).toBeNull();
  });

  it("treats either language upload as a pending submission blocker", () => {
    expect(hasPendingNewsMediaUploads({ zh: false, en: false })).toBe(false);
    expect(hasPendingNewsMediaUploads({ zh: true, en: false })).toBe(true);
    expect(hasPendingNewsMediaUploads({ zh: false, en: true })).toBe(true);
  });
});
