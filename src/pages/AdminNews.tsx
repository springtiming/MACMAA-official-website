import { useEffect, useState } from "react";
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
import ReactQuill from "react-quill@2.0.0-beta.2";
import type { ReactQuillProps } from "react-quill@2.0.0-beta.2";
import "react-quill@2.0.0-beta.2/dist/quill.snow.css";
import { ImageUploadModal } from "../components/ImageUploadModal";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.news.deleteConfirm"))) return;
    try {
      await deleteArticle(id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
      const drafts = await fetchMyDrafts();
      setDraftList(drafts);
      setSuccess(language === "zh" ? "已删除" : "Deleted");
    } catch {
      setError(t("common.error"));
    }
  };

  const handleEdit = (news: NewsPostRecord) => {
    setUploadedImage(news.cover_source ?? "");
    setEditingArticle(news);
    setEditingDraft(null);
    setDraftVersionId(null);
    setShowForm(true);
  };

  const handleEditDraft = (draft: ArticleVersionRecord) => {
    setUploadedImage(draft.cover_source ?? "");
    setEditingDraft(draft);
    setEditingArticle(null);
    setDraftVersionId(draft.id);
    setShowForm(true);
  };

  const handleSave = async (news: NewsFormState) => {
    setFormLoading(true);
    try {
      const draft = await saveNewsDraft({
        id: news.id || editingArticle?.id || editingDraft?.article_id,
        title_zh: news.title.zh,
        title_en: news.title.en,
        summary_zh: news.summary.zh,
        summary_en: news.summary.en,
        content_zh: news.content.zh,
        content_en: news.content.en,
        cover_source: news.image || null,
      });
      setDraftVersionId(draft.id);
      setSuccess(language === "zh" ? "草稿已保存" : "Draft saved");
      const drafts = await fetchMyDrafts();
      setDraftList(drafts);
    } catch (err) {
      setError(t("common.error"));
      // Fallback: create a local draft so the UI responds even if API fails
      const localDraft: ArticleVersionRecord = {
        id: `local-${Date.now()}`,
        article_id: news.id || editingArticle?.id || editingDraft?.article_id || `local-article-${Date.now()}`,
        title_zh: news.title.zh,
        title_en: news.title.en,
        summary_zh: news.summary.zh,
        summary_en: news.summary.en,
        content_zh: news.content.zh,
        content_en: news.content.en,
        cover_source: news.image || null,
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
    setFormLoading(false);
  };
  const handlePublish = async (news: NewsFormState) => {
    setFormLoading(true);
    try {
      let versionId = draftVersionId;
      if (!versionId) {
        const draft = await saveNewsDraft({
          id: news.id || editingArticle?.id || editingDraft?.article_id,
          title_zh: news.title.zh,
          title_en: news.title.en,
          summary_zh: news.summary.zh,
          summary_en: news.summary.en,
          content_zh: news.content.zh,
          content_en: news.content.en,
          cover_source: news.image || null,
        });
        versionId = draft.id;
      }

      const result = await publishNewsFromDraft(versionId);
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
      // Fallback: publish locally so the UI updates even if API fails
      const localArticle: NewsPostRecord = {
        id: news.id || editingArticle?.id || `local-article-${Date.now()}`,
        title_zh: news.title.zh,
        title_en: news.title.en,
        summary_zh: news.summary.zh,
        summary_en: news.summary.en,
        content_zh: news.content.zh,
        content_en: news.content.en,
        cover_source: news.image || null,
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
    setFormLoading(false);
  };

  const handleImageUpload = () => {
    setShowImageUploadModal(true);
  };

  const handleImageUploadClose = () => {
    setShowImageUploadModal(false);
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setShowImageUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
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
                      <p className="text-xs text-gray-500">
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
                        onClick={async () => {
                          if (
                            !confirm(
                              language === "zh"
                                ? "确认删除草稿？"
                                : "Delete draft?"
                            )
                          )
                            return;
                          try {
                            await deleteDraft(draft.id);
                            setDraftList((prev) =>
                              prev.filter((d) => d.id !== draft.id)
                            );
                            setSuccess(
                              language === "zh" ? "草稿已删除" : "Draft deleted"
                            );
                          } catch {
                            setError(t("common.error"));
                          }
                        }}
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
                          {pickLocalized(news.title_zh, news.title_en, language)}
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
                        {pickLocalized(news.summary_zh, news.summary_en, language)}
                      </p>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
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

              {filteredNews.length === 0 && (
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
            formLoading={formLoading}
          />
        )}

        {/* Image Upload Modal */}
        {showImageUploadModal && (
          <ImageUploadModal
            onClose={handleImageUploadClose}
            onSuccess={handleImageUploadSuccess}
          />
        )}
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
};

function NewsFormModal({
  news,
  draft,
  onSave,
  onPublish,
  onClose,
  handleImageUpload,
  uploadedImage,
  formLoading,
}: {
  news: NewsPostRecord | null;
  draft: ArticleVersionRecord | null;
  onSave: (news: NewsFormState) => void;
  onPublish: (news: NewsFormState) => void;
  onClose: () => void;
  handleImageUpload: () => void;
  uploadedImage: string;
  formLoading: boolean;
}) {
  const { language, t } = useLanguage();
  const initialCover = draft?.cover_source || news?.cover_source || "";
  
  // 辅助函数：判断字符串是否为图片 URL
  const isImageUrl = (str: string): boolean => {
    return (
      str.startsWith("http") ||
      str.startsWith("/") ||
      str.startsWith("data:") ||
      str.startsWith("blob:")
    );
  };
  
  const [imageSource, setImageSource] = useState<"unsplash" | "upload">(() => {
    if (!initialCover) return "upload";
    if (isImageUrl(initialCover)) {
      return "upload";
    }
    return "unsplash";
  });
  
  // 状态：保存上传的图片 URL（用于在模式切换时恢复）
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(() => {
    if (initialCover && isImageUrl(initialCover)) {
      return initialCover;
    }
    return "";
  });
  const [fullscreenEditor, setFullscreenEditor] = useState<"zh" | "en" | null>(
    null
  );
  const [formData, setFormData] = useState<NewsFormState>(() => {
    const coverSource = draft?.cover_source || news?.cover_source || "";
    const isCoverImageUrl = coverSource && isImageUrl(coverSource);
    
    if (draft) {
      return {
        id: draft.article_id ?? "",
        title: { zh: draft.title_zh ?? "", en: draft.title_en ?? "" },
        summary: { zh: draft.summary_zh ?? "", en: draft.summary_en ?? "" },
        content: { zh: draft.content_zh ?? "", en: draft.content_en ?? "" },
        date: new Date().toISOString().split("T")[0],
        // 如果是图片 URL 且当前模式是 unsplash，则清空（避免在搜索框显示 URL）
        // 否则使用 coverSource（图片 URL 或关键词）
        image: isCoverImageUrl && imageSource === "unsplash" ? "" : coverSource,
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
        // 如果是图片 URL 且当前模式是 unsplash，则清空（避免在搜索框显示 URL）
        // 否则使用 coverSource（图片 URL 或关键词）
        image: isCoverImageUrl && imageSource === "unsplash" ? "" : coverSource,
      };
    }
    return {
      id: "",
      title: { zh: "", en: "" },
      summary: { zh: "", en: "" },
      content: { zh: "", en: "" },
      date: new Date().toISOString().split("T")[0],
      image: "",
    };
  });

  useEffect(() => {
    if (uploadedImage) {
      setImageSource("upload");
      setUploadedImageUrl(uploadedImage);
      setFormData((prev) => ({ ...prev, image: uploadedImage }));
    }
  }, [uploadedImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto"
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
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mt-8 max-h-[90vh] overflow-hidden flex flex-col"
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
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
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
                    // 如果之前保存了上传的图片 URL，恢复它
                    if (uploadedImageUrl) {
                      setFormData((prev) => ({ ...prev, image: uploadedImageUrl }));
                    } else if (formData.image && !isImageUrl(formData.image)) {
                      // 如果 uploadedImageUrl 不存在，且当前 formData.image 是关键词（不是图片 URL），则清空
                      setFormData((prev) => ({ ...prev, image: "" }));
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
                    // 如果当前 formData.image 是图片 URL，保存到 uploadedImageUrl 并清空搜索框
                    if (formData.image && isImageUrl(formData.image)) {
                      setUploadedImageUrl(formData.image);
                      setFormData((prev) => ({ ...prev, image: "" }));
                    }
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
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t("admin.news.form.unsplashKeywords")}
                  </label>
                  <input
                    type="text"
                    placeholder={t(
                      "admin.news.form.unsplashKeywordsPlaceholder"
                    )}
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("admin.news.form.unsplashHelp")}
                  </p>
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
                  type="text"
                  required
                  value={formData.title.zh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, zh: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.titleEn")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.summaryZh")} *
                </label>
                <textarea
                  required
                  value={formData.summary.zh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      summary: { ...formData.summary, zh: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.news.form.summaryEn")} *
                </label>
                <textarea
                  required
                  value={formData.summary.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      summary: { ...formData.summary, en: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Content - Rich Text Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
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
                    onChange={(value: string) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, zh: value },
                      })
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-white"
                    style={{ height: "300px", marginBottom: "42px" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === "zh"
                    ? "支持富文本格式、插入图片等"
                    : "Supports rich text formatting and image insertion"}
                </p>
              </div>
              <div>
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
                    onChange={(value: string) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, en: value },
                      })
                    }
                    modules={modules}
                    formats={formats}
                    className="bg-white"
                    style={{ height: "300px", marginBottom: "42px" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === "zh"
                    ? "支持富文本格式、插入图片等"
                    : "Supports rich text formatting and image insertion"}
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t flex gap-3">
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
              onClick={() => onPublish(formData)}
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
