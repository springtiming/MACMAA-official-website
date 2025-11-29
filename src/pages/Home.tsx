import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
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
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect, useMemo } from "react";
import { ParallaxBackground } from "../components/ParallaxBackground";
import heroImage from "../assets/hero.jpg";
import groupPhoto from "figma:asset/4e1018159bf5b416cdd05a50c6634f65d81400fe.png";
import consulPhoto from "figma:asset/02ce48a06b4eb30c56fbf30084752dbc46f6e5e8.png";
import performancePhoto from "figma:asset/8ba07f20524fc73fdf6468451fb157940959f60e.png";
import gatheringPhoto from "figma:asset/c47e6fc792d8b9f97dd68ae29a97bfa32594f251.png";
import calligraphyPhoto from "figma:asset/928ec88ac46c7ad8c5c157f2f73842edb6fb5c04.png";
import leadershipPhoto from "figma:asset/e64db2d9d10306a4e7b8be715dce92e0c0c49c49.png";

export function Home() {
  const { t, language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const activityImages = useMemo(
    () => [
      {
        url: groupPhoto,
        caption: language === "zh" ? "社区大合影" : "Community Group Photo",
      },
      {
        url: consulPhoto,
        caption:
          language === "zh"
            ? "中国驻墨尔本总领馆房新文总领事出席端午节活动"
            : "Consul General Fang Xinwen attended Dragon Boat Festival",
      },
      {
        url: leadershipPhoto,
        caption:
          language === "zh"
            ? "陈雅会长、Gabriel Ng MP议员与维州多元文化社区的理事团和会员合照"
            : "President Chen Ya, MP Gabriel Ng with Victorian multicultural community board and members",
      },
      {
        url: performancePhoto,
        caption:
          language === "zh" ? "会员太极演出" : "Member Tai Chi Performance",
      },
      {
        url: gatheringPhoto,
        caption:
          language === "zh" ? "社区节日聚会" : "Community Festival Gathering",
      },
      {
        url: calligraphyPhoto,
        caption:
          language === "zh" ? "书法文化活动" : "Calligraphy Cultural Activity",
      },
    ],
    [language]
  );

  // Preload all images
  useEffect(() => {
    const imagePromises = activityImages.map((img) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = img.url;
        image.onload = resolve;
        image.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true)); // Still set to true even if some images fail
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % activityImages.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [activityImages.length, currentImageIndex]);

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
        imageUrl={heroImage}
        speed={0.3}
        overlay={true}
        overlayOpacity={0.85}
        className="relative overflow-hidden"
      >
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-28">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[#2B5F9E] mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl px-2"
                style={{ fontWeight: 700 }}
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
                <Link to="/news" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("home.hero.cta.news")}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/membership" className="w-full sm:w-auto">
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
          <h2 className="text-[#2B5F9E] mb-3 sm:mb-4 text-2xl sm:text-3xl px-2">
            {t("home.about.title")}
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto px-4 text-sm sm:text-base">
            {t("home.about.desc")}
          </p>
        </motion.div>

        {/* Services Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 px-2"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center gap-2 group w-20 sm:w-24"
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${service.color}20` }}
              >
                <service.icon
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  style={{ color: service.color }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-700 text-center max-w-[100px]">
                {service.title}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center px-4"
        >
          <Link to="/about">
            <motion.button
              className="px-6 sm:px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {language === "zh" ? "了解更多" : "Learn More"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
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
            <h2 className="text-[#2B5F9E] mb-4 sm:mb-6 text-center text-2xl sm:text-3xl px-2">
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

          {/* Activity Images Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8"
          >
            <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-xl sm:text-2xl px-2">
              {t("home.activities.title")}
            </h3>
            <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base px-4">
              {t("home.activities.desc")}
            </p>
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
                animate={{ opacity: imagesLoaded ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  src={activityImages[currentImageIndex].url}
                  alt={activityImages[currentImageIndex].caption}
                  className="w-full h-full object-cover"
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
