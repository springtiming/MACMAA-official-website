import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Users, Check } from "lucide-react";

export function Membership() {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    chineseName: "",
    englishName: "",
    gender: "male",
    birthday: "",
    email: "",
    phone: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    agree1: false,
    agree2: false,
    agree3: false,
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
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-[#2B5F9E] mb-4">{t("membership.title")}</h1>
              <p className="text-gray-700 max-w-2xl mx-auto mb-2">
                {t("membership.subtitle")}
              </p>
              <div className="text-[#2B5F9E]">
                <p className="mb-1">{t("membership.fee")}</p>
                <p className="text-sm text-gray-600">
                  {t("membership.feeNote")}
                </p>
              </div>
            </div>

            {/* Weekly Activities Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] rounded-xl p-6 mb-12 text-white text-center"
            >
              <h3 className="mb-2">{t("home.weekly.title")}</h3>
              <p className="mb-1">{t("home.weekly.time")}</p>
              <p>{t("home.weekly.location")}</p>
            </motion.div>

            {/* Application Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-[#2B5F9E] mb-6">
                {t("membership.form.title")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("membership.form.chineseName")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.chineseName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chineseName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("membership.form.englishName")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.englishName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          englishName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("membership.form.gender")} *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === "male"}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-4 h-4 text-[#2B5F9E]"
                        />
                        <span>{t("membership.form.male")}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === "female"}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-4 h-4 text-[#2B5F9E]"
                        />
                        <span>{t("membership.form.female")}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("membership.form.birthday")} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birthday}
                      onChange={(e) =>
                        setFormData({ ...formData, birthday: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t("membership.form.phone")} *
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
                    {t("membership.form.email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {t("membership.form.address")} *
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

                {/* Emergency Contact */}
                <div className="border-t pt-6">
                  <h3 className="text-[#2B5F9E] mb-4">
                    {t("membership.form.emergency")}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        {t("membership.form.emergencyName")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.emergencyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          {t("membership.form.emergencyPhone")} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.emergencyPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyPhone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          {t("membership.form.emergencyRelation")} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.emergencyRelation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyRelation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                          placeholder={
                            language === "zh"
                              ? "例如：配偶、子女"
                              : "e.g., Spouse, Child"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membership Type */}
                <div className="bg-[#F5EFE6] rounded-lg p-4">
                  <label className="block text-gray-700 mb-2">
                    {t("membership.form.memberType")}
                  </label>
                  <p className="text-[#2B5F9E]">
                    {t("membership.form.regular")}
                  </p>
                </div>

                {/* Agreement Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agree1}
                      onChange={(e) =>
                        setFormData({ ...formData, agree1: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 text-[#2B5F9E]"
                    />
                    <span className="text-gray-700">
                      {t("membership.form.agree1")}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agree2}
                      onChange={(e) =>
                        setFormData({ ...formData, agree2: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 text-[#2B5F9E]"
                    />
                    <span className="text-gray-700">
                      {t("membership.form.agree2")}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agree3}
                      onChange={(e) =>
                        setFormData({ ...formData, agree3: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 text-[#2B5F9E]"
                    />
                    <span className="text-gray-700">
                      {t("membership.form.agree3")}
                    </span>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("membership.form.submit")}
                </motion.button>
              </form>

              {/* Privacy Statement */}
              <div className="mt-8 p-4 bg-[#F5EFE6] rounded-lg">
                <h4 className="text-[#2B5F9E] mb-2">
                  {t("membership.privacy.title")}
                </h4>
                <p className="text-sm text-gray-700">
                  {t("membership.privacy.desc")}
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-6 text-center">
                {t("common.note")}
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
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-[#2B5F9E] mb-4">
              {t("membership.success.title")}
            </h2>
            <p className="text-gray-700 mb-8 max-w-md mx-auto">
              {t("membership.success.message")}
            </p>

            <div className="bg-[#F5EFE6] rounded-xl p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-[#2B5F9E] mb-3">
                {language === "zh" ? "申请信息" : "Application Details"}
              </h3>
              <div className="text-left space-y-2 text-gray-700">
                <p>
                  <strong>{t("membership.form.chineseName")}:</strong>{" "}
                  {formData.chineseName}
                </p>
                <p>
                  <strong>{t("membership.form.englishName")}:</strong>{" "}
                  {formData.englishName}
                </p>
                <p>
                  <strong>{t("membership.form.phone")}:</strong>{" "}
                  {formData.phone}
                </p>
                <p>
                  <strong>{t("membership.form.email")}:</strong>{" "}
                  {formData.email || language === "zh"
                    ? "未提供"
                    : "Not provided"}
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("membership.success.home")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
