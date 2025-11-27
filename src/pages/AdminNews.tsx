import { useState } from "react";
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

interface News {
  id: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  content: { zh: string; en: string };
  date: string;
  image: string;
}

// Mock data
const mockNews: News[] = [
  {
    id: "1",
    title: {
      zh: "MACMAA 2025年度新春团拜会圆满落幕",
      en: "MACMAA 2025 Chinese New Year Celebration Successfully Concluded",
    },
    summary: {
      zh: "2025年1月25日，澳洲万年市华人互助会在社区中心成功举办了年度新春团拜会，近百位社区成员共聚一堂。",
      en: "On January 25, 2025, MACMAA successfully hosted the annual Chinese New Year celebration at the community center with nearly 100 attendees.",
    },
    content: {
      zh: "<p>活动现场气氛热烈，会员们表演了太极、舞蹈、歌曲等精彩节目。</p><p><strong>活动亮点：</strong></p><ul><li>太极拳表演</li><li>传统舞蹈</li><li>卡拉OK歌唱</li><li>美食分享</li></ul><p>美食分享环节更是让大家品尝到了来自各地的传统美食，共同庆祝新春佳节。</p>",
      en: "<p>The event featured Tai Chi, dance performances, and singing.</p><p><strong>Highlights:</strong></p><ul><li>Tai Chi performance</li><li>Traditional dances</li><li>Karaoke singing</li><li>Food sharing</li></ul><p>The food sharing session allowed everyone to enjoy traditional dishes from various regions.</p>",
    },
    date: "2025-01-26",
    image: "chinese,new,year,celebration",
  },
  {
    id: "2",
    title: {
      zh: "健康讲座：老年人慢性病防治",
      en: "Health Seminar: Chronic Disease Prevention for Seniors",
    },
    summary: {
      zh: "本月健康讲座邀请了专业医生讲解老年慢性病的预防与管理，吸引了50多位会员参加。",
      en: "This month's health seminar invited professional doctors to discuss chronic disease prevention and management, attracting over 50 members.",
    },
    content: {
      zh: "<p>讲座内容包括高血压、糖尿病、心脏病等常见慢性病的预防措施、日常管理方法，以及饮食和运动建议。</p><p><strong>主要内容：</strong></p><ol><li>慢性病的早期识别</li><li>日常管理技巧</li><li>饮食调理方法</li><li>适合老年人的运动</li></ol><p>参加者纷纷表示受益匪浅。</p>",
      en: "<p>The seminar covered prevention measures, daily management methods, and diet and exercise recommendations for common chronic diseases such as hypertension, diabetes, and heart disease.</p><p><strong>Main Topics:</strong></p><ol><li>Early identification of chronic diseases</li><li>Daily management techniques</li><li>Dietary adjustments</li><li>Suitable exercises for seniors</li></ol><p>Participants found the seminar very beneficial.</p>",
    },
    date: "2025-02-12",
    image: "health,seminar,seniors",
  },
];

export function AdminNews() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<News[]>(mockNews);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");

  // Filter news
  const filteredNews = newsList.filter(
    (news) =>
      news.title.zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingNews(null);
    setShowForm(true);
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("admin.news.deleteConfirm"))) {
      setNewsList(newsList.filter((n) => n.id !== id));
    }
  };

  const handleSave = (news: News) => {
    if (editingNews) {
      setNewsList(newsList.map((n) => (n.id === news.id ? news : n)));
    } else {
      setNewsList([...newsList, { ...news, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingNews(null);
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
        <div className="space-y-4">
          {filteredNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-[#2B5F9E] text-lg sm:text-xl mb-2">
                    {news.title[language]}
                  </h3>
                  <p className="text-gray-600 mb-3">{news.summary[language]}</p>
                  <div className="text-sm text-gray-500">{news.date}</div>
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
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1 md:flex-initial"
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

        {/* News Form Modal */}
        {showForm && (
          <NewsFormModal
            news={editingNews}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingNews(null);
            }}
            handleImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
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
function NewsFormModal({
  news,
  onSave,
  onClose,
  handleImageUpload,
  uploadedImage,
}: {
  news: News | null;
  onSave: (news: News) => void;
  onClose: () => void;
  handleImageUpload: () => void;
  uploadedImage: string;
}) {
  const { language, t } = useLanguage();
  const [imageSource, setImageSource] = useState<"unsplash" | "upload">(
    "unsplash"
  );
  const [fullscreenEditor, setFullscreenEditor] = useState<"zh" | "en" | null>(
    null
  );
  const [formData, setFormData] = useState<News>(
    news || {
      id: "",
      title: { zh: "", en: "" },
      summary: { zh: "", en: "" },
      content: { zh: "", en: "" },
      date: new Date().toISOString().split("T")[0],
      image: "",
    }
  );

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

  const formats = [
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col"
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
                  onClick={() => setImageSource("unsplash")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    imageSource === "unsplash"
                      ? "bg-[#2B5F9E] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                  }`}
                >
                  {t("admin.news.form.useUnsplash")}
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource("upload")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    imageSource === "upload"
                      ? "bg-[#2B5F9E] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                  }`}
                >
                  {t("admin.news.form.useUpload")}
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
                  {uploadedImage && (
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>{t("admin.news.form.imagePreview")}</span>
                      </div>
                      <img
                        src={uploadedImage}
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
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("admin.news.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t("admin.news.save")}
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
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
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
                <span className="hidden sm:inline">{t("admin.news.save")}</span>
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
