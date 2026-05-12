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
  it("overrides Quill's default base64 image toolbar handler", () => {
    const onSelectImage = vi.fn();
    const modules = createNewsEditorModules(onSelectImage);
    const toolbar = modules.toolbar as {
      container: unknown[];
      handlers: { image: () => void };
    };

    expect(Array.isArray(modules.toolbar)).toBe(false);
    expect(toolbar.container).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["link", "image", "video"]),
      ])
    );

    toolbar.handlers.image();
    expect(onSelectImage).toHaveBeenCalledTimes(1);
  });
});
