import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { mockNews } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function NewsList() {
  const { language, t } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[#2B5F9E] mb-4">{t('news.title')}</h1>
        <p className="text-gray-600">{t('common.note')}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockNews.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Link
              to={`/news/${news.id}`}
              className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full"
            >
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <ImageWithFallback
                  src={`https://source.unsplash.com/800x600/?${news.image}`}
                  alt={news.title[language]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{news.date}</span>
                </div>
                <h3 className="text-[#2B5F9E] mb-3">{news.title[language]}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {news.summary[language]}
                </p>
                <div className="flex items-center gap-2 text-[#2B5F9E]">
                  <span>{t('news.readMore')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
