import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Check } from 'lucide-react';

export function Membership() {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    background: '',
    interests: '',
    volunteer: 'no',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-[#2B5F9E] mb-4">{t('membership.title')}</h1>
              <p className="text-gray-700 max-w-2xl mx-auto">
                {t('membership.subtitle')}
              </p>
            </div>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: language === 'zh' ? '优先报名' : 'Priority Registration',
                  desc: language === 'zh' ? '活动优先通知和报名' : 'Early event notifications',
                  color: '#2B5F9E',
                },
                {
                  title: language === 'zh' ? '费用优惠' : 'Member Discounts',
                  desc: language === 'zh' ? '享受会员专属折扣' : 'Exclusive member pricing',
                  color: '#6BA868',
                },
                {
                  title: language === 'zh' ? '社区网络' : 'Community Network',
                  desc: language === 'zh' ? '拓展人脉和资源' : 'Expand connections',
                  color: '#EB8C3A',
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${benefit.color}20` }}
                  >
                    <Check className="w-6 h-6" style={{ color: benefit.color }} />
                  </div>
                  <h3 className="mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Application Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-[#2B5F9E] mb-6">{t('membership.form.title')}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t('membership.form.firstName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t('membership.form.lastName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('membership.form.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('membership.form.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('membership.form.address')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('membership.form.background')}
                  </label>
                  <input
                    type="text"
                    value={formData.background}
                    onChange={(e) =>
                      setFormData({ ...formData, background: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    placeholder={language === 'zh' ? '例如：华裔加拿大人' : 'e.g., Chinese Canadian'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('membership.form.interests')}
                  </label>
                  <textarea
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    placeholder={language === 'zh' ? '您对哪些服务或活动感兴趣？' : 'Which services or activities interest you?'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-3">
                    {t('membership.form.volunteer')}
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="volunteer"
                        value="yes"
                        checked={formData.volunteer === 'yes'}
                        onChange={(e) =>
                          setFormData({ ...formData, volunteer: e.target.value })
                        }
                        className="w-4 h-4 text-[#2B5F9E]"
                      />
                      <span>{t('membership.form.yes')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="volunteer"
                        value="no"
                        checked={formData.volunteer === 'no'}
                        onChange={(e) =>
                          setFormData({ ...formData, volunteer: e.target.value })
                        }
                        className="w-4 h-4 text-[#2B5F9E]"
                      />
                      <span>{t('membership.form.no')}</span>
                    </label>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('membership.form.submit')}
                </motion.button>
              </form>

              <p className="text-sm text-gray-500 mt-6 text-center">
                {t('common.note')}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-[#2B5F9E] mb-4">{t('membership.success.title')}</h2>
            <p className="text-gray-700 mb-8 max-w-md mx-auto">
              {t('membership.success.message')}
            </p>

            <div className="bg-[#F5EFE6] rounded-xl p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-[#2B5F9E] mb-3">
                {language === 'zh' ? '申请信息' : 'Application Details'}
              </h3>
              <div className="text-left space-y-2 text-gray-700">
                <p><strong>{t('membership.form.firstName')}:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>{t('membership.form.email')}:</strong> {formData.email}</p>
                <p><strong>{t('membership.form.phone')}:</strong> {formData.phone}</p>
              </div>
            </div>

            <motion.button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('membership.success.home')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
