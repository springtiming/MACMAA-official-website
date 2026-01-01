import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventSkeleton } from "@/components/EventSkeleton";
import { fetchEvents, type EventRecord } from "@/lib/supabaseApi";
import {
  formatEventDateTime,
  pickLocalized,
  resolveEventImage,
} from "@/lib/supabaseHelpers";

function EventImageContainer({
  imageSrc,
  imageAlt,
  isPast,
}: {
  imageSrc: string;
  imageAlt: string;
  isPast: boolean;
}) {
  const [zIndex, setZIndex] = useState(0);

  return (
    <div
      className="md:w-2/5 relative"
      style={{ zIndex }}
      onMouseEnter={() => setZIndex(100)}
      onMouseLeave={() => setZIndex(0)}
    >
      <div className="aspect-square bg-gray-200 overflow-hidden h-full relative">
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isPast ? "grayscale-[0.3]" : "hover:scale-105"
          }`}
        />
        {/* 右侧边缘渐变层 - 从透明到白色 */}
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none bg-gradient-to-r from-transparent via-white/50 to-white" />
      </div>
    </div>
  );
}

export function EventList() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchEvents()
      .then((data) => {
        if (!mounted) return;
        setEvents(data);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError(
          language === "zh"
            ? "加载活动失败，请稍后重试。"
            : "Failed to load events. Please try again later."
        );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [language]);

  const now = useMemo(() => new Date(), []);

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => new Date(event.event_date) >= now)
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        ),
    [events, now]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => new Date(event.event_date) < now)
        .sort(
          (a, b) =>
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        ),
    [events, now]
  );

  const renderEventGrid = (list: EventRecord[], isPast: boolean) => {
    if (list.length === 0) {
      return (
        <p className="text-gray-500 px-2 py-8 text-center">
          {language === "zh" ? "暂无活动" : "No events available"}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {list.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={isPast ? undefined : { scale: 1.02 }}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative"
          >
            <div className="md:flex">
              <EventImageContainer
                imageSrc={resolveEventImage(
                  event.image_type ?? null,
                  event.image_keyword,
                  event.image_url,
                  "thumb"
                )}
                imageAlt={pickLocalized(
                  event.title_zh,
                  event.title_en,
                  language
                )}
                isPast={isPast}
              />
              <div className="md:w-3/5 p-4 sm:p-6 flex flex-col relative overflow-hidden bg-white">
                {/* 左侧边缘渐变层 - 确保文字区域边缘也有渐变 */}
                <div className="absolute inset-y-0 left-0 w-20 pointer-events-none bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
                {/* 文字内容容器 */}
                <div className="relative flex flex-col h-full z-20">
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
                        isPast
                          ? "bg-gray-400 text-white"
                          : "bg-[#6BA868] text-white"
                      }`}
                    >
                      {isPast ? t("events.ended") : t("events.upcoming")}
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
                    {pickLocalized(event.title_zh, event.title_en, language)}
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2 text-sm sm:text-base">
                    {pickLocalized(
                      event.description_zh,
                      event.description_en,
                      language
                    )}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                      <span>
                        {formatEventDateTime(
                          event.event_date,
                          event.start_time,
                          event.end_time,
                          language
                        )}
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

                  {isPast ? (
                    <Link href={`/events/${event.id}`} className="mt-auto">
                      <motion.button
                        className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {t("events.viewRecap")}
                      </motion.button>
                    </Link>
                  ) : (
                    <Link href={`/events/${event.id}`} className="mt-auto">
                      <motion.button
                        className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t("events.register")}
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2" style={{ fontWeight: 700, fontFamily: '"SimSun", "宋体", serif' }}>
          {t("events.title")}
        </h1>
        {error && <p className="text-red-600 text-sm px-2">{error}</p>}
      </motion.div>

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "upcoming" | "past")}
      >
        <div className="flex justify-center mb-8">
          <TabsList className="tabs-gray">
            <TabsTrigger
              value="upcoming"
              className="tabs-gray-trigger"
              disabled={isLoading}
            >
              {language === "zh" ? "即将开始" : "Upcoming"}
              {!isLoading && ` (${upcomingEvents.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="tabs-gray-trigger-past"
              disabled={isLoading}
            >
              {language === "zh" ? "往期回顾" : "Past Events"}
              {!isLoading && ` (${pastEvents.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          <TabsContent value="upcoming" className="mt-0">
            <EventSkeleton count={4} />
          </TabsContent>
        ) : (
          <>
            <TabsContent value="upcoming" className="mt-0 min-h-[400px]">
              {upcomingEvents.length > 0 ? (
                renderEventGrid(upcomingEvents, false)
              ) : (
                <div className="text-center py-20 px-6 text-gray-500 bg-[#fbfcfd] rounded-3xl max-w-5xl mx-auto shadow-[0_8px_18px_-16px_rgba(0,0,0,0.25)]">
                  <p className="text-lg">
                    {language === "zh" ? "近期暂无活动" : "No upcoming events"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0 min-h-[400px]">
              {pastEvents.length > 0 ? (
                renderEventGrid(pastEvents, true)
              ) : (
                <div className="text-center py-20 px-6 text-gray-500 bg-[#fbfcfd] rounded-3xl max-w-5xl mx-auto shadow-[0_8px_18px_-16px_rgba(0,0,0,0.25)]">
                  <p className="text-lg">
                    {language === "zh" ? "暂无往期活动" : "No past events"}
                  </p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
