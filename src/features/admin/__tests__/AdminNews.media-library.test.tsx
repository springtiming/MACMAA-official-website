/** @vitest-environment jsdom */

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsMediaLibrary, type NewsMediaAsset } from "../AdminNews";

vi.mock("react-quill", () => ({
  __esModule: true,
  default: {
    Quill: {
      import: () => ({ tagName: "VIDEO" }),
      register: vi.fn(),
    },
  },
}));

const NEWS_MEDIA_DRAG_TYPE = "application/x-macmaa-news-media";

describe("NewsMediaLibrary", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
    vi.clearAllMocks();
  });

  async function renderMediaLibrary({
    assets,
    onInsertAsset = vi.fn(),
  }: {
    assets: NewsMediaAsset[];
    onInsertAsset?: (lang: "zh" | "en", asset: NewsMediaAsset) => void;
  }) {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <NewsMediaLibrary
          assets={assets}
          language="en"
          uploading={false}
          error={null}
          onUploadFile={vi.fn()}
          onInsertAsset={onInsertAsset}
          targets={[
            { lang: "zh", label: "Insert Chinese" },
            { lang: "en", label: "Insert English" },
          ]}
        />
      );
    });

    return { onInsertAsset };
  }

  it("reuses one uploaded asset for both language editors", async () => {
    const asset: NewsMediaAsset = {
      id: "image:https://cdn.example.com/reusable.jpg",
      type: "image",
      url: "https://cdn.example.com/reusable.jpg",
      name: "Reusable image",
    };
    const onInsertAsset = vi.fn();
    await renderMediaLibrary({ assets: [asset], onInsertAsset });

    const buttons = Array.from(document.querySelectorAll("button"));
    const insertChinese = buttons.find((button) =>
      button.textContent?.includes("Insert Chinese")
    );
    const insertEnglish = buttons.find((button) =>
      button.textContent?.includes("Insert English")
    );

    expect(insertChinese).toBeTruthy();
    expect(insertEnglish).toBeTruthy();

    await act(async () => {
      insertChinese?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      insertEnglish?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onInsertAsset).toHaveBeenNthCalledWith(1, "zh", asset);
    expect(onInsertAsset).toHaveBeenNthCalledWith(2, "en", asset);
  });

  it("renders compact square thumbnails instead of large image cards", async () => {
    const asset: NewsMediaAsset = {
      id: "image:https://cdn.example.com/reusable.jpg",
      type: "image",
      url: "https://cdn.example.com/reusable.jpg",
      name: "Reusable image",
    };
    await renderMediaLibrary({ assets: [asset] });

    const image = document.querySelector("img");
    const thumbnail = image?.parentElement;

    expect(thumbnail?.className).toContain("h-14");
    expect(thumbnail?.className).toContain("w-14");
  });

  it("provides reusable media data when dragging assets", async () => {
    const asset: NewsMediaAsset = {
      id: "video:https://cdn.example.com/reusable.mp4",
      type: "video",
      url: "https://cdn.example.com/reusable.mp4",
      name: "Reusable video",
    };
    await renderMediaLibrary({ assets: [asset] });

    const dragTarget = document.querySelector("[draggable='true']");
    expect(dragTarget).toBeTruthy();

    const data = new Map<string, string>();
    const dataTransfer = {
      effectAllowed: "",
      setData: vi.fn((type: string, value: string) => data.set(type, value)),
    };
    const event = new Event("dragstart", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: dataTransfer });

    await act(async () => {
      dragTarget?.dispatchEvent(event);
    });

    expect(dataTransfer.effectAllowed).toBe("copy");
    expect(data.get(NEWS_MEDIA_DRAG_TYPE)).toBe(JSON.stringify(asset));
    expect(data.get("text/plain")).toBe(asset.url);
    expect(data.get("text/html")).toContain(asset.url);
  });
});
