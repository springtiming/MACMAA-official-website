import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { EventSkeleton } from "../components/EventSkeleton";
import { mockEvents, type Event } from "../data/mockData";

export function EventList() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 获取当前时间
  const now = new Date();

  // 1. 筛选【即将开始】的活动
  // 逻辑：活动时间 >= 当前时间
  // 排序：按时间【从小到大】排，越近的活动越靠前
  const upcomingEvents = mockEvents
    .filter((event) => new Date(event.date) >= now)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  // 2. 筛选【往期回顾】的活动
  // 逻辑：活动时间 < 当前时间
  // 排序：按时间【从大到小】排，最近结束的活动在最上面
  const pastEvents = mockEvents
    .filter((event) => new Date(event.date) < now)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === "zh" ? "zh-CN" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // 封装渲染函数，避免代码重复
  const renderEventGrid = (events: Event[], isPast: boolean) => {
    if (events.length === 0) {
      return (
        <p className="text-gray-500 px-2 py-8 text-center">
          {language === "zh" ? "暂无活动" : "No events available"}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={isPast ? undefined : { scale: 1.02 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-2/5 relative">
                <div className="aspect-square bg-gray-200 overflow-hidden h-full">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/600x600/?${encodeURIComponent(
                      event.image
                    )}`}
                    alt={
                      language === "zh" ? event.title.zh : event.title.en
                    }
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isPast
                        ? "grayscale-[0.3]"
                        : "hover:scale-105"
                    }`}
                  />
                </div>
                {/* 往期活动添加"已结束"黑色蒙版标签 */}
                {isPast && (
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      {t("events.ended")}
                    </span>
                  </div>
                )}
              </div>
              <div className="md:w-3/5 p-4 sm:p-6 flex flex-col relative">
                {/* Tags */}
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  {!isPast && (
                    <span className="inline-block px-2.5 sm:px-3 py-1 bg-[#6BA868] text-white text-xs sm:text-sm rounded-full">
                      {t("events.upcoming")}
                    </span>
                  )}
                  <span
                    className={`inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
                      event.accessType === "members-only"
                        ? "bg-[#EB8C3A] text-white"
                        : "bg-[#7BA3C7] text-white"
                    }`}
                  >
                    {event.accessType === "members-only"
                      ? t("events.memberOnly")
                      : t("events.allWelcome")}
                  </span>
                </div>

                <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-lg sm:text-xl">
                  {language === "zh" ? event.title.zh : event.title.en}
                </h3>
                <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2 text-sm sm:text-base">
                  {language === "zh"
                    ? event.description.zh
                    : event.description.en}
                </p>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                    <span>
                      {language === "zh"
                        ? event.location.zh
                        : event.location.en}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                    <span>
                      {event.fee === 0 ? (
                        t("common.free")
                      ) : event.memberFee !== null &&
                        event.memberFee < event.fee ? (
                        <>
                          <span className="line-through text-gray-400">
                            ${event.fee}
                          </span>
                          <span className="ml-2 text-[#6BA868]">
                            ${event.memberFee} {t("events.memberFee")}
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

                {/* 按钮：未来活动可点击，往期活动禁用 */}
                {isPast ? (
                  <motion.button
                    disabled
                    className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60"
                  >
                    {t("events.viewRecap")}
                  </motion.button>
                ) : (
                  <Link to={`/events/${event.id}`} className="mt-auto">
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
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2">
          {t("events.title")}
        </h1>
      </motion.div>

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(value) =>
          setActiveTab(value as "upcoming" | "past")
        }
      >
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-xl grid-cols-2 bg-gray-50 border border-gray-200 shadow-sm p-1.5 h-auto rounded-2xl">
            <TabsTrigger
              value="upcoming"
              className="rounded-xl px-6 py-2.5 text-base font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-[#2B5F9E] data-[state=active]:shadow-md transition-all"
              disabled={isLoading}
            >
              {language === "zh" ? "即将开始" : "Upcoming"}
              {!isLoading && ` (${upcomingEvents.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-xl px-6 py-2.5 text-base font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-[#2B5F9E] data-[state=active]:shadow-md transition-all"
              disabled={isLoading}
            >
              {language === "zh" ? "往期回顾" : "Past Events"}
              {!isLoading && ` (${pastEvents.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Keep the tab structure visible at all times; swap only the content */}
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
                <div className="text-center py-20 px-6 text-gray-500 bg-[#f9fafb] rounded-3xl max-w-4xl mx-auto">
                  <p className="text-lg">
                    {language === "zh"
                      ? "近期暂无活动"
                      : "No upcoming events"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0 min-h-[400px]">
              {pastEvents.length > 0 ? (
                renderEventGrid(pastEvents, true)
              ) : (
                <div className="text-center py-20 px-6 text-gray-500 bg-[#f9fafb] rounded-3xl max-w-4xl mx-auto">
                  <p className="text-lg">
                    {language === "zh"
                      ? "暂无往期活动"
                      : "No past events"}
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
