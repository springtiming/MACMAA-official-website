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
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import groupPhoto from "figma:asset/4e1018159bf5b416cdd05a50c6634f65d81400fe.png";

export function Home() {
  const { t, language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const activityImages = [
    {
      url: groupPhoto,
      caption: language === "zh" ? "社区大合影" : "Community Group Photo",
    },
    {
      url: "https://images.unsplash.com/photo-1761124739538-587cd3e3f72a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY0MDkzOTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "文化节庆活动" : "Cultural Festival",
    },
    {
      url: "https://images.unsplash.com/photo-1732023998275-95390af360ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3JzJTIwZGFuY2luZyUyMGdyb3VwJTIwYWN0aXZpdHl8ZW58MXx8fHwxNzY0MDkzOTY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "舞蹈活动" : "Dance Activities",
    },
    {
      url: "https://images.unsplash.com/photo-1758798469179-dea5d63257ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWklMjBjaGklMjBleGVyY2lzZSUyMGdyb3VwfGVufDF8fHx8MTc2NDA5Mzk2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "太极练习" : "Tai Chi Practice",
    },
    {
      url: "https://images.unsplash.com/photo-1763731374100-24ee3f91a896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBldmVudHxlbnwxfHx8fDE3NjQwOTM5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "社区聚会" : "Community Gathering",
    },
    {
      url: "https://images.unsplash.com/photo-1583389409210-0234eee7cdce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwY2FsbGlncmFwaHklMjBjbGFzc3xlbnwxfHx8fDE3NjQwOTM5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "书法课程" : "Calligraphy Class",
    },
    {
      url: "https://images.unsplash.com/photo-1761057292517-74dfb48ede46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWx0aWN1bHR1cmFsJTIwY29tbXVuaXR5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY0MDkzOTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: language === "zh" ? "多元文化庆典" : "Multicultural Celebration",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % activityImages.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [activityImages.length]);

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
      <section className="relative bg-gradient-to-br from-[#F5EFE6] to-[#E8DCC8] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[#2B5F9E] mb-6 text-4xl md:text-5xl lg:text-6xl"
              style={{ fontWeight: 700 }}
            >
              {t("home.hero.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg md:text-xl"
            >
              {t("home.hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/news">
                <motion.button
                  className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("home.hero.cta.news")}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/membership">
                <motion.button
                  className="px-8 py-3 bg-white text-[#2B5F9E] rounded-lg border-2 border-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white transition-colors"
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
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-[#6BA868]/20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#EB8C3A]/20"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-[#2B5F9E] mb-4 text-3xl">
            {t("home.about.title")}
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            {t("home.about.desc")}
          </p>
        </motion.div>

        {/* Services Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${service.color}20` }}
              >
                <service.icon
                  className="w-8 h-8"
                  style={{ color: service.color }}
                />
              </div>
              <span className="text-sm text-gray-700 text-center max-w-[100px]">
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
          className="text-center"
        >
          <Link to="/about">
            <motion.button
              className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors inline-flex items-center gap-2"
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
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Weekly Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F5EFE6] rounded-2xl p-8 md:p-12 shadow-lg mb-16"
          >
            <h2 className="text-[#2B5F9E] mb-6 text-center text-3xl">
              {t("home.weekly.title")}
            </h2>
            <p className="mb-2 text-gray-700 text-center">
              {t("home.weekly.time")}
            </p>
            <p className="mb-6 text-gray-600 text-center">
              {t("home.weekly.location")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
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
                  className="px-3 py-1 bg-white text-gray-700 rounded-full"
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
            className="text-center mb-8"
          >
            <h3 className="text-[#2B5F9E] mb-3 text-2xl">
              {t("home.activities.title")}
            </h3>
            <p className="text-gray-700 mb-8">{t("home.activities.desc")}</p>
          </motion.div>

          {/* Activity Images Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="relative aspect-video">
              <ImageWithFallback
                src={activityImages[currentImageIndex].url}
                alt={activityImages[currentImageIndex].caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-center">
                  {activityImages[currentImageIndex].caption}
                </p>
              </div>
            </div>

            {/* Image Indicators */}
            <div className="flex justify-center gap-2 py-4">
              {activityImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
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
