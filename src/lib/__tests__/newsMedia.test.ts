import { describe, expect, it } from "vitest";
import {
  buildNewsImageEmbedHtml,
  buildNewsVideoEmbedHtml,
  hasInlineNewsDataMedia,
  insertNewsImageIntoEditor,
  isSupportedNewsImageType,
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

  it("accepts supported image mime types", () => {
    expect(isSupportedNewsImageType("image/jpeg")).toBe(true);
    expect(isSupportedNewsImageType("image/png")).toBe(true);
    expect(isSupportedNewsImageType("image/gif")).toBe(true);
    expect(isSupportedNewsImageType("image/webp")).toBe(true);
    expect(isSupportedNewsImageType("video/mp4")).toBe(false);
    expect(isSupportedNewsImageType("")).toBe(false);
  });

  it("detects inline data media that would bloat news payloads", () => {
    expect(
      hasInlineNewsDataMedia('<p><img src="data:image/png;base64,abc"></p>')
    ).toBe(true);
    expect(
      hasInlineNewsDataMedia('<video src="data:video/mp4;base64,abc">')
    ).toBe(true);
    expect(
      hasInlineNewsDataMedia('<p><img src="https://cdn.example.com/a.jpg"></p>')
    ).toBe(false);
  });

  it("builds image embed markup with URLs instead of data payloads", () => {
    expect(buildNewsImageEmbedHtml("https://cdn.example.com/demo.jpg")).toBe(
      '<p><img src="https://cdn.example.com/demo.jpg"></p>'
    );
  });

  it("builds playable video embed markup", () => {
    expect(buildNewsVideoEmbedHtml("https://cdn.example.com/demo.mp4")).toBe(
      '<p><video class="news-inline-video" controls preload="metadata" playsinline src="https://cdn.example.com/demo.mp4"></video></p>'
    );
  });

  it("inserts image URLs into the editor without base64 conversion", () => {
    const calls: unknown[] = [];
    const editor = {
      getSelection: () => ({ index: 3 }),
      getLength: () => 10,
      insertEmbed: (...args: unknown[]) => calls.push(["insertEmbed", args]),
      insertText: (...args: unknown[]) => calls.push(["insertText", args]),
      root: {
        innerHTML: '<p><img src="https://cdn.example.com/demo.jpg"></p>',
      },
    };

    expect(
      insertNewsImageIntoEditor(editor, "https://cdn.example.com/demo.jpg")
    ).toContain("https://cdn.example.com/demo.jpg");
    expect(calls).toEqual([
      ["insertEmbed", [3, "image", "https://cdn.example.com/demo.jpg", "user"]],
      ["insertText", [4, "\n", "user"]],
    ]);
  });
});
