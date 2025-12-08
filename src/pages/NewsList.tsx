import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { NewsSkeleton } from "../components/NewsSkeleton";
import { useState, useEffect } from "react";
import { fetchNewsPosts, type NewsPostRecord } from "../lib/supabaseApi";
import { resolveNewsCover } from "../lib/supabaseHelpers";

export function NewsList() {
  const { language, t } = useLanguage();
  const [newsList, setNewsList] = useState<NewsPostRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setError(null);
    setIsLoading(true);

    const loadNews = async () => {
      try {
        const data = await fetchNewsPosts({ publishedOnly: true });
        if (!active) return;
        setNewsList(data);
        setError(null);
      } catch {
        if (active) setError(t("common.error"));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    loadNews();
    return () => {
      active = false;
    };
  }, [t]);

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

      {error ? (
        <p className="text-red-600 px-2">{error}</p>
      ) : isLoading ? (
        <NewsSkeleton count={6} />
      ) : newsList.length === 0 ? (
        <p className="text-gray-600 px-2">{t("news.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {newsList.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -8 }}
            >
              <Link
                to={`/news/${news.id}`}
                className="block bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <ImageWithFallback
                    src={resolveNewsCover(
                      news.cover_source,
                      "thumb",
                      news.cover_keyword,
                      news.cover_url
                    )}
                    alt={language === "zh" ? news.title_zh : news.title_en}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {news.published_at
                        ? new Date(news.published_at).toLocaleDateString(
                            language === "zh" ? "zh-CN" : "en-US"
                          )
                        : ""}
                    </span>
                  </div>
                  <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-lg sm:text-xl">
                    {language === "zh" ? news.title_zh : news.title_en}
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                    {(language === "zh" ? news.summary_zh : news.summary_en) ??
                      ""}
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
      )}
    </div>
  );
}
