/** @vitest-environment jsdom */

import React, { useState } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { createNewsEditorModules, FullscreenEditorModal } from "../AdminNews";

const NEWS_MEDIA_DRAG_TYPE = "application/x-macmaa-news-media";

type TestMediaAsset = {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
};

vi.mock("motion/react", async () => {
  const React = await import("react");

  const passthrough = ({ children, ...props }: Record<string, unknown>) => {
    const { initial, animate, exit, transition, ...domProps } = props;
    void initial;
    void animate;
    void exit;
    void transition;

    return React.createElement(
      "div",
      domProps as React.HTMLAttributes<HTMLDivElement>,
      children as React.ReactNode
    );
  };

  return {
    AnimatePresence: passthrough,
    motion: {
      div: passthrough,
    },
  };
});

vi.mock("@/components/admin/NewsVideoUploadControl", () => ({
  NewsVideoUploadControl: ({
    onSelectFile,
  }: {
    onSelectFile: (file: File) => Promise<string | null> | void;
  }) => (
    <button
      type="button"
      onClick={() =>
        void onSelectFile(
          new File(["video"], "demo.mp4", { type: "video/mp4" })
        )
      }
    >
      Trigger Upload
    </button>
  ),
}));

vi.mock("react-quill", async () => {
  const React = await import("react");

  const MockReactQuill = React.forwardRef<
    unknown,
    {
      value: string;
      onChange: (value: string) => void;
      className?: string;
    }
  >(({ value, onChange, className }, _ref) => (
    <textarea
      data-testid="mock-react-quill"
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ));
  MockReactQuill.displayName = "MockReactQuill";

  return {
    __esModule: true,
    default: Object.assign(MockReactQuill, {
      Quill: {
        import: () => ({ tagName: "VIDEO" }),
        register: vi.fn(),
      },
    }),
  };
});

function FullscreenEditorHarness({
  mediaAssets = [],
  onUploadMediaAsset = async () => null,
}: {
  mediaAssets?: TestMediaAsset[];
  onUploadMediaAsset?: (file: File) => Promise<TestMediaAsset | null>;
}) {
  const [content, setContent] = useState("<p>Initial</p>");
  const [open, setOpen] = useState(true);

  return (
    <LanguageProvider>
      {open ? (
        <FullscreenEditorModal
          lang="zh"
          content={content}
          onChange={setContent}
          onSave={() => setOpen(false)}
          onClose={() => setOpen(false)}
          modules={{ toolbar: [] }}
          formats={[]}
          uploading={false}
          uploadError={null}
          mediaAssets={mediaAssets}
          mediaLibraryUploading={false}
          mediaLibraryError={null}
          onUploadMediaAsset={onUploadMediaAsset}
          onSelectImage={async () => "https://cdn.example.com/demo.jpg"}
          onSelectVideo={async () => "https://cdn.example.com/demo.mp4"}
        />
      ) : (
        <div data-testid="saved-content">{content}</div>
      )}
    </LanguageProvider>
  );
}

describe("FullscreenEditorModal", () => {
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
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  async function renderFullscreenEditor(
    props: React.ComponentProps<typeof FullscreenEditorHarness> = {}
  ) {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "zh-CN",
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<FullscreenEditorHarness {...props} />);
    });
  }

  async function closeFullscreenEditor() {
    const closeButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("退出全屏")
    );

    expect(closeButton).toBeTruthy();

    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

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

  it("keeps uploaded video markup after exiting fullscreen", async () => {
    await renderFullscreenEditor();

    const uploadButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Trigger Upload")
    );

    expect(uploadButton).toBeTruthy();

    await act(async () => {
      uploadButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    await closeFullscreenEditor();

    const savedContent = document.querySelector(
      "[data-testid='saved-content']"
    );
    expect(savedContent?.textContent).toContain(
      "https://cdn.example.com/demo.mp4"
    );
  });

  it("inserts a reusable media library image without uploading it again", async () => {
    const onUploadMediaAsset = vi.fn(async () => null);
    await renderFullscreenEditor({
      onUploadMediaAsset,
      mediaAssets: [
        {
          id: "image:https://cdn.example.com/reusable.jpg",
          type: "image",
          url: "https://cdn.example.com/reusable.jpg",
          name: "Reusable image",
        },
      ],
    });

    const insertButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("插入中文")
    );
    expect(insertButton).toBeTruthy();

    await act(async () => {
      insertButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await closeFullscreenEditor();

    const savedContent = document.querySelector(
      "[data-testid='saved-content']"
    );
    expect(savedContent?.textContent).toContain(
      "https://cdn.example.com/reusable.jpg"
    );
    expect(savedContent?.textContent).toContain("img");
    expect(onUploadMediaAsset).not.toHaveBeenCalled();
  });

  it("accepts dragged reusable media assets in the fullscreen editor", async () => {
    await renderFullscreenEditor();

    const dropTarget = document.querySelector(
      ".news-fullscreen-editor"
    )?.parentElement;
    expect(dropTarget).toBeTruthy();

    const dropEvent = new Event("drop", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        getData: (type: string) =>
          type === NEWS_MEDIA_DRAG_TYPE
            ? JSON.stringify({
                id: "video:https://cdn.example.com/reusable.mp4",
                type: "video",
                url: "https://cdn.example.com/reusable.mp4",
                name: "Reusable video",
              })
            : "",
      },
    });

    await act(async () => {
      dropTarget?.dispatchEvent(dropEvent);
    });

    await closeFullscreenEditor();

    const savedContent = document.querySelector(
      "[data-testid='saved-content']"
    );
    expect(savedContent?.textContent).toContain(
      "https://cdn.example.com/reusable.mp4"
    );
    expect(savedContent?.textContent).toContain("video");
  });

  it("keeps the fullscreen editor scroll styling hook", async () => {
    await renderFullscreenEditor();

    const editor = document.querySelector("[data-testid='mock-react-quill']");
    expect(editor?.className).toContain("news-fullscreen-editor");
  });
});
