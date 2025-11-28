import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, ArrowRight } from "lucide-react";
import { fetchNewsPosts, type NewsPostRecord } from "../lib/supabaseApi";
import { pickLocalized, resolveNewsCover } from "../lib/supabaseHelpers";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function NewsList() {
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchNewsPosts({ publishedOnly: true })
      .then((data) => {
        if (!active) return;
        setNews(data);
      })
      .catch(() => {
        if (!active) return;
        setError(t("common.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === "zh" ? "未公布" : "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2">
          {t("news.title")}
        </h1>
      </motion.div>

      {loading && <p className="text-gray-600 px-2">{t("common.loading")}</p>}

      {error && (
        <p className="text-red-600 px-2" role="alert">
          {error}
        </p>
      )}

      {!loading && news.length === 0 && (
        <p className="text-gray-600 px-2">
          {language === "zh" ? "暂时没有新闻" : "No news yet."}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Link
              to={`/news/${item.id}`}
              className="block bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full"
            >
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <ImageWithFallback
                  src={resolveNewsCover(item.cover_source, "thumb")}
                  alt={pickLocalized(item.title_zh, item.title_en, language)}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{formatDate(item.published_at)}</span>
                </div>
                <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-lg sm:text-xl">
                  {pickLocalized(item.title_zh, item.title_en, language)}
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                  {pickLocalized(item.summary_zh, item.summary_en, language)}
                </p>
                <div className="flex items-center gap-2 text-[#2B5F9E] text-sm sm:text-base">
                  <span>{t("news.readMore")}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
