import { describe, expect, it } from "vitest";
import {
  NEWS_VIDEO_ACCEPT,
  hasPendingNewsMediaUploads,
} from "../../../shared/newsMedia";

describe("shared news media helpers", () => {
  it("exposes the video accept string used by upload controls", () => {
    expect(NEWS_VIDEO_ACCEPT).toBe("video/mp4,video/webm,video/ogg");
  });

  it("treats either language upload as a pending submission blocker", () => {
    expect(hasPendingNewsMediaUploads({ zh: false, en: false })).toBe(false);
    expect(hasPendingNewsMediaUploads({ zh: true, en: false })).toBe(true);
    expect(hasPendingNewsMediaUploads({ zh: false, en: true })).toBe(true);
  });
});
