import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Newspaper,
  X,
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { createPortal } from "react-dom";
import ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";
import { ImageUploadModal } from "@/components/ImageUploadModal";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { useProcessingFeedback } from "@/hooks/useProcessingFeedback";
import { AdminConfirmDialog } from "@/components/AdminConfirmDialog";
import { searchPhotos, type UnsplashPhoto } from "@/lib/unsplashApi";
import {
  fetchAdminNewsPosts,
  fetchMyDrafts,
  publishNewsFromDraft,
  saveNewsDraft,
  deleteArticle,
  deleteDraft,
  uploadNewsImage,
  uploadNewsVideo,
  type NewsPostRecord,
  type ArticleVersionRecord,
} from "@/lib/supabaseApi";
import { pickLocalized } from "@/lib/supabaseHelpers";
import {
  buildNewsImageEmbedHtml,
  buildNewsVideoEmbedHtml,
  ensureNewsVideoBlotRegistered,
  getSupportedNewsMediaType,
  hasInlineNewsDataMedia,
  insertNewsImageIntoEditor,
  insertNewsVideoIntoEditor,
  normalizeNewsMediaHtml,
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_MAX_BYTES,
  NEWS_VIDEO_ACCEPT,
  NEWS_VIDEO_MAX_BYTES,
} from "@/lib/newsMedia";
import {
  type ErrorMessages,
  type FormErrors,
  type ValidationConfig,
  type ValidationRules,
  getErrorMessage,
  scrollToFirstError,
  validateField as validateFieldUtil,
  validateForm as validateFormUtil,
} from "@/lib/formValidation";
import { isWithinCharacterLimit } from "@/lib/textLength";

ensureNewsVideoBlotRegistered(ReactQuill.Quill);

const NEWS_EDITOR_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

const NEWS_EDITOR_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "align",
  "link",
  "image",
  "video",
];

type NewsEditorDelta = {
  ops?: unknown[];
};

type NewsEditorMediaNode = {
  getAttribute?: (name: string) => string | null;
  querySelector?: (selector: string) => NewsEditorMediaNode | null;
};

export function createNewsEditorModules(): NonNullable<
  ReactQuillProps["modules"]
> {
  return {
    toolbar: NEWS_EDITOR_TOOLBAR,
    clipboard: {
      matchers: [
        ["IMG", blockInlineNewsMediaMatcher],
        ["VIDEO", blockInlineNewsMediaMatcher],
      ],
    },
  };
}

function createEmptyNewsEditorDelta(delta: NewsEditorDelta) {
  const DeltaCtor = delta.constructor as unknown;
  if (typeof DeltaCtor === "function" && DeltaCtor !== Object) {
    return new (DeltaCtor as new () => NewsEditorDelta)();
  }
  return { ...delta, ops: [] };
}

export function blockInlineNewsMediaMatcher(
  node: NewsEditorMediaNode,
  delta: NewsEditorDelta
) {
  const src =
    node.getAttribute?.("src") ??
    node.querySelector?.("source")?.getAttribute?.("src") ??
    "";
  return hasInlineNewsDataMedia(src)
    ? createEmptyNewsEditorDelta(delta)
    : delta;
}

async function dataUrlToImageFile(dataUrl: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], "news-cover.jpg", {
    type: blob.type || "image/jpeg",
  });
}

export type NewsMediaAssetType = "image" | "video";

export type NewsMediaAsset = {
  id: string;
  type: NewsMediaAssetType;
  url: string;
  name: string;
};

type NewsMediaUploadItem = {
  id: string;
  type: NewsMediaAssetType;
  name: string;
  progress: number;
  abortController: AbortController;
};

type NewsMediaUploadPreview = Omit<NewsMediaUploadItem, "abortController">;

const NEWS_MEDIA_ACCEPT = `${NEWS_IMAGE_ACCEPT},${NEWS_VIDEO_ACCEPT}`;
const NEWS_MEDIA_DRAG_TYPE = "application/x-macmaa-news-media";
const NEWS_MEDIA_SRC_REGEX = /<(img|video)\b[^>]*\bsrc=(['"])(.*?)\2[^>]*>/gi;
const NEWS_MEDIA_CARD_WIDTH = 260;
const NEWS_MEDIA_CARD_STYLE: React.CSSProperties = {
  width: NEWS_MEDIA_CARD_WIDTH,
  minWidth: NEWS_MEDIA_CARD_WIDTH,
  maxWidth: NEWS_MEDIA_CARD_WIDTH,
  height: 78,
  minHeight: 78,
  maxHeight: 78,
  flex: `0 0 ${NEWS_MEDIA_CARD_WIDTH}px`,
};
const NEWS_MEDIA_REMOVE_BUTTON_STYLE: React.CSSProperties = {
  top: 4,
  right: 4,
};
const NEWS_MEDIA_NAME_STYLE: React.CSSProperties = {
  display: "block",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function isReusableNewsMediaUrl(url: string) {
  return (
    !!url &&
    !url.startsWith("data:") &&
    !url.startsWith("blob:") &&
    (url.startsWith("http") || url.startsWith("/"))
  );
}

function getNewsMediaFileName(url: string, fallback: string) {
  try {
    const parsed = new URL(url, "https://macmaa.local");
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : fallback;
  } catch {
    return fallback;
  }
}

function createNewsMediaAsset(
  type: NewsMediaAssetType,
  url: string,
  name?: string
): NewsMediaAsset {
  const fallback = type === "image" ? "Image" : "Video";
  return {
    id: `${type}:${url}`,
    type,
    url,
    name: name?.trim() || getNewsMediaFileName(url, fallback),
  };
}

function addNewsMediaAssetToList(
  assets: NewsMediaAsset[],
  asset: NewsMediaAsset
) {
  if (assets.some((existing) => existing.id === asset.id)) {
    return assets;
  }
  return [asset, ...assets];
}

function isRenderableNewsImageUrl(value?: string | null) {
  const url = value?.trim() ?? "";
  if (!url || hasInlineNewsDataMedia(url)) return false;
  return (
    url.startsWith("http") || url.startsWith("/") || url.startsWith("blob:")
  );
}

function getRenderableNewsImageUrl(value?: string | null) {
  const url = value?.trim() ?? "";
  return isRenderableNewsImageUrl(url) ? url : "";
}

function getSafeCoverText(value?: string | null) {
  const text = value?.trim() ?? "";
  return hasInlineNewsDataMedia(text) ? "" : text;
}

function hasInlineCoverMedia(input: {
  coverUrl?: string | null;
  coverSource?: string | null;
}) {
  return [input.coverUrl, input.coverSource].some(hasInlineNewsDataMedia);
}

function extractNewsMediaAssets(input: {
  coverUrl?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
}) {
  let assets: NewsMediaAsset[] = [];
  const addAsset = (asset: NewsMediaAsset) => {
    assets = addNewsMediaAssetToList(assets, asset);
  };

  if (input.coverUrl && isReusableNewsMediaUrl(input.coverUrl)) {
    addAsset(createNewsMediaAsset("image", input.coverUrl, "Cover image"));
  }

  [input.contentZh, input.contentEn].forEach((content) => {
    if (!content) return;
    for (const match of content.matchAll(NEWS_MEDIA_SRC_REGEX)) {
      const tag = match[1]?.toLowerCase();
      const url = match[3] ?? "";
      if (!isReusableNewsMediaUrl(url)) continue;
      addAsset(createNewsMediaAsset(tag === "video" ? "video" : "image", url));
    }
  });

  return assets;
}

function getNewsMediaAssetHtml(asset: NewsMediaAsset) {
  return asset.type === "image"
    ? buildNewsImageEmbedHtml(asset.url)
    : buildNewsVideoEmbedHtml(asset.url);
}

function parseDraggedNewsMediaAsset(
  event: React.DragEvent
): NewsMediaAsset | null {
  const raw = event.dataTransfer.getData(NEWS_MEDIA_DRAG_TYPE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NewsMediaAsset;
    if (
      (parsed.type === "image" || parsed.type === "video") &&
      isReusableNewsMediaUrl(parsed.url)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function AdminNews() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsPostRecord[]>([]);
  const [draftList, setDraftList] = useState<ArticleVersionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsPostRecord | null>(
    null
  );
  const [editingDraft, setEditingDraft] = useState<ArticleVersionRecord | null>(
    null
  );
  const [draftVersionId, setDraftVersionId] = useState<string | null>(null);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "delete" | "deleteDraft";
    targetId: string;
  } | null>(null);
  const isUuid = (value?: string | null) =>
    !!value &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value
    );
  const createUuid = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const normalizeArticleId = (
    ...candidates: Array<string | null | undefined>
  ) => {
    const found = candidates.find((c) => !!c);
    return isUuid(found) ? (found as string) : undefined;
  };
  const {
    state: processingState,
    title: processingTitle,
    message: processingMessage,
    runWithFeedback,
    showError: showProcessingError,
    reset: resetProcessing,
  } = useProcessingFeedback();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getFeedbackMessages = (
    action: "save" | "publish" | "delete" | "deleteDraft"
  ) => ({
    processingTitle: t(`admin.news.feedback.${action}.processingTitle`),
    processingMessage: t(`admin.news.feedback.${action}.processingMessage`),
    successTitle: t(`admin.news.feedback.${action}.successTitle`),
    successMessage: t(`admin.news.feedback.${action}.successMessage`),
    errorTitle: t(`admin.news.feedback.${action}.errorTitle`),
    errorMessage: t(`admin.news.feedback.${action}.errorMessage`),
  });

  const getConfirmCopy = (type: "delete" | "deleteDraft") => ({
    title: t(`admin.news.confirm.${type}.title`),
    message: t(`admin.news.confirm.${type}.message`),
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchAdminNewsPosts(), fetchMyDrafts()])
      .then(([articles, drafts]) => {
        if (active) {
          setNewsList(articles);
          setDraftList(drafts);
        }
      })
      .catch(() => {
        if (active) setError(t("common.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  // Filter news
  const filteredNews = newsList.filter((news) => {
    const zhTitle = news.title_zh?.toLowerCase() ?? "";
    const enTitle = news.title_en?.toLowerCase() ?? "";
    const zhSummary = news.summary_zh?.toLowerCase() ?? "";
    const enSummary = news.summary_en?.toLowerCase() ?? "";
    const term = searchTerm.toLowerCase();
    return (
      zhTitle.includes(term) ||
      enTitle.includes(term) ||
      zhSummary.includes(term) ||
      enSummary.includes(term)
    );
  });

  const handleAdd = () => {
    setUploadedImage("");
    setEditingArticle(null);
    setEditingDraft(null);
    setDraftVersionId(null);
    setShowForm(true);
  };
  const handleDelete = (id: string) => {
    setConfirmDialog({ type: "delete", targetId: id });
  };

  const handleEdit = (news: NewsPostRecord) => {
    const coverUrl =
      getRenderableNewsImageUrl(news.cover_url) ||
      getRenderableNewsImageUrl(news.cover_source);
    setUploadedImage(coverUrl ?? "");
    setEditingArticle(news);
    setEditingDraft(null);
    setDraftVersionId(null);
    setShowForm(true);
  };

  const handleEditDraft = (draft: ArticleVersionRecord) => {
    const coverUrl =
      getRenderableNewsImageUrl(draft.cover_url) ||
      getRenderableNewsImageUrl(draft.cover_source);
    setUploadedImage(coverUrl ?? "");
    setEditingDraft(draft);
    setEditingArticle(null);
    setDraftVersionId(draft.id);
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog) return;
    const { type, targetId } = confirmDialog;
    setConfirmDialog(null);
    const action = type === "delete" ? "delete" : "deleteDraft";
    const messages = getFeedbackMessages(action);
    try {
      await runWithFeedback(
        messages,
        async () => {
          if (type === "delete") {
            await deleteArticle(targetId);
            if (!isMountedRef.current) return;
            setNewsList((prev) => prev.filter((n) => n.id !== targetId));
            const drafts = await fetchMyDrafts();
            if (!isMountedRef.current) return;
            setDraftList(drafts);
            setSuccess(language === "zh" ? "已删除" : "Deleted");
          } else {
            await deleteDraft(targetId);
            if (!isMountedRef.current) return;
            setDraftList((prev) => prev.filter((d) => d.id !== targetId));
            setSuccess(language === "zh" ? "草稿已删除" : "Draft deleted");
          }
        },
        {
          onError: (err) => {
            const detail =
              err instanceof Error && err.message
                ? err.message
                : t("common.error");
            console.error("[admin-news] delete failed", err);
            if (!isMountedRef.current) return;
            setError(detail);
            showProcessingError({
              errorTitle: messages.errorTitle,
              errorMessage: detail,
            });
          },
        }
      );
    } catch (err) {
      const detail =
        err instanceof Error && err.message ? err.message : t("common.error");
      if (isMountedRef.current) {
        setError(detail);
      }
    }
  };

  const buildCoverFields = (news: NewsFormState) => {
    const type = news.imageType || "upload";
    const keyword = type === "unsplash" ? news.imageKeyword.trim() : "";
    const rawUrl =
      type === "upload"
        ? news.image || uploadedImage || uploadedImageUrl || ""
        : news.image;
    const url = hasInlineNewsDataMedia(rawUrl) ? "" : rawUrl;
    const coverSource = url || keyword || null;
    return {
      cover_source: coverSource,
      cover_type: type,
      cover_keyword: keyword || null,
      cover_url: url || null,
    };
  };

  const isInlineNewsMediaPayloadError = (err: unknown) =>
    err instanceof Error && err.message.includes("Inline base64 media");

  const handleSave = async (news: NewsFormState) => {
    setFormLoading(true);
    const messages = getFeedbackMessages("save");
    try {
      await runWithFeedback(messages, async () => {
        try {
          const articleId = normalizeArticleId(
            news.id,
            editingArticle?.id,
            editingDraft?.article_id
          );
          const coverFields = buildCoverFields(news);
          const draft = await saveNewsDraft({
            // 这里的 id 代表业务上的“新闻编号”(article_id)
            id: articleId,
            title_zh: news.title.zh,
            title_en: news.title.en,
            summary_zh: news.summary.zh,
            summary_en: news.summary.en,
            content_zh: news.content.zh,
            content_en: news.content.en,
            ...coverFields,
          });
          if (!isMountedRef.current) return;
          // 记录当前正在编辑的草稿版本以及对应的新闻编号
          setDraftVersionId(draft.id);
          setEditingDraft(draft);
          setEditingArticle(null);
          setSuccess(language === "zh" ? "草稿已保存" : "Draft saved");
          const drafts = await fetchMyDrafts();
          if (!isMountedRef.current) return;
          setDraftList(drafts);
        } catch (err) {
          if (!isMountedRef.current) return;
          if (isInlineNewsMediaPayloadError(err)) {
            setError(
              language === "zh"
                ? "正文或封面仍包含内联媒体，请重新上传图片后再保存"
                : "The body or cover still contains inline media. Re-upload images before saving."
            );
            throw err;
          }
          setError(t("common.error"));
          const localDraft: ArticleVersionRecord = {
            id: createUuid(),
            article_id:
              normalizeArticleId(
                news.id,
                editingArticle?.id,
                editingDraft?.article_id
              ) ?? createUuid(),
            title_zh: news.title.zh,
            title_en: news.title.en,
            summary_zh: news.summary.zh,
            summary_en: news.summary.en,
            content_zh: news.content.zh,
            content_en: news.content.en,
            cover_source: buildCoverFields(news).cover_source,
            cover_type: news.imageType,
            cover_keyword: news.imageKeyword,
            cover_url: buildCoverFields(news).cover_url,
            status: "draft",
            version_number: (draftList[0]?.version_number ?? 0) + 1,
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setDraftList((prev) => [localDraft, ...prev]);
          setSuccess(
            language === "zh"
              ? "草稿已保存（离线）"
              : "Draft saved locally (offline)"
          );
          console.warn("[AdminNews] save draft fallback", err);
        }
      });
    } catch (err) {
      console.error("[AdminNews] save draft", err);
    } finally {
      if (isMountedRef.current) {
        setFormLoading(false);
      }
    }
  };
  const handlePublish = async (news: NewsFormState) => {
    setFormLoading(true);
    const messages = getFeedbackMessages("publish");
    try {
      await runWithFeedback(messages, async () => {
        try {
          let versionId = draftVersionId;
          if (!versionId) {
            const articleId = normalizeArticleId(
              news.id,
              editingArticle?.id,
              editingDraft?.article_id
            );
            const coverFields = buildCoverFields(news);
            const draft = await saveNewsDraft({
              // 这里的 id 代表业务上的“新闻编号”(article_id)
              id: articleId,
              title_zh: news.title.zh,
              title_en: news.title.en,
              summary_zh: news.summary.zh,
              summary_en: news.summary.en,
              content_zh: news.content.zh,
              content_en: news.content.en,
              ...coverFields,
            });
            if (!isMountedRef.current) return;
            versionId = draft.id;
            setEditingDraft(draft);
            setEditingArticle(null);
          }

          const result = await publishNewsFromDraft(versionId!);
          if (!isMountedRef.current) return;
          setNewsList((prev) => {
            const exists = prev.some((n) => n.id === result.article.id);
            if (exists) {
              return prev.map((n) =>
                n.id === result.article.id ? result.article : n
              );
            }
            return [result.article, ...prev];
          });
          setShowForm(false);
          setEditingArticle(null);
          setDraftVersionId(null);
          setEditingDraft(null);
          setSuccess(language === "zh" ? "发布成功" : "Published");
          const drafts = await fetchMyDrafts();
          if (!isMountedRef.current) return;
          setDraftList(drafts);
        } catch (err) {
          if (!isMountedRef.current) return;
          if (isInlineNewsMediaPayloadError(err)) {
            setError(
              language === "zh"
                ? "正文或封面仍包含内联媒体，请重新上传图片后再发布"
                : "The body or cover still contains inline media. Re-upload images before publishing."
            );
            throw err;
          }
          setError(t("common.error"));
          const localArticle: NewsPostRecord = {
            id: normalizeArticleId(news.id, editingArticle?.id) ?? createUuid(),
            title_zh: news.title.zh,
            title_en: news.title.en,
            summary_zh: news.summary.zh,
            summary_en: news.summary.en,
            content_zh: news.content.zh,
            content_en: news.content.en,
            cover_source: buildCoverFields(news).cover_source,
            cover_type: news.imageType,
            cover_keyword: news.imageKeyword,
            cover_url: buildCoverFields(news).cover_url,
            published_at: new Date().toISOString(),
            published: true,
            author_id: null,
          };
          setNewsList((prev) => {
            const exists = prev.some((n) => n.id === localArticle.id);
            return exists
              ? prev.map((n) => (n.id === localArticle.id ? localArticle : n))
              : [localArticle, ...prev];
          });
          setDraftList((prev) =>
            prev.filter((d) => d.article_id !== localArticle.id)
          );
          setShowForm(false);
          setEditingArticle(null);
          setDraftVersionId(null);
          setEditingDraft(null);
          setSuccess(
            language === "zh"
              ? "已本地发布（网络异常）"
              : "Published locally (offline fallback)"
          );
          console.warn("[AdminNews] publish fallback", err);
        }
      });
    } catch (err) {
      console.error("[AdminNews] publish news", err);
    } finally {
      if (isMountedRef.current) {
        setFormLoading(false);
      }
    }
  };

  const handleImageUpload = () => {
    setShowImageUploadModal(true);
  };

  const handleImageUploadClose = () => {
    setShowImageUploadModal(false);
  };

  const handleImageUploadSuccess = async (imageUrl: string) => {
    setCoverUploading(true);
    setError(null);
    try {
      const finalImageUrl = hasInlineNewsDataMedia(imageUrl)
        ? await uploadNewsImage({
            file: await dataUrlToImageFile(imageUrl),
            articleId: normalizeArticleId(
              editingArticle?.id,
              editingDraft?.article_id
            ),
          })
        : imageUrl;
      setUploadedImage(finalImageUrl);
      setUploadedImageUrl(finalImageUrl);
      setShowImageUploadModal(false);
    } catch (err) {
      console.error("[AdminNews] upload cover image", err);
      setError(
        language === "zh"
          ? "封面图片上传失败，请重试"
          : "Failed to upload cover image, please try again"
      );
    } finally {
      setCoverUploading(false);
    }
  };

  const confirmCopy = confirmDialog
    ? getConfirmCopy(confirmDialog.type)
    : { title: "", message: "" };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      <ProcessingOverlay
        state={processingState}
        title={processingTitle}
        message={processingMessage}
        onComplete={resetProcessing}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-[#2B5F9E] hover:text-[#6BA868] transition-colors mb-4"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("admin.backToDashboard")}</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#2B5F9E]">{t("admin.news.title")}</h1>
            </div>
            <motion.button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>{t("admin.news.add")}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.news.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
            />
          </div>
        </motion.div>

        {/* News List */}
        {loading && <p className="text-gray-600 mb-3">{t("common.loading")}</p>}
        {error && (
          <p className="text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 mb-3" role="status">
            {success}
          </p>
        )}
        <div className="space-y-4">
          {draftList.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#2B5F9E] mb-3">
                {language === "zh" ? "我的草稿" : "My Drafts"}
              </h3>
              <div className="space-y-3">
                {draftList.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="text-[#2B5F9E] font-medium">
                        {pickLocalized(
                          draft.title_zh,
                          draft.title_en,
                          language
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {language === "zh" ? "新闻编号：" : "News ID: "}
                        <span className="font-mono break-all">
                          {draft.article_id ||
                            (language === "zh" ? "（未关联）" : "(unlinked)")}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {language === "zh" ? "草稿版本" : "Draft version"} #
                        {draft.version_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDraft(draft)}
                        className="p-2 text-[#2B5F9E] hover:text-[#1f4a7a] transition-colors"
                        title={language === "zh" ? "继续编辑" : "Edit draft"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            type: "deleteDraft",
                            targetId: draft.id,
                          })
                        }
                        className="p-2 text-[#2B5F9E] hover:text-red-600 transition-colors"
                        title={language === "zh" ? "删除草稿" : "Delete draft"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#2B5F9E] text-lg">
                {language === "zh" ? "已发布新闻" : "Published News"}
              </h3>
              <span className="text-sm text-gray-500">
                {language === "zh" ? "共" : "Total"} {filteredNews.length}
              </span>
            </div>
            <div className="space-y-4">
              {filteredNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[#2B5F9E] text-lg sm:text-xl">
                          {pickLocalized(
                            news.title_zh,
                            news.title_en,
                            language
                          )}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            news.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {news.published
                            ? language === "zh"
                              ? "已发布"
                              : "Published"
                            : language === "zh"
                              ? "草稿中"
                              : "Unpublished"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {pickLocalized(
                          news.summary_zh,
                          news.summary_en,
                          language
                        )}
                      </p>
                      <div className="text-sm text-gray-500 flex flex-col gap-1">
                        <span>
                          {language === "zh" ? "新闻编号：" : "News ID: "}
                          <span className="font-mono break-all">{news.id}</span>
                        </span>
                        <span>{news.published_at?.slice(0, 10) || ""}</span>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <button
                        onClick={() => handleEdit(news)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex-1 md:flex-initial"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {t("admin.news.edit")}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(news.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1 md:flex-initial"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {t("admin.news.delete")}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {!loading && filteredNews.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {language === "zh" ? "没有找到新闻" : "No news found"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* News Form Modal */}
        {showForm && (
          <NewsFormModal
            news={editingArticle}
            draft={editingDraft}
            onSave={handleSave}
            onPublish={handlePublish}
            onClose={() => {
              setShowForm(false);
              setEditingArticle(null);
              setEditingDraft(null);
            }}
            handleImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            formLoading={formLoading || coverUploading}
            isImageUploadModalOpen={showImageUploadModal}
          />
        )}

        {/* Image Upload Modal */}
        {showImageUploadModal && (
          <ImageUploadModal
            onClose={handleImageUploadClose}
            onSuccess={handleImageUploadSuccess}
          />
        )}

        <AdminConfirmDialog
          open={Boolean(confirmDialog)}
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={t("admin.members.confirm.confirm")}
          cancelLabel={t("admin.members.confirm.cancel")}
          tone="danger"
          onCancel={() => setConfirmDialog(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}

// News Form Modal Component
type NewsFormState = {
  id: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  content: { zh: string; en: string };
  image: string;
  imageKeyword: string;
  imageType: "unsplash" | "upload";
};

type NewsValidationFields = {
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
};

const hasRichTextContent = (value: string): boolean => {
  if (!value) return false;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
};

const isWithinSummaryLimit = (value: string): boolean =>
  isWithinCharacterLimit(value, 200);

const hasSafeRichTextContent = (value: string): boolean =>
  hasRichTextContent(value) && !hasInlineNewsDataMedia(value);

const newsValidationRules: ValidationRules<NewsValidationFields> = {
  titleZh: {
    pattern: /^.{2,120}$/,
    errorType: "invalidTitleZh",
    required: true,
  },
  titleEn: {
    pattern: /^.{2,120}$/,
    errorType: "invalidTitleEn",
    required: true,
  },
  summaryZh: {
    validate: isWithinSummaryLimit,
    errorType: "invalidSummaryZh",
    required: true,
  },
  summaryEn: {
    validate: isWithinSummaryLimit,
    errorType: "invalidSummaryEn",
    required: true,
  },
  contentZh: {
    validate: hasSafeRichTextContent,
    errorType: "invalidContentZh",
    required: true,
  },
  contentEn: {
    validate: hasSafeRichTextContent,
    errorType: "invalidContentEn",
    required: true,
  },
};

const newsErrorMessages: ErrorMessages = {
  required: {
    zh: "此字段为必填项",
    en: "This field is required",
  },
  invalidTitleZh: {
    zh: "请输入至少2个字符的中文标题",
    en: "Enter a Chinese title with at least 2 characters",
  },
  invalidTitleEn: {
    zh: "请输入至少2个字符的英文标题",
    en: "Enter an English title with at least 2 characters",
  },
  invalidSummaryZh: {
    zh: "请输入最多200字的中文摘要",
    en: "Enter a Chinese summary with at most 200 characters",
  },
  invalidSummaryEn: {
    zh: "请输入最多200字的英文摘要",
    en: "Enter an English summary with at most 200 characters",
  },
  invalidContentZh: {
    zh: "请输入中文正文内容，正文图片请通过上传插入，不能直接保存内联图片",
    en: "Enter Chinese body content. Body images must be uploaded, not saved inline.",
  },
  invalidContentEn: {
    zh: "请输入英文正文内容，正文图片请通过上传插入，不能直接保存内联图片",
    en: "Enter English body content. Body images must be uploaded, not saved inline.",
  },
};

const mapNewsFormToValidation = (
  data: NewsFormState
): NewsValidationFields => ({
  titleZh: data.title.zh.trim(),
  titleEn: data.title.en.trim(),
  summaryZh: data.summary.zh.trim(),
  summaryEn: data.summary.en.trim(),
  contentZh: data.content.zh,
  contentEn: data.content.en,
});

const newsRequiredFields = Object.keys(
  newsValidationRules
) as (keyof NewsValidationFields)[];

function NewsFormModal({
  news,
  draft,
  onSave,
  onPublish,
  onClose,
  handleImageUpload,
  uploadedImage,
  uploadedImageUrl,
  setUploadedImageUrl,
  formLoading,
  isImageUploadModalOpen = false,
}: {
  news: NewsPostRecord | null;
  draft: ArticleVersionRecord | null;
  onSave: (news: NewsFormState) => void;
  onPublish: (news: NewsFormState) => void;
  onClose: () => void;
  handleImageUpload: () => void;
  uploadedImage: string;
  uploadedImageUrl: string;
  setUploadedImageUrl: (url: string) => void;
  formLoading: boolean;
  isImageUploadModalOpen?: boolean;
}) {
  const { language, t } = useLanguage();
  const zhEditorRef = useRef<ReactQuill | null>(null);
  const enEditorRef = useRef<ReactQuill | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initialCoverUrl =
    getRenderableNewsImageUrl(draft?.cover_url) ||
    getRenderableNewsImageUrl(news?.cover_url) ||
    getRenderableNewsImageUrl(draft?.cover_source) ||
    getRenderableNewsImageUrl(news?.cover_source);
  const initialCoverKeyword =
    draft?.cover_keyword ||
    news?.cover_keyword ||
    (!initialCoverUrl
      ? getSafeCoverText(draft?.cover_source ?? news?.cover_source)
      : "");
  const initialCoverType =
    draft?.cover_type ||
    news?.cover_type ||
    (initialCoverUrl ? "upload" : initialCoverKeyword ? "unsplash" : "upload");
  const hasLegacyInlineCover =
    hasInlineCoverMedia({
      coverUrl: draft?.cover_url,
      coverSource: draft?.cover_source,
    }) ||
    hasInlineCoverMedia({
      coverUrl: news?.cover_url,
      coverSource: news?.cover_source,
    });

  // 辅助函数：判断字符串是否为图片 URL
  const isImageUrl = (str: string): boolean => {
    return isRenderableNewsImageUrl(str);
  };

  const isUnsplashUrl = (str: string): boolean =>
    isImageUrl(str) && str.includes("images.unsplash.com");

  const [imageSource, setImageSource] = useState<"unsplash" | "upload">(() => {
    if (initialCoverType) return initialCoverType;
    if (isUnsplashUrl(initialCoverUrl)) return "unsplash";
    if (initialCoverUrl) return "upload";
    if (initialCoverKeyword) return "unsplash";
    return "upload";
  });

  const [unsplashKeyword, setUnsplashKeyword] = useState<string>(() => {
    if (initialCoverKeyword) return initialCoverKeyword;
    return "";
  });
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [selectedUnsplashId, setSelectedUnsplashId] = useState<string | null>(
    null
  );

  const [coverError, setCoverError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<NewsMediaAsset[]>(() =>
    extractNewsMediaAssets({
      coverUrl: uploadedImageUrl || initialCoverUrl,
      contentZh: draft?.content_zh ?? news?.content_zh,
      contentEn: draft?.content_en ?? news?.content_en,
    })
  );
  const [uploadingMediaAssets, setUploadingMediaAssets] = useState<
    NewsMediaUploadItem[]
  >([]);
  const [mediaLibraryError, setMediaLibraryError] = useState<string | null>(
    null
  );
  const mediaLibraryUploading = uploadingMediaAssets.length > 0;
  const hasPendingMediaUpload = mediaLibraryUploading;
  const [formData, setFormData] = useState<NewsFormState>(() => {
    const coverSource = getSafeCoverText(
      draft?.cover_source || news?.cover_source
    );
    const coverUrl =
      getRenderableNewsImageUrl(draft?.cover_url) ||
      getRenderableNewsImageUrl(news?.cover_url) ||
      uploadedImageUrl;
    const coverKeyword =
      draft?.cover_keyword || news?.cover_keyword || unsplashKeyword;
    const isCoverImageUrl = !!coverUrl && isImageUrl(coverUrl);
    const isCoverUnsplash = !!coverUrl && isUnsplashUrl(coverUrl);

    if (draft) {
      return {
        id: draft.article_id ?? "",
        title: { zh: draft.title_zh ?? "", en: draft.title_en ?? "" },
        summary: { zh: draft.summary_zh ?? "", en: draft.summary_en ?? "" },
        content: {
          zh: normalizeNewsMediaHtml(draft.content_zh),
          en: normalizeNewsMediaHtml(draft.content_en),
        },
        image:
          isCoverImageUrl && imageSource === "unsplash" && !isCoverUnsplash
            ? ""
            : coverUrl || coverSource,
        imageKeyword: coverKeyword || "",
        imageType: imageSource,
      };
    }
    if (news) {
      return {
        id: news.id,
        title: { zh: news.title_zh ?? "", en: news.title_en ?? "" },
        summary: { zh: news.summary_zh ?? "", en: news.summary_en ?? "" },
        content: {
          zh: normalizeNewsMediaHtml(news.content_zh),
          en: normalizeNewsMediaHtml(news.content_en),
        },
        image:
          isCoverImageUrl && imageSource === "unsplash" && !isCoverUnsplash
            ? ""
            : coverUrl || coverSource,
        imageKeyword: coverKeyword || "",
        imageType: imageSource,
      };
    }
    return {
      id: "",
      title: { zh: "", en: "" },
      summary: { zh: "", en: "" },
      content: { zh: "", en: "" },
      image: coverUrl || coverSource || "",
      imageKeyword: coverKeyword || "",
      imageType: imageSource,
    };
  });

  const handleUnsplashSearch = async () => {
    const keyword = unsplashKeyword.trim();
    if (!keyword) {
      setUnsplashError(
        language === "zh" ? "请输入关键词后再搜索" : "Enter a keyword to search"
      );
      setUnsplashResults([]);
      return;
    }

    setUnsplashLoading(true);
    setUnsplashError(null);
    try {
      const res = await searchPhotos(keyword, 1, 12);
      setUnsplashResults(res.results);
      if (res.results.length === 0) {
        setUnsplashError(
          language === "zh" ? "未找到相关图片" : "No images found"
        );
      }
    } catch (err) {
      console.error("[AdminNews] unsplash search", err);
      setUnsplashError(
        language === "zh"
          ? "搜索失败，请稍后再试"
          : "Search failed, please try again"
      );
    } finally {
      setUnsplashLoading(false);
    }
  };

  const handleSelectUnsplash = (photo: UnsplashPhoto) => {
    const url =
      photo.urls?.regular ??
      photo.urls?.full ??
      photo.urls?.small ??
      photo.urls?.thumb ??
      "";
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      image: url,
      imageKeyword: unsplashKeyword,
      imageType: "unsplash",
    }));
    setImageSource("unsplash");
    setSelectedUnsplashId(photo.id);
    setCoverError(null);
    setMediaAssets((prev) =>
      addNewsMediaAssetToList(
        prev,
        createNewsMediaAsset(
          "image",
          url,
          photo.alt_description ?? photo.description ?? "Unsplash image"
        )
      )
    );
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const validationConfig = useMemo<ValidationConfig<NewsValidationFields>>(
    () => ({
      rules: newsValidationRules,
      requiredFields: newsRequiredFields,
      errorMessages: newsErrorMessages,
      language,
    }),
    [language]
  );

  // 当外部传入的草稿发生变化（例如首次保存新草稿后），同步其 article_id 作为表单中的“新闻编号”
  useEffect(() => {
    if (draft?.article_id && formData.id !== draft.article_id) {
      setFormData((prev) => ({
        ...prev,
        id: draft.article_id ?? prev.id,
      }));
    }
  }, [draft?.article_id, formData.id]);

  useEffect(() => {
    if (uploadedImage) {
      if (hasInlineNewsDataMedia(uploadedImage)) return;
      setImageSource("upload");
      setUploadedImageUrl(uploadedImage);
      setCoverError(null);
      setFormData((prev) => ({
        ...prev,
        image: uploadedImage,
        imageKeyword: "",
        imageType: "upload",
      }));
      if (isReusableNewsMediaUrl(uploadedImage)) {
        setMediaAssets((prev) =>
          addNewsMediaAssetToList(
            prev,
            createNewsMediaAsset("image", uploadedImage, "Cover image")
          )
        );
      }
    }
  }, [uploadedImage, setUploadedImageUrl]);

  useEffect(() => {
    setErrors({});
    setTouched({});
  }, [draft?.id, news?.id]);

  const normalizeFieldValue = (
    field: keyof NewsValidationFields,
    value: string
  ) => {
    if (field === "contentZh" || field === "contentEn") {
      return value;
    }
    return value.trim();
  };

  const clearFieldError = (field: keyof NewsValidationFields) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const runFieldValidation = (
    field: keyof NewsValidationFields,
    value?: string
  ) => {
    const fallbackValues = mapNewsFormToValidation(formData);
    const result = validateFieldUtil(
      field,
      value ?? fallbackValues[field],
      validationConfig
    );
    setErrors((prev) => {
      if (result) {
        return { ...prev, [field]: result };
      }
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return result;
  };

  const handleFieldBlur = (field: keyof NewsValidationFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runFieldValidation(field);
  };

  const handleFieldChange = (
    field: keyof NewsValidationFields,
    value: string
  ) => {
    if (touched[field]) {
      runFieldValidation(field, normalizeFieldValue(field, value));
    } else if (errors[field]) {
      clearFieldError(field);
    }
  };

  const touchAllFields = () => {
    const touchedMap = newsRequiredFields.reduce<Record<string, boolean>>(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {}
    );
    setTouched((prev) => ({ ...prev, ...touchedMap }));
  };

  const validateNoInlineDataMedia = (): boolean => {
    const mediaErrors: FormErrors = {};
    if (hasInlineNewsDataMedia(formData.content.zh)) {
      mediaErrors.contentZh = "invalidContentZh";
    }
    if (hasInlineNewsDataMedia(formData.content.en)) {
      mediaErrors.contentEn = "invalidContentEn";
    }

    const hasCoverDataMedia =
      formData.imageType === "upload" &&
      hasInlineNewsDataMedia(
        formData.image || uploadedImageUrl || uploadedImage
      );
    setCoverError(
      hasCoverDataMedia
        ? language === "zh"
          ? "封面图片仍是内联数据，请重新上传并等待上传完成"
          : "The cover image is still inline data. Re-upload it and wait for upload to finish."
        : null
    );

    if (Object.keys(mediaErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...mediaErrors }));
      setTouched((prev) => ({
        ...prev,
        ...Object.keys(mediaErrors).reduce<Record<string, boolean>>(
          (acc, field) => {
            acc[field] = true;
            return acc;
          },
          {}
        ),
      }));
      scrollToFirstError(mediaErrors);
      return false;
    }

    if (hasCoverDataMedia) {
      document
        .getElementById("coverImageSettings")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    return true;
  };

  const validateBeforePublish = (): boolean => {
    if (!validateNoInlineDataMedia()) return false;

    const validationErrors = validateFormUtil(
      mapNewsFormToValidation(formData),
      validationConfig
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      touchAllFields();
      scrollToFirstError(validationErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasPendingMediaUpload) return;
    if (!validateNoInlineDataMedia()) return;
    onSave(formData);
  };

  const handlePublishAttempt = () => {
    if (hasPendingMediaUpload) return;
    if (!validateBeforePublish()) return;
    onPublish(formData);
  };

  const updateEditorContent = (lang: "zh" | "en", value: string) => {
    if (hasInlineNewsDataMedia(value)) {
      setMediaLibraryError(
        language === "zh"
          ? "不支持直接粘贴图片或视频文件，请先上传到素材库"
          : "Pasted image or video files are not supported. Upload them to the media library first."
      );
      return;
    }
    setMediaLibraryError(null);
    setFormData((prev) => ({
      ...prev,
      content: { ...prev.content, [lang]: value },
    }));
    handleFieldChange(lang === "zh" ? "contentZh" : "contentEn", value);
  };

  const rememberMediaAsset = (asset: NewsMediaAsset) => {
    setMediaAssets((prev) => addNewsMediaAssetToList(prev, asset));
  };

  const removeMediaAsset = (assetId: string) => {
    setMediaAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  };

  const cancelMediaUpload = (uploadId: string) => {
    uploadingMediaAssets
      .find((upload) => upload.id === uploadId)
      ?.abortController.abort();
    setUploadingMediaAssets((prev) =>
      prev.filter((upload) => upload.id !== uploadId)
    );
  };

  const insertVideoIntoEditor = (lang: "zh" | "en", videoUrl: string) => {
    const editorRef = lang === "zh" ? zhEditorRef : enEditorRef;
    const quill = editorRef.current?.getEditor();
    if (quill) {
      updateEditorContent(lang, insertNewsVideoIntoEditor(quill, videoUrl));
      return;
    }

    const nextValue = `${formData.content[lang] ?? ""}${buildNewsVideoEmbedHtml(
      videoUrl
    )}`;
    updateEditorContent(lang, nextValue);
  };

  const insertImageIntoEditor = (lang: "zh" | "en", imageUrl: string) => {
    const editorRef = lang === "zh" ? zhEditorRef : enEditorRef;
    const quill = editorRef.current?.getEditor();
    if (quill) {
      updateEditorContent(lang, insertNewsImageIntoEditor(quill, imageUrl));
      return;
    }

    const nextValue = `${formData.content[lang] ?? ""}${buildNewsImageEmbedHtml(
      imageUrl
    )}`;
    updateEditorContent(lang, nextValue);
  };

  const insertMediaAssetIntoEditor = (
    lang: "zh" | "en",
    asset: NewsMediaAsset
  ) => {
    if (asset.type === "image") {
      insertImageIntoEditor(lang, asset.url);
      return;
    }
    insertVideoIntoEditor(lang, asset.url);
  };

  const handleEditorDragOver = (event: React.DragEvent) => {
    if (Array.from(event.dataTransfer.types).includes(NEWS_MEDIA_DRAG_TYPE)) {
      event.preventDefault();
    }
  };

  const handleEditorDrop = (lang: "zh" | "en", event: React.DragEvent) => {
    const asset = parseDraggedNewsMediaAsset(event);
    if (!asset) return;
    event.preventDefault();
    insertMediaAssetIntoEditor(lang, asset);
  };

  const resolveImageUploadErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    return language === "zh" ? "图片上传失败" : "Failed to upload image";
  };

  const resolveVideoUploadErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    return language === "zh" ? "视频上传失败" : "Failed to upload video";
  };

  const uploadMediaAssetToLibrary = async (
    file: File
  ): Promise<NewsMediaAsset | null> => {
    const mediaType = getSupportedNewsMediaType(file.type);

    if (!mediaType) {
      setMediaLibraryError(
        language === "zh"
          ? "仅支持 JPG、PNG、GIF、WebP 图片或 MP4、WebM、OGG 视频"
          : "Only JPG, PNG, GIF, WebP images or MP4, WebM, OGG videos are supported"
      );
      return null;
    }

    if (mediaType === "image" && file.size > NEWS_IMAGE_MAX_BYTES) {
      setMediaLibraryError(
        language === "zh"
          ? "图片文件过大，请选择 8MB 以下的图片"
          : "Image is too large, please select a file smaller than 8MB"
      );
      return null;
    }

    if (mediaType === "video" && file.size > NEWS_VIDEO_MAX_BYTES) {
      setMediaLibraryError(
        language === "zh"
          ? "视频文件过大，请选择 50MB 以下的视频"
          : "Video is too large, please select a file smaller than 50MB"
      );
      return null;
    }

    setMediaLibraryError(null);
    const uploadId = `upload:${Date.now()}:${file.name}`;
    const abortController = new AbortController();
    setUploadingMediaAssets((prev) => [
      {
        id: uploadId,
        type: mediaType,
        name: file.name,
        progress: 0,
        abortController,
      },
      ...prev,
    ]);
    try {
      const updateProgress = (progress: number) => {
        if (!isMountedRef.current) return;
        setUploadingMediaAssets((prev) =>
          prev.map((upload) =>
            upload.id === uploadId ? { ...upload, progress } : upload
          )
        );
      };
      const publicUrl =
        mediaType === "image"
          ? await uploadNewsImage({
              file,
              articleId: formData.id || undefined,
              signal: abortController.signal,
              onProgress: updateProgress,
            })
          : await uploadNewsVideo({
              file,
              articleId: formData.id || undefined,
              signal: abortController.signal,
              onProgress: updateProgress,
            });
      if (!isMountedRef.current) return null;
      const asset = createNewsMediaAsset(mediaType, publicUrl, file.name);
      rememberMediaAsset(asset);
      return asset;
    } catch (err) {
      if (!isMountedRef.current) return null;
      if (abortController.signal.aborted) return null;
      console.error("[admin-news] upload media asset failed", err);
      setMediaLibraryError(
        mediaType === "image"
          ? resolveImageUploadErrorMessage(err)
          : resolveVideoUploadErrorMessage(err)
      );
      return null;
    } finally {
      if (isMountedRef.current) {
        setUploadingMediaAssets((prev) =>
          prev.filter((upload) => upload.id !== uploadId)
        );
      }
    }
  };

  const editorModules = useMemo(() => createNewsEditorModules(), []);

  const formats: NonNullable<ReactQuillProps["formats"]> = NEWS_EDITOR_FORMATS;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${
        isImageUploadModalOpen ? "z-[48]" : "z-50"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !hasPendingMediaUpload) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl">
              {news ? t("admin.news.edit") : t("admin.news.add")}
            </h2>
            <button
              onClick={onClose}
              disabled={formLoading || hasPendingMediaUpload}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Image Section - Unsplash or Upload */}
            <div
              id="coverImageSettings"
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <h3 className="text-gray-700 mb-4">
                {t("admin.news.form.coverImageSettings")}
              </h3>
              {hasLegacyInlineCover && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {language === "zh"
                    ? "这篇新闻使用旧版内联封面。为避免浏览器内存过高，请重新上传封面后再保存。"
                    : "This article uses a legacy inline cover. Re-upload the cover before saving to avoid high browser memory use."}
                </p>
              )}

              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource("upload");
                    setUnsplashResults([]);
                    setUnsplashError(null);
                    setCoverError(null);
                    setSelectedUnsplashId(null);
                    // 如果之前保存了上传的图片 URL，恢复它
                    if (uploadedImageUrl) {
                      setFormData((prev) => ({
                        ...prev,
                        image: uploadedImageUrl,
                        imageKeyword: "",
                        imageType: "upload",
                      }));
                    } else if (formData.image && !isImageUrl(formData.image)) {
                      // 如果 uploadedImageUrl 不存在，且当前 formData.image 是关键词（不是图片 URL），则清空
                      setFormData((prev) => ({
                        ...prev,
                        image: "",
                        imageKeyword: "",
                        imageType: "upload",
                      }));
                    }
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    imageSource === "upload"
                      ? "bg-[#2B5F9E] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                  }`}
                >
                  {t("admin.news.form.useUpload")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageSource("unsplash");
                    setUnsplashResults([]);
                    setUnsplashError(null);
                    setCoverError(null);
                    setSelectedUnsplashId(null);
                    // 如果当前 formData.image 是图片 URL，保存到 uploadedImageUrl 并清空搜索框
                    if (
                      formData.image &&
                      isImageUrl(formData.image) &&
                      !isUnsplashUrl(formData.image)
                    ) {
                      setUploadedImageUrl(formData.image);
                      setFormData((prev) => ({
                        ...prev,
                        image: "",
                        imageType: "unsplash",
                      }));
                    }
                    setFormData((prev) => ({
                      ...prev,
                      imageType: "unsplash",
                      imageKeyword: unsplashKeyword,
                    }));
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    imageSource === "unsplash"
                      ? "bg-[#2B5F9E] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                  }`}
                >
                  {t("admin.news.form.useUnsplash")}
                </button>
              </div>

              {/* Unsplash Option */}
              {imageSource === "unsplash" && (
                <div className="space-y-3">
                  <label className="block text-gray-700">
                    {t("admin.news.form.unsplashKeywords")}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={t(
                        "admin.news.form.unsplashKeywordsPlaceholder"
                      )}
                      value={unsplashKeyword}
                      onChange={(e) => {
                        setUnsplashKeyword(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          imageKeyword: e.target.value,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleUnsplashSearch();
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                    <button
                      type="button"
                      onClick={handleUnsplashSearch}
                      className="px-4 py-2.5 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors min-w-[120px]"
                    >
                      {language === "zh" ? "搜索图片" : "Search"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("admin.news.form.unsplashHelp")}
                  </p>
                  {unsplashError && (
                    <p className="text-xs text-red-600" role="alert">
                      {unsplashError}
                    </p>
                  )}
                  {unsplashLoading && (
                    <p className="text-sm text-gray-600">
                      {language === "zh" ? "搜索中..." : "Searching..."}
                    </p>
                  )}
                  {formData.image && isImageUrl(formData.image) && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          {language === "zh"
                            ? "已选图片预览"
                            : "Selected image"}
                        </span>
                      </div>
                      <img
                        src={formData.image}
                        alt="Unsplash selection"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {unsplashResults.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {unsplashResults.map((photo) => {
                        const selected = selectedUnsplashId === photo.id;
                        return (
                          <button
                            type="button"
                            key={photo.id}
                            onClick={() => handleSelectUnsplash(photo)}
                            className={`relative group overflow-hidden rounded-lg border ${
                              selected
                                ? "border-[#2B5F9E] ring-2 ring-[#2B5F9E]"
                                : "border-gray-200 hover:border-[#2B5F9E]"
                            }`}
                          >
                            <img
                              src={
                                photo.urls?.small ??
                                photo.urls?.thumb ??
                                photo.urls?.regular ??
                                ""
                              }
                              alt={
                                photo.alt_description ?? photo.description ?? ""
                              }
                              className="w-full h-36 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                              {selected
                                ? language === "zh"
                                  ? "已选择"
                                  : "Selected"
                                : language === "zh"
                                  ? "使用"
                                  : "Use"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Upload Option */}
              {imageSource === "upload" && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    {language === "zh" ? "上传封面图片" : "Upload Cover Image"}
                  </label>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{t("admin.news.form.uploadImageBtn")}</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("admin.news.form.uploadHelp")}
                  </p>

                  {/* Show uploaded image preview */}
                  {imageSource === "upload" &&
                    (uploadedImage || formData.image) && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>{t("admin.news.form.imagePreview")}</span>
                        </div>
                        <img
                          src={uploadedImage || formData.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  {coverError && (
                    <p className="mt-3 text-xs text-red-600" role="alert">
                      {coverError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.titleZh")} *
                </label>
                <input
                  id="titleZh"
                  type="text"
                  value={formData.title.zh}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: { ...formData.title, zh: e.target.value },
                    });
                    handleFieldChange("titleZh", e.target.value);
                  }}
                  onBlur={() => handleFieldBlur("titleZh")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
                {touched.titleZh && errors.titleZh && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.titleZh,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.titleEn")} *
                </label>
                <input
                  id="titleEn"
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value },
                    });
                    handleFieldChange("titleEn", e.target.value);
                  }}
                  onBlur={() => handleFieldBlur("titleEn")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
                {touched.titleEn && errors.titleEn && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.titleEn,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.summaryZh")} *
                </label>
                <textarea
                  id="summaryZh"
                  value={formData.summary.zh}
                  maxLength={200}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      summary: { ...formData.summary, zh: e.target.value },
                    });
                    handleFieldChange("summaryZh", e.target.value);
                  }}
                  onBlur={() => handleFieldBlur("summaryZh")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
                {touched.summaryZh && errors.summaryZh && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.summaryZh,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.summaryEn")} *
                </label>
                <textarea
                  id="summaryEn"
                  value={formData.summary.en}
                  maxLength={200}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      summary: { ...formData.summary, en: e.target.value },
                    });
                    handleFieldChange("summaryEn", e.target.value);
                  }}
                  onBlur={() => handleFieldBlur("summaryEn")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
                {touched.summaryEn && errors.summaryEn && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.summaryEn,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
            </div>

            <NewsMediaLibrary
              assets={mediaAssets}
              language={language}
              uploading={mediaLibraryUploading}
              uploadingAssets={uploadingMediaAssets}
              error={mediaLibraryError}
              onUploadFile={(file) => void uploadMediaAssetToLibrary(file)}
              onInsertAsset={insertMediaAssetIntoEditor}
              onRemoveAsset={removeMediaAsset}
              onCancelUpload={cancelMediaUpload}
              targets={[
                {
                  lang: "zh",
                  label: language === "zh" ? "插入中文" : "Insert Chinese",
                },
                {
                  lang: "en",
                  label: language === "zh" ? "插入英文" : "Insert English",
                },
              ]}
            />

            {/* Content - Rich Text Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div id="contentZh">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    {t("admin.news.form.contentZh")} *
                  </label>
                </div>
                <div
                  className="border border-gray-300 rounded-lg overflow-hidden"
                  onDragOver={handleEditorDragOver}
                  onDrop={(event) => handleEditorDrop("zh", event)}
                >
                  <ReactQuill
                    ref={zhEditorRef}
                    theme="snow"
                    value={formData.content.zh}
                    onChange={(value: string) =>
                      updateEditorContent("zh", value)
                    }
                    onBlur={(_, __, ___) => handleFieldBlur("contentZh")}
                    modules={editorModules}
                    formats={formats}
                    className="bg-white news-inline-editor"
                  />
                </div>
                {touched.contentZh && errors.contentZh && (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.contentZh,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
              <div id="contentEn">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    {t("admin.news.form.contentEn")} *
                  </label>
                </div>
                <div
                  className="border border-gray-300 rounded-lg overflow-hidden"
                  onDragOver={handleEditorDragOver}
                  onDrop={(event) => handleEditorDrop("en", event)}
                >
                  <ReactQuill
                    ref={enEditorRef}
                    theme="snow"
                    value={formData.content.en}
                    onChange={(value: string) =>
                      updateEditorContent("en", value)
                    }
                    onBlur={(_, __, ___) => handleFieldBlur("contentEn")}
                    modules={editorModules}
                    formats={formats}
                    className="bg-white news-inline-editor"
                  />
                </div>
                {touched.contentEn && errors.contentEn && (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {getErrorMessage(
                      errors.contentEn,
                      validationConfig.errorMessages,
                      language
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer with Buttons (scrolls with content) */}
          <div className="pt-6 mt-6 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading || hasPendingMediaUpload}
            >
              {language === "zh" ? "取消" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading || hasPendingMediaUpload}
            >
              <Save className="w-5 h-5" />
              {formLoading
                ? language === "zh"
                  ? "保存中..."
                  : "Saving..."
                : language === "zh"
                  ? "保存为草稿"
                  : "Save draft"}
            </button>
            <button
              type="button"
              onClick={handlePublishAttempt}
              className="flex-1 px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading || hasPendingMediaUpload}
            >
              <Save className="w-5 h-5" />
              {formLoading
                ? language === "zh"
                  ? "提交中..."
                  : "Submitting..."
                : language === "zh"
                  ? "发布"
                  : "Publish"}
            </button>
          </div>
          {hasPendingMediaUpload && (
            <p className="mt-3 text-sm text-amber-700">
              {language === "zh"
                ? "媒体仍在上传，上传完成后才能关闭、保存或发布。"
                : "A media upload is still in progress. Wait for it to finish before closing, saving, or publishing."}
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
}

type NewsMediaLibraryTarget = {
  lang: "zh" | "en";
  label: string;
};

export function NewsMediaLibrary({
  assets,
  language,
  uploading,
  uploadingAssets,
  error,
  onUploadFile,
  onInsertAsset,
  onRemoveAsset,
  onCancelUpload,
  targets,
}: {
  assets: NewsMediaAsset[];
  language: "zh" | "en";
  uploading: boolean;
  uploadingAssets: NewsMediaUploadPreview[];
  error: string | null;
  onUploadFile: (file: File) => void | Promise<void>;
  onInsertAsset: (lang: "zh" | "en", asset: NewsMediaAsset) => void;
  onRemoveAsset: (assetId: string) => void;
  onCancelUpload: (uploadId: string) => void;
  targets: NewsMediaLibraryTarget[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasMediaItems = assets.length > 0 || uploadingAssets.length > 0;

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    asset: NewsMediaAsset
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(NEWS_MEDIA_DRAG_TYPE, JSON.stringify(asset));
    event.dataTransfer.setData("text/html", getNewsMediaAssetHtml(asset));
    event.dataTransfer.setData("text/plain", asset.url);
    event.dataTransfer.setData("text/uri-list", asset.url);
  };

  return (
    <section className="sticky top-0 z-10 rounded-xl border border-blue-100 bg-white p-3 shadow-lg lg:static lg:p-4 lg:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-[#2B5F9E] sm:text-base">
            {language === "zh"
              ? "当前新闻素材库"
              : "Current News Media Library"}
          </h3>
          <p className="mt-1 hidden text-xs text-gray-600 sm:block">
            {language === "zh"
              ? "上传一次图片或视频后，可插入中文或英文正文。"
              : "Upload an image or video once, then reuse it in either editor."}
          </p>
          <p className="mt-1 text-xs text-gray-600 sm:hidden">
            {language === "zh"
              ? "上传后点“中文”或“英文”插入到对应正文。"
              : "Upload media, then tap ZH or EN to insert into that editor."}
          </p>
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept={NEWS_MEDIA_ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void onUploadFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2B5F9E] px-3 py-2 text-xs text-white transition-colors hover:bg-[#234a7e] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>
              {uploading
                ? language === "zh"
                  ? "上传中..."
                  : "Uploading..."
                : language === "zh"
                  ? "上传素材"
                  : "Upload media"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!hasMediaItems ? (
        <div className="mt-3 rounded-lg border border-dashed border-blue-200 bg-white/70 p-3 text-xs text-gray-500 sm:text-sm">
          {language === "zh"
            ? "还没有素材。上传封面、正文图片或视频后会自动出现在这里。"
            : "No media yet. Cover images, body images, and videos will appear here after upload."}
        </div>
      ) : (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
          {uploadingAssets.map((upload) => (
            <article
              key={upload.id}
              style={NEWS_MEDIA_CARD_STYLE}
              className="relative flex items-center gap-2 rounded-lg border border-blue-100 bg-white p-2 shadow-md ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => onCancelUpload(upload.id)}
                style={NEWS_MEDIA_REMOVE_BUTTON_STYLE}
                className="absolute z-20 rounded-full bg-red-600 p-0.5 text-white shadow-sm ring-2 ring-white transition-colors hover:bg-red-700"
                aria-label={
                  language === "zh" ? "取消上传素材" : "Cancel media upload"
                }
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  {upload.type === "image" ? (
                    <ImageIcon className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pr-3">
                <p
                  style={NEWS_MEDIA_NAME_STYLE}
                  className="text-[11px] text-gray-600"
                  title={upload.name}
                >
                  {upload.name}
                </p>
                <p className="text-[11px] font-medium text-[#2B5F9E]">
                  {language === "zh" ? "上传中..." : "Uploading..."}{" "}
                  {upload.progress}%
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-[#2B5F9E] transition-[width]"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
          {assets.map((asset) => (
            <article
              key={asset.id}
              draggable
              onDragStart={(event) => handleDragStart(event, asset)}
              style={NEWS_MEDIA_CARD_STYLE}
              className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-md ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => onRemoveAsset(asset.id)}
                style={NEWS_MEDIA_REMOVE_BUTTON_STYLE}
                className="absolute z-20 rounded-full bg-red-600 p-0.5 text-white shadow-sm ring-2 ring-white transition-colors hover:bg-red-700"
                aria-label={
                  language === "zh" ? "删除素材" : "Remove media asset"
                }
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {asset.type === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={`${asset.url}#t=0.1`}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                <span className="absolute left-1 top-1 inline-flex items-center rounded-full bg-black/60 p-1 text-white">
                  {asset.type === "image" ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <Video className="h-3 w-3" />
                  )}
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pr-3">
                <p
                  style={NEWS_MEDIA_NAME_STYLE}
                  className="text-[11px] text-gray-600"
                  title={asset.name}
                >
                  {asset.name}
                </p>
                <div className="flex gap-1">
                  {targets.map((target) => (
                    <button
                      key={`${asset.id}:${target.lang}`}
                      type="button"
                      onClick={() => onInsertAsset(target.lang, asset)}
                      className="rounded-md bg-[#6BA868] px-1.5 py-0.5 text-[10px] leading-4 text-white transition-colors hover:bg-[#5a9157]"
                    >
                      <span className="sm:hidden">
                        {target.lang === "zh"
                          ? language === "zh"
                            ? "中文"
                            : "ZH"
                          : language === "zh"
                            ? "英文"
                            : "EN"}
                      </span>
                      <span className="hidden sm:inline">{target.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
