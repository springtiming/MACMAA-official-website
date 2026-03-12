import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "motion/react";
import {
  Heart,
  Users,
  Sparkles,
  HeartPulse,
  Flower2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useState, useEffect, useMemo } from "react";
import { ParallaxBackground } from "@/components/ParallaxBackground";

const AUTO_SWITCH_DELAY = 4000;

const heroImageUrl = "/assets/hero.jpg";
const groupPhotoUrl = "/assets/4e1018159bf5b416cdd05a50c6634f65d81400fe.png";
const consulPhotoUrl = "/assets/02ce48a06b4eb30c56fbf30084752dbc46f6e5e8.png";
const performancePhotoUrl =
  "/assets/8ba07f20524fc73fdf6468451fb157940959f60e.png";
const gatheringPhotoUrl =
  "/assets/c47e6fc792d8b9f97dd68ae29a97bfa32594f251.png";
const calligraphyPhotoUrl =
  "/assets/928ec88ac46c7ad8c5c157f2f73842edb6fb5c04.png";
const leadershipPhotoUrl =
  "/assets/e64db2d9d10306a4e7b8be715dce92e0c0c49c49.png";
const aboutWechatQrcodeUrl = "/assets/wechat-qrcode.png";
const homeImageLoadCache = new Set<string>();

function RisenWeChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M26.4 7.5c-10.7 0-19.4 7.3-19.4 16.3 0 4.7 2.4 8.9 6.5 11.9l-2 7.1 7.8-4.1c2.2.6 4.5.9 7.1.9 10.7 0 19.4-7.3 19.4-16.3S37.1 7.5 26.4 7.5Z"
        fill="currentColor"
      />
      <path
        d="M41.2 22.5c-9.2 0-16.8 6.3-16.8 14.1 0 7.8 7.6 14.1 16.8 14.1 2.2 0 4.3-.4 6.3-1.1l7.2 3.8-1.9-6c3.4-2.5 5.5-6.1 5.5-10.3 0-7.8-7.6-14.1-16.8-14.1Z"
        fill="currentColor"
      />
      <circle cx="20.5" cy="22.5" r="2.7" fill="#F5EFE6" />
      <circle cx="35.2" cy="22.5" r="2.7" fill="#F5EFE6" />
      <circle cx="36.8" cy="35.3" r="2.4" fill="#F5EFE6" />
      <circle cx="48.1" cy="35.3" r="2.4" fill="#F5EFE6" />
    </svg>
  );
}

export function Home() {
  const { t, language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAboutWechatQr, setShowAboutWechatQr] = useState(false);

  const activityImages = useMemo(
    () => [
      {
        url: groupPhotoUrl,
        caption: language === "zh" ? "社区大合影" : "Community Group Photo",
      },
      {
        url: consulPhotoUrl,
        caption:
          language === "zh"
            ? "中国驻墨尔本总领馆房新文总领事出席端午节活动"
            : "Consul General Fang Xinwen attended Dragon Boat Festival",
      },
      {
        url: leadershipPhotoUrl,
        caption:
          language === "zh"
            ? "陈雅会长、Gabriel Ng MP议员与维州多元文化社区的理事团和会员合照"
            : "President Chen Ya, MP Gabriel Ng with Victorian multicultural community board and members",
      },
      {
        url: performancePhotoUrl,
        caption:
          language === "zh" ? "会员太极演出" : "Member Tai Chi Performance",
      },
      {
        url: gatheringPhotoUrl,
        caption:
          language === "zh" ? "社区节日聚会" : "Community Festival Gathering",
      },
      {
        url: calligraphyPhotoUrl,
        caption:
          language === "zh" ? "书法文化活动" : "Calligraphy Cultural Activity",
      },
    ],
    [language]
  );

  const [loadedImages, setLoadedImages] = useState<boolean[]>(() =>
    activityImages.map((image) => homeImageLoadCache.has(image.url))
  );

  useEffect(() => {
    setLoadedImages(
      activityImages.map((image) => homeImageLoadCache.has(image.url))
    );
  }, [activityImages]);

  // Preload all images in the background
  useEffect(() => {
    activityImages.forEach((image, index) => {
      if (homeImageLoadCache.has(image.url)) {
        setLoadedImages((prev) => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
        return;
      }

      const img = new Image();
      img.src = image.url;

      // 检查图片是否已在浏览器缓存中（开屏预加载过）
      if (img.complete && img.naturalWidth > 0) {
        homeImageLoadCache.add(image.url);
        setLoadedImages((prev) => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
        return;
      }

      img.onload = () => {
        homeImageLoadCache.add(image.url);
        setLoadedImages((prev) => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
      };
      img.onerror = () => {
        homeImageLoadCache.add(image.url);
        setLoadedImages((prev) => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
      };
    });
  }, [activityImages]);

  // Manual navigation functions
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? activityImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % activityImages.length
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImageLoad = (index: number) => {
    const image = activityImages[index];
    if (image) {
      homeImageLoadCache.add(image.url);
    }
    setLoadedImages((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  useEffect(() => {
    if (!loadedImages[currentImageIndex]) {
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % activityImages.length
      );
    }, AUTO_SWITCH_DELAY);

    return () => clearTimeout(timeout);
  }, [currentImageIndex, loadedImages, activityImages.length]);

  const services = [
    {
      icon: Heart,
      title: t("home.services.mutual"),
      description: t("home.services.mutual.desc"),
      color: "#EB8C3A",
    },
    {
      icon: Users,
      title: t("home.services.community"),
      description: t("home.services.community.desc"),
      color: "#2B5F9E",
    },
    {
      icon: Sparkles,
      title: t("home.services.diverse"),
      description: t("home.services.diverse.desc"),
      color: "#6BA868",
    },
    {
      icon: HeartPulse,
      title: t("home.services.health"),
      description: t("home.services.health.desc"),
      color: "#EB8C3A",
    },
    {
      icon: Flower2,
      title: t("home.services.culture"),
      description: t("home.services.culture.desc"),
      color: "#2B5F9E",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <ParallaxBackground
        imageUrl={heroImageUrl}
        speed={0.3}
        overlay={true}
        overlayOpacity={0.85}
        className="relative overflow-hidden md:min-h-[70vh] lg:min-h-[80vh]"
      >
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: "rgba(245, 239, 230, 0.85)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-28">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[#2B5F9E] mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl px-2 font-bold font-heading"
              >
                {t("home.hero.title")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg md:text-xl px-4"
              >
                {t("home.hero.subtitle")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
              >
                <Link href="/news" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("home.hero.cta.news")}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="/membership" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-[#2B5F9E] rounded-lg border-2 border-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("home.hero.cta.join")}
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            className="hidden sm:block absolute top-10 left-10 w-20 h-20 rounded-full bg-[#6BA868]/20"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="hidden sm:block absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#EB8C3A]/20"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </section>
      </ParallaxBackground>

      {/* About Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-[#2B5F9E] mb-3 sm:mb-4 text-2xl sm:text-3xl px-2 font-bold font-heading">
            {t("home.about.title")}
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto px-4 text-sm sm:text-base">
            {t("home.about.desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Services Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3 gap-3 sm:gap-4 px-2">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group rounded-2xl bg-white/80 border border-[#2B5F9E]/10 p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <service.icon
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      style={{ color: service.color }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 leading-snug block">
                    {service.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* About Actions */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="xl:col-span-4"
          >
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2B5F9E] to-[#2A4365] p-5 sm:p-6 text-white shadow-xl">
              <h3 className="text-lg sm:text-xl font-semibold">
                {language === "zh" ? "快速了解我们" : "Quick Actions"}
              </h3>
              <p className="mt-2 text-blue-50/90 text-sm leading-relaxed">
                {language === "zh"
                  ? "从这里了解协会详情、加入会员，或直接扫码关注微信公众号。"
                  : "Explore the association, join membership, or follow us on WeChat from here."}
              </p>

              <div className="mt-5 space-y-3">
                <Link href="/about" className="block">
                  <motion.button
                    className="w-full px-5 py-3 rounded-xl bg-white text-[#2B5F9E] font-medium inline-flex items-center justify-center gap-2 hover:bg-[#F5EFE6] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {language === "zh" ? "了解更多" : "Learn More"}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <Link href="/membership" className="block">
                  <motion.button
                    className="w-full px-5 py-3 rounded-xl border border-white/60 text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("nav.membership")}
                  </motion.button>
                </Link>

                <motion.button
                  onClick={() => setShowAboutWechatQr((v) => !v)}
                  className="w-full px-5 py-3 rounded-xl border border-[#6BA868]/70 bg-[#6BA868]/15 text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-[#6BA868]/25 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-5 h-5 text-[#EAF8EA]">
                    <RisenWeChatIcon className="w-full h-full" />
                  </span>
                  <span>
                    {language === "zh" ? "微信公众号" : "WeChat Official Account"}
                  </span>
                </motion.button>
              </div>

              {showAboutWechatQr && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-white p-4 text-[#2B5F9E]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      {language === "zh"
                        ? "扫码关注公众号"
                        : "Scan to follow our WeChat"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAboutWechatQr(false)}
                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      aria-label={language === "zh" ? "关闭二维码" : "Close QR code"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={aboutWechatQrcodeUrl}
                    alt="WeChat QR Code"
                    className="w-full max-w-[180px] mx-auto rounded-lg shadow-md"
                  />
                </motion.div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Weekly Activities */}
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Weekly Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F5EFE6] rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg mb-10 sm:mb-16"
          >
            <h2 className="text-[#2B5F9E] mb-4 sm:mb-6 text-center text-2xl sm:text-3xl px-2 font-bold font-heading">
              {t("home.weekly.title")}
            </h2>
            <p className="mb-2 text-gray-700 text-center text-sm sm:text-base px-2">
              {t("home.weekly.time")}
            </p>
            <p className="mb-4 sm:mb-6 text-gray-600 text-center text-xs sm:text-sm px-2">
              {t("home.weekly.location")}
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {(language === "zh"
                ? [
                    "太极",
                    "八段锦",
                    "舞蹈",
                    "广场舞",
                    "麻将",
                    "打牌",
                    "唱歌",
                    "英文",
                    "书法",
                    "乒乓球",
                  ]
                : [
                    "Tai Chi",
                    "Ba Duan Jin",
                    "Dance",
                    "Square Dance",
                    "Mahjong",
                    "Cards",
                    "Singing",
                    "English",
                    "Calligraphy",
                    "Table Tennis",
                  ]
              ).map((activity, index) => (
                <span
                  key={index}
                  className="px-2.5 sm:px-3 py-1 bg-white text-gray-700 rounded-full"
                >
                  {activity}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Activity Images Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="relative aspect-video bg-gray-100">
              {/* Image with fade transition */}
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: loadedImages[currentImageIndex] ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  src={activityImages[currentImageIndex].url}
                  alt={activityImages[currentImageIndex].caption}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(currentImageIndex)}
                />
              </motion.div>

              {/* Caption with fade transition */}
              <motion.div
                key={`caption-${currentImageIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6"
              >
                <p className="text-white text-center text-sm sm:text-base">
                  {activityImages[currentImageIndex].caption}
                </p>
              </motion.div>

              {/* Left Arrow Button */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all hover:scale-110 z-10"
                aria-label={language === "zh" ? "上一张图片" : "Previous image"}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Right Arrow Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all hover:scale-110 z-10"
                aria-label={language === "zh" ? "下一张图片" : "Next image"}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Image Indicators */}
            <div className="flex justify-center gap-2 py-3 sm:py-4">
              {activityImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-[#2B5F9E] w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
