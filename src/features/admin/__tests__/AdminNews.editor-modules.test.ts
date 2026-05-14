import { describe, expect, it, vi } from "vitest";
import {
  blockInlineNewsMediaMatcher,
  createNewsEditorModules,
} from "../AdminNews";

vi.mock("react-quill", () => ({
  __esModule: true,
  default: {
    Quill: {
      import: () => ({ tagName: "VIDEO" }),
      register: vi.fn(),
    },
  },
}));

describe("admin news editor modules", () => {
  it("keeps media upload out of the editor toolbar", () => {
    const modules = createNewsEditorModules();
    const toolbar = modules.toolbar as unknown[];

    expect(Array.isArray(toolbar)).toBe(true);
    expect(toolbar).toEqual(
      expect.arrayContaining([expect.arrayContaining(["link"])])
    );
    expect(JSON.stringify(toolbar)).not.toContain("image");
    expect(JSON.stringify(toolbar)).not.toContain("video");
  });

  it("blocks pasted inline data media from entering the editor", () => {
    class DeltaMock {
      ops: unknown[];

      constructor(ops: unknown[] = []) {
        this.ops = ops;
      }
    }

    const delta = new DeltaMock([
      { insert: { image: "data:image/png;base64,abc" } },
    ]);
    const result = blockInlineNewsMediaMatcher(
      { getAttribute: () => "data:image/png;base64,abc" },
      delta
    );

    expect(result).toBeInstanceOf(DeltaMock);
    expect(result.ops).toEqual([]);
  });

  it("keeps URL-based media when pasting editor content", () => {
    const delta = {
      ops: [{ insert: { image: "https://cdn.example.com/a.jpg" } }],
    };
    const result = blockInlineNewsMediaMatcher(
      { getAttribute: () => "https://cdn.example.com/a.jpg" },
      delta
    );

    expect(result).toBe(delta);
  });
});
