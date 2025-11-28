import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Check,
  Mail,
  Lock,
  Bell,
  Globe
} from 'lucide-react';

export function AdminSettings() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [successMessage, setSuccessMessage] = useState('');
  
  // Email state
  const [email, setEmail] = useState('admin@macmaa.org');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [memberNotifications, setMemberNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  
  // Email language preference
  const [emailLanguage, setEmailLanguage] = useState<'zh' | 'en'>('zh');

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(t('admin.settings.emailUpdated'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert(t('admin.settings.passwordMismatch'));
      return;
    }
    setSuccessMessage(t('admin.settings.passwordUpdated'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(t('admin.settings.notificationsUpdated'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-[#2B5F9E] hover:text-[#6BA868] transition-colors mb-4"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('admin.backToDashboard')}</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[#2B5F9E]">{t('admin.settings.title')}</h1>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
          >
            <Check className="w-5 h-5" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Email Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#2B5F9E]" />
              </div>
              <div>
                <h2 className="text-xl text-[#2B5F9E]">{t('admin.settings.emailSection')}</h2>
                <p className="text-gray-600 text-sm">{t('admin.settings.emailDesc')}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">{t('admin.settings.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  placeholder="admin@macmaa.org"
                />
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2B5F9E] to-[#3a7bc8] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                {t('admin.settings.saveEmail')}
              </motion.button>
            </form>
          </motion.div>

          {/* Password Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl text-[#2B5F9E]">{t('admin.settings.changePassword')}</h2>
                <p className="text-gray-600 text-sm">{t('admin.settings.passwordRequirements')}</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-gray-700 mb-2">{t('admin.settings.currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E] pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 mb-2">{t('admin.settings.newPassword')}</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E] pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 mb-2">{t('admin.settings.confirmPassword')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E] pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2B5F9E] to-[#3a7bc8] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                {t('admin.settings.changePassword')}
              </motion.button>
            </form>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#EB8C3A]" />
              </div>
              <div>
                <h2 className="text-xl text-[#2B5F9E]">{t('admin.settings.notificationsSection')}</h2>
                <p className="text-gray-600 text-sm">{t('admin.settings.notificationsDesc')}</p>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-gray-900 mb-1">{t('admin.settings.emailNotifications')}</div>
                  <div className="text-sm text-gray-600">{t('admin.settings.emailNotificationsDesc')}</div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    emailNotifications ? 'bg-[#6BA868]' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-gray-900 mb-1">{t('admin.settings.memberNotifications')}</div>
                  <div className="text-sm text-gray-600">{t('admin.settings.memberNotificationsDesc')}</div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={memberNotifications}
                    onChange={(e) => setMemberNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    memberNotifications ? 'bg-[#6BA868]' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      memberNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-gray-900 mb-1">{t('admin.settings.eventNotifications')}</div>
                  <div className="text-sm text-gray-600">{t('admin.settings.eventNotificationsDesc')}</div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={eventNotifications}
                    onChange={(e) => setEventNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    eventNotifications ? 'bg-[#6BA868]' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      eventNotifications ? 'translate-x-7' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </label>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2B5F9E] to-[#3a7bc8] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                {t('admin.settings.saveNotifications')}
              </motion.button>
            </form>
          </motion.div>

          {/* Email Language Preference Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#6BA868]" />
              </div>
              <div>
                <h2 className="text-xl text-[#2B5F9E]">{t('admin.settings.emailLanguageSection')}</h2>
                <p className="text-gray-600 text-sm">{t('admin.settings.emailLanguageDesc')}</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setSuccessMessage(t('admin.settings.emailLanguageUpdated'));
              setTimeout(() => setSuccessMessage(''), 3000);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setEmailLanguage('zh')}
                  className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                    emailLanguage === 'zh'
                      ? 'border-[#6BA868] bg-gradient-to-br from-green-50 to-green-100 shadow-md scale-105'
                      : 'border-gray-300 hover:border-[#6BA868] hover:shadow-sm'
                  }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🇨🇳</div>
                    <div className="text-lg mb-1">{t('admin.settings.chinese')}</div>
                    <div className="text-xs text-gray-500">{t('admin.settings.chineseDesc')}</div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setEmailLanguage('en')}
                  className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                    emailLanguage === 'en'
                      ? 'border-[#6BA868] bg-gradient-to-br from-green-50 to-green-100 shadow-md scale-105'
                      : 'border-gray-300 hover:border-[#6BA868] hover:shadow-sm'
                  }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🇦🇺</div>
                    <div className="text-lg mb-1">{t('admin.settings.english')}</div>
                    <div className="text-xs text-gray-500">{t('admin.settings.englishDesc')}</div>
                  </div>
                </motion.button>
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2B5F9E] to-[#3a7bc8] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                {t('admin.settings.saveLanguage')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}