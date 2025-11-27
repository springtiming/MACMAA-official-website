import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react";
import { fetchEventById, type EventRecord } from "../lib/supabaseApi";
import {
  formatEventDateTime,
  pickLocalized,
  resolveEventImage,
} from "../lib/supabaseHelpers";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchEventById(id)
      .then((data) => {
        if (active) setEvent(data);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{error || "Event not found"}</p>
        <Link
          to="/events"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("events.back")}
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
          to="/events"
          className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("events.back")}
        </Link>

        {/* Event Image */}
        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-6">
          <ImageWithFallback
            src={resolveEventImage(
              event.image_type,
              event.image_keyword,
              event.image_url,
              "hero",
            )}
            alt={pickLocalized(event.title_zh, event.title_en, language)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-[#2B5F9E]">
              {pickLocalized(event.title_zh, event.title_en, language)}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  event.access_type === "members-only"
                    ? "bg-[#EB8C3A] text-white"
                    : "bg-[#7BA3C7] text-white"
                }`}
              >
                {event.access_type === "members-only"
                  ? t("events.memberOnly")
                  : t("events.allWelcome")}
              </span>
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
              <p className="text-gray-900">
                {formatEventDateTime(
                  event.event_date,
                  event.start_time,
                  event.end_time,
                  language,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#2B5F9E]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("events.location")}</p>
              <p className="text-gray-900">{event.location}</p>
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
                ) : event.member_fee !== null &&
                    event.member_fee < event.fee ? (
                  <div className="flex flex-col">
                    <span className="line-through text-gray-400 text-sm">
                      ${event.fee} AUD
                    </span>
                    <span className="text-[#6BA868]">
                      ${event.member_fee} AUD ({t("events.memberFee")})
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
                {event.capacity
                  ? `${event.capacity} ${language === "zh" ? "名额" : "capacity"}`
                  : language === "zh"
                    ? "名额不限"
                    : "Unlimited capacity"}
              </p>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="mb-8">
          <h2 className="text-[#2B5F9E] mb-4">{t("events.details")}</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {pickLocalized(event.description_zh, event.description_en, language)}
          </p>
        </div>

        {/* Registration CTA */}
        <div className="bg-white border-2 border-[#2B5F9E] rounded-2xl p-8 text-center">
          <h3 className="text-[#2B5F9E] mb-4">
            {language === "zh" ? "准备好加入我们了吗？" : "Ready to Join Us?"}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === "zh"
              ? event.capacity
                ? `活动名额：${event.capacity}，先到先得`
                : "活动名额不限，欢迎报名"
              : event.capacity
                ? `Capacity: ${event.capacity}, first come first served`
                : "Unlimited capacity, all welcome"}
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
          <p>
            {language === "zh"
              ? "活动数据已从 Supabase 读取，报名将在下一步提交到数据库。"
              : "Event data is fetched from Supabase; registration will be submitted to the database in the next step."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
