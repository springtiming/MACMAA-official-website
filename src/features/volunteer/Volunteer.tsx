import { useLanguage } from "@/contexts/LanguageContext";
import { organization } from "@/lib/seo/config";
import { motion } from "motion/react";
import { Download, Mail, Heart, Users, Award, Sparkles } from "lucide-react";

export function Volunteer() {
  const { t } = useLanguage();

  const benefits = [
    { icon: Award, text: t("volunteer.benefits.1") },
    { icon: Sparkles, text: t("volunteer.benefits.2") },
    { icon: Users, text: t("volunteer.benefits.3") },
    { icon: Heart, text: t("volunteer.benefits.4") },
  ];

  const handleDownload = () => {
    // Download the volunteer application form
    const link = document.createElement("a");
    link.href = "/assets/volunteer-application-form.pdf";
    link.download = "MACMAA-Volunteer-Application-Form.pdf";
    link.click();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2B5F9E] mb-4">
            {t("volunteer.title")}
          </h1>
          <p className="text-lg text-gray-600">{t("volunteer.subtitle")}</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">
            {t("volunteer.description")}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-[#F5EFE6] to-[#E8DCC8] rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#2B5F9E] mb-6">
            {t("volunteer.benefits.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 bg-white rounded-lg p-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#6BA868]/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-[#6BA868]" />
                </div>
                <span className="text-gray-700">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-[#2B5F9E] mb-6">
            {t("volunteer.howToApply")}
          </h2>

          <div className="space-y-6">
            {/* Step 1: Download Form */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#2B5F9E] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-3">{t("volunteer.step1")}</p>
                <motion.button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5" />
                  {t("volunteer.downloadForm")}
                </motion.button>
              </div>
            </div>

            {/* Step 2: Send Email */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#2B5F9E] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-3">{t("volunteer.step2")}</p>
                <div className="bg-[#F5EFE6] rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("volunteer.sendTo")}
                  </p>
                  <a
                    href={`mailto:${organization.email}`}
                    className="inline-flex items-center gap-2 text-[#2B5F9E] font-medium hover:underline"
                  >
                    <Mail className="w-5 h-5" />
                    {organization.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600">{t("volunteer.note")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
