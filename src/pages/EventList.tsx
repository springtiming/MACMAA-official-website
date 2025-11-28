import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, DollarSign, Tag } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function EventList() {
  const { language, t } = useLanguage();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {mockEvents.map((event, index) => (
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
                    src={`https://source.unsplash.com/600x600/?${event.image}`}
                    alt={event.title[language]}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="md:w-3/5 p-4 sm:p-6 flex flex-col relative">
                {/* Tags */}
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2.5 sm:px-3 py-1 bg-[#6BA868] text-white text-xs sm:text-sm rounded-full">
                    {t('events.upcoming')}
                  </span>
                  <span className={`inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
                    event.accessType === 'members-only' 
                      ? 'bg-[#EB8C3A] text-white' 
                      : 'bg-[#7BA3C7] text-white'
                  }`}>
                    {event.accessType === 'members-only' ? t('events.memberOnly') : t('events.allWelcome')}
                  </span>
                </div>
                
                <h3 className="text-[#2B5F9E] mb-2 sm:mb-3 text-lg sm:text-xl">{event.title[language]}</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 flex-1 line-clamp-2 text-sm sm:text-base">
                  {event.description[language]}
                </p>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8C3A] flex-shrink-0" />
                    <span>{event.location[language]}</span>
                  </div>
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
                </div>

                <Link to={`/events/${event.id}`} className="mt-auto">
                  <motion.button
                    className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('events.register')}
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}