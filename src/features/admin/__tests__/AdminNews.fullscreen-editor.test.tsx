/** @vitest-environment jsdom */

import React, { useState } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FullscreenEditorModal } from "../AdminNews";

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
        void onSelectFile(new File(["video"], "demo.mp4", { type: "video/mp4" }))
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

function FullscreenEditorHarness() {
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

  it("keeps uploaded video markup after exiting fullscreen", async () => {
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
      root?.render(<FullscreenEditorHarness />);
    });

    const uploadButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Trigger Upload")
    );

    expect(uploadButton).toBeTruthy();

    await act(async () => {
      uploadButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    const closeButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("退出全屏")
    );

    expect(closeButton).toBeTruthy();

    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const savedContent = document.querySelector("[data-testid='saved-content']");
    expect(savedContent?.textContent).toContain(
      "https://cdn.example.com/demo.mp4"
    );
  });
});
