import {
  buildNewsVideoEmbedHtml,
  hasPendingNewsMediaUploads,
  isSupportedNewsVideoType,
  NEWS_VIDEO_ACCEPT,
  SUPPORTED_NEWS_VIDEO_TYPES,
  type NewsMediaUploadState,
} from "../../shared/newsMedia";

type QuillNamespace = {
  import: (path: string) => any;
  register: (...args: any[]) => void;
};

type QuillEditor = {
  getSelection: (...args: any[]) => { index: number } | null;
  getLength: () => number;
  insertEmbed: (...args: any[]) => void;
  insertText: (...args: any[]) => void;
  root: { innerHTML: string };
};

let blotRegistered = false;

export function ensureNewsVideoBlotRegistered(quill: QuillNamespace) {
  if (blotRegistered) return;

  const BaseVideoBlot = quill.import("formats/video");
  if (BaseVideoBlot.tagName === "VIDEO") {
    blotRegistered = true;
    return;
  }

  class Html5VideoBlot extends BaseVideoBlot {
    static create(value: string) {
      const node = super.create(value) as HTMLVideoElement;
      node.setAttribute("src", value);
      node.setAttribute("controls", "true");
      node.setAttribute("preload", "metadata");
      node.setAttribute("playsinline", "true");
      node.setAttribute("class", "news-inline-video");
      node.removeAttribute("frameborder");
      node.removeAttribute("allowfullscreen");
      return node;
    }

    static value(node: HTMLVideoElement) {
      return node.getAttribute("src") ?? "";
    }
  }

  Html5VideoBlot.blotName = "video";
  Html5VideoBlot.className = "news-inline-video";
  Html5VideoBlot.tagName = "VIDEO";
  quill.register(Html5VideoBlot, true);
  blotRegistered = true;
}

export function insertNewsVideoIntoEditor(editor: QuillEditor, videoUrl: string) {
  const range = editor.getSelection(true);
  const insertAt = range ? range.index : editor.getLength();
  editor.insertEmbed(insertAt, "video", videoUrl, "user");
  editor.insertText(insertAt + 1, "\n", "user");
  return editor.root.innerHTML;
}

export {
  buildNewsVideoEmbedHtml,
  hasPendingNewsMediaUploads,
  isSupportedNewsVideoType,
  NEWS_VIDEO_ACCEPT,
  SUPPORTED_NEWS_VIDEO_TYPES,
};

export type { NewsMediaUploadState };
