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
    onRemoveAsset = vi.fn(),
    onCancelUpload = vi.fn(),
    uploadingAssets = [],
  }: {
    assets: NewsMediaAsset[];
    onInsertAsset?: (lang: "zh" | "en", asset: NewsMediaAsset) => void;
    onRemoveAsset?: (assetId: string) => void;
    onCancelUpload?: (uploadId: string) => void;
    uploadingAssets?: Array<{
      id: string;
      type: "image" | "video";
      name: string;
      progress: number;
    }>;
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
          uploading={uploadingAssets.length > 0}
          uploadingAssets={uploadingAssets}
          error={null}
          onUploadFile={vi.fn()}
          onInsertAsset={onInsertAsset}
          onRemoveAsset={onRemoveAsset}
          onCancelUpload={onCancelUpload}
          targets={[
            { lang: "zh", label: "Insert Chinese" },
            { lang: "en", label: "Insert English" },
          ]}
        />
      );
    });

    return { onInsertAsset, onRemoveAsset, onCancelUpload };
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
    expect(image?.getAttribute("loading")).toBe("lazy");
    expect(image?.getAttribute("decoding")).toBe("async");
  });

  it("renders video thumbnails with metadata-only preload", async () => {
    const asset: NewsMediaAsset = {
      id: "video:https://cdn.example.com/reusable.mp4",
      type: "video",
      url: "https://cdn.example.com/reusable.mp4",
      name: "Reusable video",
    };
    await renderMediaLibrary({ assets: [asset] });

    const video = document.querySelector("video");
    expect(video?.getAttribute("preload")).toBe("metadata");
    expect(video?.getAttribute("src")).toBe(`${asset.url}#t=0.1`);
  });

  it("uses fixed opaque cards and can remove assets", async () => {
    const asset: NewsMediaAsset = {
      id: "image:https://cdn.example.com/reusable.jpg",
      type: "image",
      url: "https://cdn.example.com/reusable.jpg",
      name: "1778639231189-737b4fd3-95f5-47b0-bf3e-e4400684-long-name.jpg",
    };
    const onRemoveAsset = vi.fn();
    await renderMediaLibrary({ assets: [asset], onRemoveAsset });

    const card = document.querySelector("article") as HTMLElement | null;
    expect(card?.style.width).toBe("260px");
    expect(card?.style.minWidth).toBe("260px");
    expect(card?.style.maxWidth).toBe("260px");
    expect(card?.style.height).toBe("78px");
    expect(card?.className).toContain("bg-white");

    const removeButton = document.querySelector(
      'button[aria-label="Remove media asset"]'
    ) as HTMLButtonElement | null;
    expect(removeButton?.style.top).toBe("4px");
    expect(removeButton?.style.right).toBe("4px");
    await act(async () => {
      removeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onRemoveAsset).toHaveBeenCalledWith(asset.id);
  });

  it("keeps long and short named asset cards the same width", async () => {
    await renderMediaLibrary({
      assets: [
        {
          id: "image:https://cdn.example.com/long.jpg",
          type: "image",
          url: "https://cdn.example.com/long.jpg",
          name: "1778639231189-737b4fd3-95f5-47b0-bf3e-e4400684-very-long-name.jpg",
        },
        {
          id: "image:https://cdn.example.com/short.jpg",
          type: "image",
          url: "https://cdn.example.com/short.jpg",
          name: "hero.jpg",
        },
      ],
    });

    const cardWidths = Array.from(document.querySelectorAll("article")).map(
      (card) => (card as HTMLElement).style.width
    );

    expect(cardWidths).toEqual(["260px", "260px"]);
    const longName = document.querySelector(
      "p[title*='very-long-name']"
    ) as HTMLParagraphElement | null;
    expect(longName?.style.whiteSpace).toBe("nowrap");
    expect(longName?.style.textOverflow).toBe("ellipsis");
  });

  it("shows upload progress cards and supports cancelling uploads", async () => {
    const onCancelUpload = vi.fn();
    await renderMediaLibrary({
      assets: [],
      onCancelUpload,
      uploadingAssets: [
        {
          id: "upload:1",
          type: "video",
          name: "clip.mp4",
          progress: 42,
        },
      ],
    });

    expect(document.body.textContent).toContain("Uploading...");
    expect(document.body.textContent).toContain("42%");
    expect(
      (document.querySelector("article") as HTMLElement | null)?.style.width
    ).toBe("260px");
    expect(
      (document.querySelector("article") as HTMLElement | null)?.style.height
    ).toBe("78px");

    const cancelButton = document.querySelector(
      'button[aria-label="Cancel media upload"]'
    ) as HTMLButtonElement | null;
    expect(cancelButton?.style.top).toBe("4px");
    expect(cancelButton?.style.right).toBe("4px");
    await act(async () => {
      cancelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onCancelUpload).toHaveBeenCalledWith("upload:1");
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
