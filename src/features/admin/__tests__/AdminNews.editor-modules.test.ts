import { describe, expect, it, vi } from "vitest";
import { createNewsEditorModules } from "../AdminNews";

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
});
