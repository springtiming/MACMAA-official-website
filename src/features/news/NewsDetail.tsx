import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { fetchNewsPostById, type NewsPostRecord } from "@/lib/supabaseApi";
import { pickLocalized, resolveNewsCover } from "@/lib/supabaseHelpers";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

export function NewsDetail() {
  const router = useRouter();
  const idParam = router.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsPostRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchNewsPostById(id)
      .then((data) => {
        if (active) setNews(data);
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
  }, [id, t]);

  const handleShare = async () => {
    if (!news || !id) return;

    const title = pickLocalized(news.title_zh, news.title_en, language);
    const url = window.location.href;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
        // Fall through to clipboard fallback
        if ((err as Error).name === "AbortError") {
          return; // User cancelled, don't show error
        }
      }
    }

    // Fallback to clipboard
    try {
      const textToCopy = `${title}\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      // Clipboard API failed, show error
      setError(language === "zh" ? "复制失败" : "Failed to copy");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{error || "News not found"}</p>
        <Link
          href="/news"
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
          href="/news"
          className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("news.back")}
        </Link>

        {/* Featured Image */}
        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-6">
          <ImageWithFallback
            src={resolveNewsCover(
              news.cover_source,
              "hero",
              news.cover_keyword,
              news.cover_url
            )}
            alt={pickLocalized(news.title_zh, news.title_en, language)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-[#2B5F9E] mb-4">
            {pickLocalized(news.title_zh, news.title_en, language)}
          </h1>
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {news.published_at
                  ? new Date(news.published_at).toLocaleDateString(
                      language === "zh" ? "zh-CN" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )
                  : language === "zh"
                    ? "未公布"
                    : "N/A"}
              </span>
            </div>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-[#2B5F9E] hover:underline"
            >
              <Share2 className="w-4 h-4" />
              {shareSuccess
                ? language === "zh"
                  ? "已复制"
                  : "Copied"
                : t("news.share")}
            </motion.button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none prose-img:rounded-xl prose-img:w-full prose-p:my-3">
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{
              __html:
                pickLocalized(news.content_zh, news.content_en, language) || "",
            }}
          />
        </div>

        {/* Related News or CTA */}
        <div className="mt-12 py-10 px-6 bg-[#F5EFE6] rounded-2xl text-center">
          <p className="text-gray-700 text-lg mb-6">
            {language === "zh"
              ? "查看我们即将举办的精彩活动"
              : "Check out our upcoming exciting events"}
          </p>
          <Link href="/events">
            <motion.button
              className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
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
