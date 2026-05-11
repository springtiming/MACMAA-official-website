import { describe, expect, it } from "vitest";
import { saveNewsDraft } from "../supabaseApi";

describe("saveNewsDraft media safety", () => {
  it("rejects inline base64 media before building the JSON request body", async () => {
    await expect(
      saveNewsDraft({
        title_zh: "测试新闻",
        title_en: "Test News",
        summary_zh: "摘要",
        summary_en: "Summary",
        content_zh: '<p><img src="data:image/png;base64,abc"></p>',
        content_en: "<p>Content</p>",
      })
    ).rejects.toThrow("Inline base64 media is not supported");
  });
});
