import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react";
import { mockEvents } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const event = mockEvents.find((e) => e.id === Number(id));

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Event not found</p>
        <Link
          to="/events"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("events.back")}
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const spotsLeft = event.capacity - event.registered;
  const isAlmostFull = spotsLeft <= 10;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("events.back")}
        </Link>

        {/* Event Image */}
        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-6">
          <ImageWithFallback
            src={`https://source.unsplash.com/1200x675/?${event.image}`}
            alt={event.title[language]}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-[#2B5F9E]">{event.title[language]}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  event.accessType === "members-only"
                    ? "bg-[#EB8C3A] text-white"
                    : "bg-[#7BA3C7] text-white"
                }`}
              >
                {event.accessType === "members-only"
                  ? t("events.memberOnly")
                  : t("events.allWelcome")}
              </span>
              {isAlmostFull && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-[#EB8C3A] text-white text-sm rounded-full whitespace-nowrap"
                >
                  {language === "zh" ? "名额紧张" : "Limited Spots"}
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Event Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#2B5F9E]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("events.date")}</p>
              <p className="text-gray-900">{formatDate(event.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#2B5F9E]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("events.location")}</p>
              <p className="text-gray-900">{event.location[language]}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#2B5F9E]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">{t("events.fee")}</p>
              <div className="text-gray-900">
                {event.fee === 0 ? (
                  t("common.free")
                ) : event.memberFee < event.fee ? (
                  <div className="flex flex-col">
                    <span className="line-through text-gray-400 text-sm">
                      ${event.fee} AUD
                    </span>
                    <span className="text-[#6BA868]">
                      ${event.memberFee} AUD ({t("events.memberFee")})
                    </span>
                  </div>
                ) : (
                  `$${event.fee} AUD`
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#2B5F9E]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("events.capacity")}</p>
              <p className="text-gray-900">
                {event.registered}/{event.capacity}{" "}
                {language === "zh" ? "已报名" : "registered"}
              </p>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="mb-8">
          <h2 className="text-[#2B5F9E] mb-4">{t("events.details")}</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {event.description[language]}
          </p>
        </div>

        {/* Registration CTA */}
        <div className="bg-white border-2 border-[#2B5F9E] rounded-2xl p-8 text-center">
          <h3 className="text-[#2B5F9E] mb-4">
            {language === "zh" ? "准备好加入我们了吗？" : "Ready to Join Us?"}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === "zh"
              ? `还有 ${spotsLeft} 个名额，请尽快报名！`
              : `${spotsLeft} spots remaining, register soon!`}
          </p>
          <motion.button
            onClick={() => navigate(`/events/${event.id}/register`)}
            className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("events.register")}
          </motion.button>
        </div>

        {/* API Integration Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
          <p>{t("common.note")}</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>
              {language === "zh"
                ? "活动数据将通过REST API从后台CMS获取"
                : "Event data will be fetched via REST API from backend CMS"}
            </li>
            <li>
              {language === "zh"
                ? "报名信息将提交至数据库并触发确认邮件"
                : "Registration info will be submitted to database and trigger confirmation emails"}
            </li>
            <li>
              {language === "zh"
                ? "支付集成将使用Stripe或PayPal网关"
                : "Payment integration will use Stripe or PayPal gateway"}
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
