import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EventSkeleton } from "../components/EventSkeleton";
import { useState, useEffect } from "react";
import { fetchEvents, type EventRecord } from "../lib/supabaseApi";

export function EventList() {
  const { language, t } = useLanguage();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 每次加载时展示骨架屏，由最小时长逻辑控制隐藏时机
  const [showSkeleton, setShowSkeleton] = useState(true);

  const formatDate = (dateString: string, start?: string | null) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString(
      language === "zh" ? "zh-CN" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const timePart = start
      ? new Date(`${dateString}T${start}`).toLocaleTimeString(
          language === "zh" ? "zh-CN" : "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : null;
    return timePart ? `${datePart} ${timePart}` : datePart;
  };

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;
    const startTime = performance.now();

    setError(null);
    setIsLoading(true);
    setShowSkeleton(true);

    const loadEvents = async () => {
      try {
        const data = await fetchEvents({
          fromDate: new Date().toISOString().slice(0, 10),
        });
        if (!active) return;
        setEvents(data);
        setError(null);
      } catch {
        if (active) setError(t("common.error"));
      } finally {
        if (active) {
          const finish = () => {
            if (!active) return;
            setIsLoading(false);
            setShowSkeleton(false);
          };

          const elapsed = performance.now() - startTime;
          const remaining = 150 - elapsed;

          if (remaining > 0) {
            timeoutId = window.setTimeout(finish, remaining);
          } else {
            finish();
          }
        }
      }
    };
    loadEvents();
    return () => {
      active = false;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
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
          {t("events.title")}
        </h1>
      </motion.div>

      {error ? (
        <p className="text-red-600 px-2">{error}</p>
      ) : isLoading && showSkeleton ? (
        <EventSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-2/5">
                  <div className="aspect-square bg-gray-200 overflow-hidden h-full">
                    <ImageWithFallback
                      src={
                        event.image_url ||
                        (event.image_keyword
                          ? `https://source.unsplash.com/600x600/?${event.image_keyword}`
                          : `https://source.unsplash.com/600x600/?${encodeURIComponent(event.title_en)}`)
                      }
                      alt={language === "zh" ? event.title_zh : event.title_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="md:w-3/5 p-4 sm:p-6 flex flex-col relative">
                  {/* Tags */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2.5 sm:px-3 py-1 bg-[#6BA868] text-white text-xs sm:text-sm rounded-full">
                      {t("events.upcoming")}
                    </span>
                    <span
                      className={`inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
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

                  <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-lg sm:text-xl">
                    {language === "zh" ? event.title_zh : event.title_en}
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2 text-sm sm:text-base">
                    {(language === "zh"
                      ? event.description_zh
                      : event.description_en) ?? ""}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                      <span>
                        {formatDate(event.event_date, event.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                      <span>
                        {event.fee === 0 ? (
                          t("common.free")
                        ) : event.member_fee !== null &&
                          event.member_fee < event.fee ? (
                          <>
                            <span className="line-through text-gray-400">
                              ${event.fee}
                            </span>
                            <span className="ml-2 text-[#6BA868]">
                              ${event.member_fee} {t("events.memberFee")}
                            </span>
                          </>
                        ) : (
                          `$${event.fee} AUD`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                      <span>
                        {event.capacity && event.capacity > 0
                          ? `${event.capacity} ${
                              language === "zh" ? "名额" : "capacity"
                            }`
                          : language === "zh"
                            ? "名额不限"
                            : "Unlimited capacity"}
                      </span>
                    </div>
                  </div>

                  <Link to={`/events/${event.id}`} className="mt-auto">
                    <motion.button
                      className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t("events.register")}
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
