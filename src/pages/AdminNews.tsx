import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  Maximize2,
  Minimize2,
} from "lucide-react";
import { createPortal } from "react-dom";
import ReactQuill from "react-quill@2.0.0-beta.2";
import type { ReactQuillProps } from "react-quill@2.0.0-beta.2";
import "react-quill@2.0.0-beta.2/dist/quill.snow.css";
import { ImageUploadModal } from "../components/ImageUploadModal";
import { ProcessingOverlay } from "../components/ProcessingOverlay";
import { useProcessingFeedback } from "../hooks/useProcessingFeedback";
import { AdminConfirmDialog } from "../components/AdminConfirmDialog";
import { searchPhotos, type UnsplashPhoto } from "../lib/unsplashApi";
import {
  fetchAdminNewsPosts,
  fetchMyDrafts,
  publishNewsFromDraft,
  saveNewsDraft,
  deleteArticle,
  deleteDraft,
  type NewsPostRecord,
  type ArticleVersionRecord,
} from "../lib/supabaseApi";
import { pickLocalized } from "../lib/supabaseHelpers";
import {
  type ErrorMessages,
  type FormErrors,
  type ValidationConfig,
  type ValidationRules,
  getErrorMessage,
  scrollToFirstError,
  validateField as validateFieldUtil,
  validateForm as validateFormUtil,
} from "../lib/formValidation";

export function AdminNews() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
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
    reset: resetProcessing,
  } = useProcessingFeedback();

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
      news.cover_url ||
      (news.cover_source && news.cover_source.startsWith("http")
        ? news.cover_source
        : "");
    setUploadedImage(coverUrl ?? "");
    setEditingArticle(news);
    setEditingDraft(null);
    setDraftVersionId(null);
    setShowForm(true);
  };

  const handleEditDraft = (draft: ArticleVersionRecord) => {
    const coverUrl =
      draft.cover_url ||
      (draft.cover_source && draft.cover_source.startsWith("http")
        ? draft.cover_source
        : "");
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
      await runWithFeedback(messages, async () => {
        if (type === "delete") {
          await deleteArticle(targetId);
          setNewsList((prev) => prev.filter((n) => n.id !== targetId));
          const drafts = await fetchMyDrafts();
          setDraftList(drafts);
          setSuccess(language === "zh" ? "已删除" : "Deleted");
        } else {
          await deleteDraft(targetId);
          setDraftList((prev) => prev.filter((d) => d.id !== targetId));
          setSuccess(language === "zh" ? "草稿已删除" : "Draft deleted");
        }
      });
    } catch {
      setError(t("common.error"));
    }
  };

  const buildCoverFields = (news: NewsFormState) => {
    const type = news.imageType || "upload";
    const keyword = type === "unsplash" ? news.imageKeyword.trim() : "";
    const url =
      type === "upload"
        ? news.image || uploadedImage || uploadedImageUrl || ""
        : news.image;
    const coverSource = url || keyword || null;
    return {
      cover_source: coverSource,
      cover_type: type,
      cover_keyword: keyword || null,
      cover_url: url || null,
    };
  };

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
          // 记录当前正在编辑的草稿版本以及对应的新闻编号
          setDraftVersionId(draft.id);
          setEditingDraft(draft);
          setEditingArticle(null);
          setSuccess(language === "zh" ? "草稿已保存" : "Draft saved");
          const drafts = await fetchMyDrafts();
          setDraftList(drafts);
        } catch (err) {
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
      setFormLoading(false);
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
            versionId = draft.id;
            setEditingDraft(draft);
            setEditingArticle(null);
          }

          const result = await publishNewsFromDraft(versionId!);
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
          setDraftList(drafts);
        } catch (err) {
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
      setFormLoading(false);
    }
  };

  const handleImageUpload = () => {
    setShowImageUploadModal(true);
  };

  const handleImageUploadClose = () => {
    setShowImageUploadModal(false);
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setUploadedImageUrl(imageUrl);
    setShowImageUploadModal(false);
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
            onClick={() => navigate("/admin/dashboard")}
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
            formLoading={formLoading}
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
  date: string;
  image: string;
  imageKeyword: string;
  imageType: "unsplash" | "upload";
};

type NewsValidationFields = {
  date: string;
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

const newsValidationRules: ValidationRules<NewsValidationFields> = {
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    errorType: "invalidDate",
    required: true,
  },
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
    pattern: /^.{10,500}$/,
    errorType: "invalidSummaryZh",
    required: true,
  },
  summaryEn: {
    pattern: /^.{10,500}$/,
    errorType: "invalidSummaryEn",
    required: true,
  },
  contentZh: {
    validate: hasRichTextContent,
    errorType: "invalidContentZh",
    required: true,
  },
  contentEn: {
    validate: hasRichTextContent,
    errorType: "invalidContentEn",
    required: true,
  },
};

const newsErrorMessages: ErrorMessages = {
  required: {
    zh: "此字段为必填项",
    en: "This field is required",
  },
  invalidDate: {
    zh: "请选择发布日期",
    en: "Please select a publish date",
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
    zh: "请输入10-500字的中文摘要",
    en: "Enter a Chinese summary between 10 and 500 characters",
  },
  invalidSummaryEn: {
    zh: "请输入10-500字的英文摘要",
    en: "Enter an English summary between 10 and 500 characters",
  },
  invalidContentZh: {
    zh: "请输入中文正文内容",
    en: "Enter the Chinese body content",
  },
  invalidContentEn: {
    zh: "请输入英文正文内容",
    en: "Enter the English body content",
  },
};

const mapNewsFormToValidation = (
  data: NewsFormState
): NewsValidationFields => ({
  date: data.date,
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
  const initialCoverUrl =
    draft?.cover_url ||
    news?.cover_url ||
    (draft?.cover_source && draft.cover_source.startsWith("http")
      ? draft.cover_source
      : news?.cover_source && news.cover_source.startsWith("http")
        ? news.cover_source
        : "");
  const initialCoverKeyword =
    draft?.cover_keyword ||
    news?.cover_keyword ||
    (!initialCoverUrl ? (draft?.cover_source ?? news?.cover_source ?? "") : "");
  const initialCoverType =
    draft?.cover_type ||
    news?.cover_type ||
    (initialCoverUrl ? "upload" : initialCoverKeyword ? "unsplash" : "upload");

  // 辅助函数：判断字符串是否为图片 URL
  const isImageUrl = (str: string): boolean => {
    return (
      str.startsWith("http") ||
      str.startsWith("/") ||
      str.startsWith("data:") ||
      str.startsWith("blob:")
    );
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

  // 状态：保存上传的图片 URL（用于在模式切换时恢复）
  // 由父组件传入，避免多份状态不一致
  // const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(() => {
  //   return initialCoverUrl || "";
  // });
  const [fullscreenEditor, setFullscreenEditor] = useState<"zh" | "en" | null>(
    null
  );
  const [formData, setFormData] = useState<NewsFormState>(() => {
    const coverSource = draft?.cover_source || news?.cover_source || "";
    const coverUrl = draft?.cover_url || news?.cover_url || uploadedImageUrl;
    const coverKeyword =
      draft?.cover_keyword || news?.cover_keyword || unsplashKeyword;
    const isCoverImageUrl = !!coverUrl && isImageUrl(coverUrl);
    const isCoverUnsplash = !!coverUrl && isUnsplashUrl(coverUrl);

    if (draft) {
      return {
        id: draft.article_id ?? "",
        title: { zh: draft.title_zh ?? "", en: draft.title_en ?? "" },
        summary: { zh: draft.summary_zh ?? "", en: draft.summary_en ?? "" },
        content: { zh: draft.content_zh ?? "", en: draft.content_en ?? "" },
        date: new Date().toISOString().split("T")[0],
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
        content: { zh: news.content_zh ?? "", en: news.content_en ?? "" },
        date: news.published_at
          ? news.published_at.slice(0, 10)
          : new Date().toISOString().split("T")[0],
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
      date: new Date().toISOString().split("T")[0],
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
      setImageSource("upload");
      setUploadedImageUrl(uploadedImage);
      setFormData((prev) => ({
        ...prev,
        image: uploadedImage,
        imageKeyword: "",
        imageType: "upload",
      }));
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

  const validateBeforePublish = (): boolean => {
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
    onSave(formData);
  };

  const handlePublishAttempt = () => {
    if (!validateBeforePublish()) return;
    onPublish(formData);
  };

  // Quill editor modules configuration
  const modules: NonNullable<ReactQuillProps["modules"]> = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats: NonNullable<ReactQuillProps["formats"]> = [
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
  ];

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${
        isImageUploadModalOpen ? "z-[48]" : "z-50"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
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
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.news.form.date")} *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  handleFieldChange("date", e.target.value);
                }}
                onBlur={() => handleFieldBlur("date")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
              {touched.date && errors.date && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {getErrorMessage(
                    errors.date,
                    validationConfig.errorMessages,
                    language
                  )}
                </p>
              )}
            </div>

            {/* Image Section - Unsplash or Upload */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-gray-700 mb-4">
                {t("admin.news.form.coverImageSettings")}
              </h3>

              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource("upload");
                    setUnsplashResults([]);
                    setUnsplashError(null);
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

            {/* Content - Rich Text Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div id="contentZh">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    {t("admin.news.form.contentZh")} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFullscreenEditor("zh")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2B5F9E] hover:bg-blue-50 rounded-lg transition-colors"
                    title={t("admin.news.form.fullscreenEdit")}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>{t("admin.news.form.fullscreenEdit")}</span>
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content.zh}
                    onChange={(value: string) => {
                      setFormData({
                        ...formData,
                        content: { ...formData.content, zh: value },
                      });
                      handleFieldChange("contentZh", value);
                    }}
                    onBlur={(_, __, ___) => handleFieldBlur("contentZh")}
                    modules={modules}
                    formats={formats}
                    className="bg-white"
                    style={{ height: "300px", marginBottom: "42px" }}
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
                <p className="text-xs text-gray-500 mt-2">
                  {language === "zh"
                    ? "支持富文本格式、插入图片等"
                    : "Supports rich text formatting and image insertion"}
                </p>
              </div>
              <div id="contentEn">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700">
                    {t("admin.news.form.contentEn")} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFullscreenEditor("en")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2B5F9E] hover:bg-blue-50 rounded-lg transition-colors"
                    title={t("admin.news.form.fullscreenEdit")}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>{t("admin.news.form.fullscreenEdit")}</span>
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content.en}
                    onChange={(value: string) => {
                      setFormData({
                        ...formData,
                        content: { ...formData.content, en: value },
                      });
                      handleFieldChange("contentEn", value);
                    }}
                    onBlur={(_, __, ___) => handleFieldBlur("contentEn")}
                    modules={modules}
                    formats={formats}
                    className="bg-white"
                    style={{ height: "300px", marginBottom: "42px" }}
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
                <p className="text-xs text-gray-500 mt-2">
                  {language === "zh"
                    ? "支持富文本格式、插入图片等"
                    : "Supports rich text formatting and image insertion"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Buttons (scrolls with content) */}
          <div className="pt-6 mt-6 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading}
            >
              {language === "zh" ? "取消" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading}
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
              disabled={formLoading}
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
        </form>

        {/* Fullscreen Editor Modal */}
        <AnimatePresence>
          {fullscreenEditor && (
            <FullscreenEditorModal
              lang={fullscreenEditor}
              content={formData.content[fullscreenEditor]}
              onSave={(content) => {
                setFormData({
                  ...formData,
                  content: { ...formData.content, [fullscreenEditor]: content },
                });
                setFullscreenEditor(null);
              }}
              onClose={() => setFullscreenEditor(null)}
              modules={modules}
              formats={formats}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
}

// Fullscreen Editor Modal Component
function FullscreenEditorModal({
  lang,
  content,
  onSave,
  onClose,
  modules,
  formats,
}: {
  lang: "zh" | "en";
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
  modules: NonNullable<ReactQuillProps["modules"]>;
  formats: string[];
}) {
  const { language, t } = useLanguage();
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onSave(editContent);
  };

  const langLabel =
    lang === "zh"
      ? language === "zh"
        ? "中文"
        : "Chinese"
      : language === "zh"
        ? "英文"
        : "English";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex flex-col z-[60]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex flex-col m-4"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl flex items-center gap-2">
              <Maximize2 className="w-6 h-6" />
              <span>
                {t("admin.news.form.fullscreenTitle")}
                {langLabel}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#6BA868] hover:bg-[#5a9157] rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {t("admin.news.form.saveDraft")}
                </span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {t("admin.news.form.exitFullscreen")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 bg-white rounded-b-2xl overflow-hidden flex flex-col">
          <div className="flex-1 p-4 overflow-auto">
            <ReactQuill
              theme="snow"
              value={editContent}
              onChange={setEditContent}
              modules={modules}
              formats={formats}
              className="bg-white h-full"
              style={{ height: "calc(100% - 42px)" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
