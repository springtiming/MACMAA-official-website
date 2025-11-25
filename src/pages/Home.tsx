import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Calendar, BookOpen, Users, ArrowRight } from 'lucide-react';

export function Home() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Calendar,
      title: t('home.services.events'),
      description: t('home.services.events.desc'),
      color: '#EB8C3A',
    },
    {
      icon: BookOpen,
      title: t('home.services.education'),
      description: t('home.services.education.desc'),
      color: '#6BA868',
    },
    {
      icon: Users,
      title: t('home.services.support'),
      description: t('home.services.support.desc'),
      color: '#2B5F9E',
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
              className="text-[#2B5F9E] mb-6"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-700 mb-8 max-w-2xl mx-auto"
            >
              {t('home.hero.subtitle')}
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
                  {t('home.hero.cta.news')}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/membership">
                <motion.button
                  className="px-8 py-3 bg-white text-[#2B5F9E] rounded-lg border-2 border-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.hero.cta.join')}
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
          <h2 className="text-[#2B5F9E] mb-4">{t('home.about.title')}</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            {t('home.about.desc')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${service.color}20` }}
              >
                <service.icon
                  className="w-7 h-7"
                  style={{ color: service.color }}
                />
              </div>
              <h3 className="mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2B5F9E] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            {t('home.hero.cta.join')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-blue-100 max-w-2xl mx-auto"
          >
            {t('membership.subtitle')}
          </motion.p>
          <Link to="/membership">
            <motion.button
              className="px-8 py-3 bg-white text-[#2B5F9E] rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('nav.membership')}
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
