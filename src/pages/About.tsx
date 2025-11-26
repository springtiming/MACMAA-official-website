import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Target, Sparkles, Check } from "lucide-react";
import businessCard from "figma:asset/2aee091727a5d832328a3b5cf9e2dcdf4f43542d.png";

export function About() {
  const { language, t } = useLanguage();

  const services = [
    language === "zh"
      ? "每年举办超过30场大型、中型、小型社区活动"
      : "Over 30 community events annually",
    language === "zh"
      ? "提供居家养老、健康、政府补助等公益讲座"
      : "Public seminars on aged care, health, and government support",
    language === "zh"
      ? "组织文化节庆（春节、中秋、端午等）"
      : "Cultural festivals (Chinese New Year, Mid-Autumn, Dragon Boat)",
    language === "zh"
      ? "举办舞蹈、太极、乒乓球、书法乐等课程"
      : "Dance, Tai Chi, table tennis, calligraphy, and music classes",
    language === "zh"
      ? "带领社区参加政府与多元文化活动"
      : "Leading community participation in government and multicultural events",
    language === "zh"
      ? "建立艺术团、文娱小组、长者支持计划"
      : "Arts groups, entertainment teams, and senior support programs",
    language === "zh"
      ? "为新移民提供信息协助与社区连接"
      : "Information assistance and community connections for new migrants",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-[#2B5F9E] mb-6 text-5xl md:text-6xl">
          {t("nav.about")}
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          {t("home.about.desc")}
        </p>
      </motion.div>

      {/* Main Content - Single Unified Card */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#F5EFE6] rounded-3xl p-8 md:p-12"
        >
          {/* Mission & Vision */}
          <div className="mb-16 pb-16 border-b border-gray-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mission */}
              <div>
                <div className="w-16 h-16 bg-[#2B5F9E]/10 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-[#2B5F9E]" />
                </div>
                <h2 className="mb-6 text-[#2B5F9E] text-3xl">
                  {language === "zh" ? "我们的使命" : "Our Mission"}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {language === "zh"
                    ? "澳洲万年市华人互助会的使命，是为万年市及周边地区的华人社区提供支持与关怀，促进文化交流、长者福祉、多元文化融合，并通过各种活动增强社区成员之间的联系。"
                    : "MACMAA is committed to providing support and care for the Chinese community in Manningham and surrounding areas, promoting cultural exchange, senior wellbeing, multicultural integration, and strengthening connections among community members."}
                </p>
              </div>

              {/* Vision */}
              <div>
                <div className="w-16 h-16 bg-[#6BA868]/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-[#6BA868]" />
                </div>
                <h2 className="mb-6 text-[#2B5F9E] text-3xl">
                  {language === "zh" ? "我们的愿景" : "Our Vision"}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {language === "zh"
                    ? "我们致力于成为一个温暖、有力、富影响力的社区组织，让每一位成员都能找到归属感、支持、尊严与成长空间，成为连接文化与社区的桥梁。"
                    : "We strive to become a warm, strong, and influential community organization where every member can find belonging, support, dignity, and growth opportunities, serving as a bridge connecting culture and community."}
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-16 pb-16 border-b border-gray-300">
            <h2 className="text-[#2B5F9E] mb-8 text-center text-3xl">
              {language === "zh" ? "我们的故事" : "Our Story"}
            </h2>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                {language === "zh"
                  ? '澳洲万市华人互助会（MACMAA）成立于2023年，由陈雅女士发起，最初只是一个简单的想法——"让在异乡的华人有一个互相支持、温暖的家"。'
                  : 'Manningham Australian Chinese Mutual Aid Association (MACMAA) was founded in 2023 by Ms. Chen Ya, starting with a simple idea - "to create a warm and supportive home for Chinese people living abroad."'}
              </p>

              <p>
                {language === "zh"
                  ? "短短两年多时间，MACMAA在团队与社区的支持下迅速成长，从最初几十人发展到如今数百人规模。"
                  : "In just over two years, MACMAA has grown rapidly with the support of the team and community, expanding from dozens of initial members to hundreds today."}
              </p>

              <p>
                {language === "zh"
                  ? "我们以关怀长者、推广文化、促进多元文化交流为核心，通过讲座、文化节庆、艺术课程、文体活动、公益服务等方式，为整个社区带来温暖、力量与连接。"
                  : "With a focus on caring for seniors, promoting culture, and fostering multicultural exchange, we bring warmth, strength, and connection to the entire community through seminars, cultural festivals, art classes, sports activities, and community services."}
              </p>

              <p>
                {language === "zh"
                  ? "MACMAA的快速成长，离不开核心团队的坚持与奉献，也离不开社区成员的信任与参与。"
                  : "MACMAA's rapid growth is inseparable from the dedication and commitment of our core team, as well as the trust and participation of community members."}
              </p>

              <p>
                {language === "zh"
                  ? "我们获得Manningham市府、多元文化部门、社区团体以及中国驻墨尔本总领馆的一致认可，并多次获邀参加官方活动，展示华人社区的风采。"
                  : "We have received recognition from Manningham Council, multicultural departments, community groups, and the Chinese Consulate in Melbourne, and have been invited to participate in official events to showcase the vitality of the Chinese community."}
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-12">
            <h2 className="text-[#2B5F9E] mb-8 text-center text-3xl">
              {language === "zh" ? "我们做什么" : "What We Do"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-3 max-w-5xl mx-auto pl-12">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 text-gray-700"
                >
                  <Check className="w-5 h-5 text-[#6BA868] flex-shrink-0" />
                  <p>{service}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Info - Founder Profile */}
          <div className="pt-10 border-t border-gray-300">
            <h2 className="text-[#2B5F9E] mb-10 text-center text-3xl">
              {language === "zh" ? "创始人/会长" : "Founder & President"}
            </h2>

            <div className="max-w-2xl mx-auto">
              <img
                src={businessCard}
                alt="Ya Chen Business Card"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] rounded-3xl p-12 text-center text-white"
      >
        <h2 className="mb-4">
          {language === "zh" ? "加入我们的大家庭" : "Join Our Community"}
        </h2>
        <p className="mb-8 text-blue-50 max-w-2xl mx-auto">
          {language === "zh"
            ? "无论新移民、长者、家庭或年轻朋友，都欢迎加入我们的大家庭。"
            : "Whether you are a new migrant, senior, family, or young friend, you are welcome to join our community."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => (window.location.href = "/membership")}
            className="px-8 py-3 bg-white text-[#2B5F9E] rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("nav.membership")}
          </motion.button>
          <motion.button
            onClick={() => (window.location.href = "/events")}
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#2B5F9E] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("nav.events")}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
