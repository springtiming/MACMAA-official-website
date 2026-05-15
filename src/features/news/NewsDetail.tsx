import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, ArrowLeft, Share2, Quote, Eye, Heart } from "lucide-react";
import {
  fetchNewsPostById,
  recordNewsArticleView,
  updateNewsArticleLike,
  type NewsPostRecord,
} from "@/lib/supabaseApi";
import { normalizeNewsMediaHtml } from "@/lib/newsMedia";
import {
  formatNewsEngagementCount,
  hasRecentNewsView,
  isNewsArticleLiked,
  rememberNewsArticleLike,
  rememberNewsView,
} from "@/lib/newsEngagement";
import { pickLocalized, resolveNewsCover } from "@/lib/supabaseHelpers";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

type NewsDetailProps = {
  initialNews?: NewsPostRecord | null;
};

export function NewsDetail({ initialNews }: NewsDetailProps) {
  const router = useRouter();
  const idParam = router.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsPostRecord | null>(
    () => initialNews ?? null
  );
  const [loading, setLoading] = useState(() => !initialNews);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [viewCount, setViewCount] = useState(
    () => initialNews?.view_count ?? 0
  );
  const [likeCount, setLikeCount] = useState(
    () => initialNews?.like_count ?? 0
  );
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (initialNews?.id === id) {
      setNews(initialNews);
      setError(null);
      setLoading(false);
      return;
    }
    let active = true;
    setError(null);
    setLoading(true);
    setNews(null);
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
  }, [id, initialNews, t]);

  useEffect(() => {
    if (!news?.id) return;
    setViewCount(news.view_count ?? 0);
    setLikeCount(news.like_count ?? 0);
    setLiked(isNewsArticleLiked(news.id));
  }, [news]);

  useEffect(() => {
    if (!news?.id || hasRecentNewsView(news.id)) return;

    let active = true;
    recordNewsArticleView(news.id)
      .then((counts) => {
        if (!active) return;
        setViewCount(counts.viewCount);
        setLikeCount(counts.likeCount);
        rememberNewsView(news.id);
      })
      .catch(() => {
        // Engagement should never block article reading.
      });

    return () => {
      active = false;
    };
  }, [news?.id]);

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

  const handleLike = async () => {
    if (!news?.id || likePending) return;

    const nextLiked = !liked;
    const previousLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    rememberNewsArticleLike(news.id, nextLiked);
    setLikePending(true);

    try {
      const counts = await updateNewsArticleLike(news.id, nextLiked);
      setViewCount(counts.viewCount);
      setLikeCount(counts.likeCount);
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      rememberNewsArticleLike(news.id, previousLiked);
      setError(
        language === "zh"
          ? "点赞更新失败，请稍后再试"
          : "Failed to update like. Please try again later."
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLikePending(false);
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

  const summary =
    pickLocalized(news.summary_zh, news.summary_en, language)?.trim() ?? "";
  const publishedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString(
        language === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }
      )
    : language === "zh"
      ? "未公布"
      : "N/A";
  const formattedViewCount = formatNewsEngagementCount(viewCount, language);
  const formattedLikeCount = formatNewsEngagementCount(likeCount, language);
  const shareLabel = shareSuccess
    ? language === "zh"
      ? "已复制"
      : "Copied"
    : language === "zh"
      ? "分享"
      : "Share";
  const likeActionLabel = liked
    ? language === "zh"
      ? "已赞"
      : "Liked"
    : language === "zh"
      ? "赞"
      : "Like";

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
          <h1 className="text-[#2B5F9E] mb-6 text-3xl font-bold leading-tight md:text-4xl">
            {pickLocalized(news.title_zh, news.title_en, language)}
          </h1>
          <div className="news-archive-metadata flex flex-col gap-3 pb-8 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5F6B7D] sm:flex-row sm:items-center sm:justify-between">
            <div className="news-archive-metadata-items">
              <span className="news-archive-metadata-item">
                <Calendar
                  className="h-3.5 w-3.5 text-[#2B5F9E]"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                {publishedDate}
              </span>
              <span className="news-archive-metadata-item">
                <Eye
                  className="h-3.5 w-3.5 text-[#2B5F9E]"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                {formattedViewCount} {language === "zh" ? "阅读" : "Reads"}
              </span>
              <span className="news-archive-metadata-item">
                <Heart
                  className="h-3.5 w-3.5 text-[#2B5F9E]"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                {formattedLikeCount} {language === "zh" ? "赞" : "Likes"}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={handleShare}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label={
                language === "zh" ? "分享这篇新闻" : "Share this news article"
              }
              className="inline-flex w-fit items-center gap-1.5 text-[#2B5F9E] transition-colors hover:text-[#234a7e]"
            >
              <Share2
                className="h-3.5 w-3.5"
                strokeWidth={1.4}
                aria-hidden="true"
              />
              {shareLabel}
            </motion.button>
          </div>
        </div>

        {summary ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 relative"
          >
            <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-[#2B5F9E] rounded-full hidden sm:block" />
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#2B5F9E]">
                <Quote className="w-5 h-5 fill-current opacity-20" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {language === "zh" ? "内容提要" : "Summary"}
                </span>
              </div>
              <p className="news-summary-text text-[#475569] text-lg sm:text-xl leading-relaxed italic font-medium">
                {summary}
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none prose-img:rounded-xl prose-p:my-3">
          <div
            className="news-content text-gray-700"
            dangerouslySetInnerHTML={{
              __html:
                normalizeNewsMediaHtml(
                  pickLocalized(news.content_zh, news.content_en, language)
                ) || "",
            }}
          />
        </div>

        <div className="news-archive-actions mt-12 flex flex-col gap-3 border-t border-[#2B5F9E]/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <motion.button
            type="button"
            onClick={handleLike}
            whileHover={{ scale: likePending ? 1 : 1.03 }}
            whileTap={{ scale: likePending ? 1 : 0.97 }}
            disabled={likePending}
            aria-pressed={liked}
            aria-label={
              liked
                ? language === "zh"
                  ? "取消点赞这篇新闻"
                  : "Unlike this news article"
                : language === "zh"
                  ? "给这篇新闻点赞"
                  : "Like this news article"
            }
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto ${
              liked
                ? "bg-[#6BA868]/15 text-[#4f8650] hover:bg-[#6BA868]/25"
                : "bg-[#2B5F9E]/5 text-[#2B5F9E] hover:bg-[#2B5F9E]/10"
            }`}
          >
            <Heart
              className={`h-[18px] w-[18px] ${liked ? "fill-current" : ""}`}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span>{likeActionLabel}</span>
            <span className="font-bold">{formattedLikeCount}</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={handleShare}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label={
              language === "zh" ? "分享这篇新闻" : "Share this news article"
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2B5F9E]/5 px-6 text-sm font-semibold text-[#2B5F9E] transition-colors hover:bg-[#2B5F9E]/10 sm:w-auto"
          >
            <Share2
              className="h-[18px] w-[18px]"
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span>{shareLabel}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
