import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, DollarSign, Tag } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EventSkeleton } from '../components/EventSkeleton';
import { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardImage } from '../components/GlassCard';
import { ParallaxSection } from '../components/ParallaxSection';
import { TiltCard } from '../components/TiltCard';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export function EventList() {
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter events based on date
  const now = new Date();
  
  // Upcoming events: Future dates, sorted ascending (closest first)
  const upcomingEvents = mockEvents
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Past events: Past dates, sorted descending (most recent past first)
  const pastEvents = mockEvents
    .filter(event => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms loading time
    return () => clearTimeout(timer);
  }, []);

  const renderEventGrid = (events: typeof mockEvents, isPast: boolean) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {events.map((event, index) => (
        <ParallaxSection
          key={event.id}
          speed={0.7 + index * 0.1}
          slideDirection={index % 2 === 0 ? 'left' : 'right'}
        >
          <TiltCard tiltStrength={isPast ? 0.2 : 0.5} enabled={true} className="h-full">
            <GlassCard
              gradient={isPast ? 'none' : (index % 4 === 0 ? 'blue' : index % 4 === 1 ? 'green' : index % 4 === 2 ? 'orange' : 'warm')}
              blur={isPast ? 'sm' : 'lg'}
              hover={true}
              className={`h-full ${isPast ? 'opacity-90 bg-gray-50/50' : ''}`}
            >
              <div className="md:flex h-full">
                <div className="md:w-2/5 relative">
                  <GlassCardImage
                    src={`https://source.unsplash.com/600x600/?${event.image}`}
                    alt={event.title[language]}
                    className={`aspect-square h-full ${isPast ? 'grayscale-[0.3]' : ''}`}
                  />
                  {isPast && (
                     <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 bg-gray-800/70 text-white text-xs rounded-full backdrop-blur-sm">
                          {language === 'zh' ? '已结束' : 'Ended'}
                        </span>
                     </div>
                  )}
                </div>
                <div className="md:w-3/5 p-4 sm:p-6 flex flex-col relative">
                  {/* Tags */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    {!isPast && (
                      <span className="inline-block px-2.5 sm:px-3 py-1 bg-[#6BA868] text-white text-xs sm:text-sm rounded-full">
                        {t('events.upcoming')}
                      </span>
                    )}
                    <span className={`inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
                      event.accessType === 'members-only' 
                        ? 'bg-[#EB8C3A] text-white' 
                        : (isPast ? 'bg-gray-400 text-white' : 'bg-[#7BA3C7] text-white')
                    }`}>
                      {event.accessType === 'members-only' ? t('events.memberOnly') : t('events.allWelcome')}
                    </span>
                  </div>
                  
                  <h3 className={`mb-2 sm:mb-3 text-lg sm:text-xl ${isPast ? 'text-gray-700' : 'text-[#2B5F9E]'}`}>
                    {event.title[language]}
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2 text-sm sm:text-base">
                    {event.description[language]}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isPast ? 'text-gray-500' : 'text-[#EB8C3A]'}`} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isPast ? 'text-gray-500' : 'text-[#EB8C3A]'}`} />
                      <span>{event.location[language]}</span>
                    </div>
                    {!isPast && (
                      <>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                          <span>
                            {event.fee === 0 ? (
                              t('common.free')
                            ) : event.memberFee < event.fee ? (
                              <>
                                <span className="line-through text-gray-400">
                                  ${event.fee}
                                </span>
                                <span className="ml-2 text-[#6BA868]">
                                  ${event.memberFee} {t('events.memberFee')}
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
                            {event.registered}/{event.capacity}{' '}
                            {language === 'zh' ? '已报名' : 'registered'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {isPast ? (
                     <button
                       className="mt-auto w-full px-6 py-3 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-medium"
                       disabled
                     >
                       {language === 'zh' ? '活动回顾' : 'View Recap'}
                     </button>
                  ) : (
                    <Link to={`/events/${event.id}`} className="mt-auto">
                      <motion.button
                        className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('events.register')}
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </GlassCard>
          </TiltCard>
        </ParallaxSection>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2">{t('events.title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base px-2">{t('common.note')}</p>
      </motion.div>

      {/* Tabs structure is always visible */}
      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="tabs-gray">
            <TabsTrigger 
              value="upcoming" 
              className="tabs-gray-trigger"
              disabled={isLoading}
            >
              {language === 'zh' ? '即将开始' : 'Upcoming'} {!isLoading && `(${upcomingEvents.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="tabs-gray-trigger-past"
              disabled={isLoading}
            >
              {language === 'zh' ? '往期回顾' : 'Past Events'} {!isLoading && `(${pastEvents.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          // Skeleton state - show in the "upcoming" tab by default
          <TabsContent value="upcoming" className="mt-0">
            <EventSkeleton count={4} />
          </TabsContent>
        ) : (
          <>
            <TabsContent value="upcoming" className="mt-0 min-h-[400px]">
              {upcomingEvents.length > 0 ? (
                renderEventGrid(upcomingEvents, false)
              ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50/50 rounded-2xl">
                  <p className="text-lg">{language === 'zh' ? '近期暂无活动' : 'No upcoming events'}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0 min-h-[400px]">
              {pastEvents.length > 0 ? (
                renderEventGrid(pastEvents, true)
              ) : (
                <div className="text-center py-20 text-gray-500 bg-gray-50/50 rounded-2xl">
                  <p className="text-lg">{language === 'zh' ? '暂无往期活动' : 'No past events'}</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}