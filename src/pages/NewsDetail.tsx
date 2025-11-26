import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { mockNews } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function NewsDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const news = mockNews.find((n) => n.id === Number(id));

  if (!news) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">News not found</p>
        <Link
          to="/news"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("news.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("news.back")}
        </Link>

        {/* Featured Image */}
        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-6">
          <ImageWithFallback
            src={`https://source.unsplash.com/1200x675/?${news.image}`}
            alt={news.title[language]}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-[#2B5F9E] mb-4">{news.title[language]}</h1>
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{news.date}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-[#2B5F9E] hover:underline"
            >
              <Share2 className="w-4 h-4" />
              {t("news.share")}
            </motion.button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 whitespace-pre-line">
            {news.content[language]}
          </div>
        </div>

        {/* Related News or CTA */}
        <div className="mt-12 p-6 bg-[#F5EFE6] rounded-2xl">
          <h3 className="text-[#2B5F9E] mb-4">{t("nav.events")}</h3>
          <p className="text-gray-700 mb-4">
            {language === "zh"
              ? "查看我们即将举办的精彩活动"
              : "Check out our upcoming exciting events"}
          </p>
          <Link to="/events">
            <motion.button
              className="px-6 py-2 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("nav.events")}
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
