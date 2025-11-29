import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CreditCard, Building, Check, Wallet } from "lucide-react";
import { type EventRecord } from "../lib/supabaseApi";

type PaymentMethod = "online" | "onsite" | "transfer" | null;

export function EventRegistration() {
  const { language, t } = useLanguage();
  const [event] = useState<EventRecord | null>(null);

  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: "1",
    notes: "",
  });

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Event not found</p>
        <Link
          to="/events"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("events.back")}
        </Link>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentConfirm = () => {
    // Simulate API call
    setTimeout(() => {
      setStep("success");
    }, 500);
  };

  const paymentOptions = [
    {
      id: "online" as PaymentMethod,
      icon: CreditCard,
      title: t("register.payment.online"),
      desc: language === "zh" ? "信用卡/借记卡" : "Credit/Debit Card",
      color: "#2B5F9E",
    },
    {
      id: "onsite" as PaymentMethod,
      icon: Wallet,
      title: t("register.payment.onsite"),
      desc: language === "zh" ? "活动现场支付" : "Pay at event",
      color: "#6BA868",
    },
    {
      id: "transfer" as PaymentMethod,
      icon: Building,
      title: t("register.payment.transfer"),
      desc: language === "zh" ? "转账至协会账户" : "Bank transfer",
      color: "#EB8C3A",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {["form", "payment", "success"].map((s, index) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step === s
                      ? "bg-[#2B5F9E] text-white"
                      : index < ["form", "payment", "success"].indexOf(step)
                        ? "bg-[#6BA868] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < ["form", "payment", "success"].indexOf(step) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < ["form", "payment", "success"].indexOf(step)
                        ? "bg-[#6BA868]"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Registration Form */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Link
                to={`/events/${event.id}`}
                className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-[#2B5F9E] mb-2">{t("register.title")}</h2>
                <p className="text-gray-600 mb-6">
                  {language === "zh" ? event.title_zh : event.title_en}
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("register.form.name")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("register.form.email")} *
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
                      {t("register.form.phone")} *
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
                      {t("register.form.participants")} *
                    </label>
                    <select
                      value={formData.participants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          participants: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t("register.form.notes")}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("register.next")}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment Selection */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </button>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-[#2B5F9E] mb-2">
                  {t("register.payment.title")}
                </h2>
                <p className="text-gray-600 mb-6">
                  {language === "zh"
                    ? `活动费用：${event.fee === 0 ? "免费" : `$${event.fee} AUD`}`
                    : `Event fee: ${event.fee === 0 ? "Free" : `$${event.fee} AUD`}`}
                </p>

                {event.fee > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {paymentOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => setPaymentMethod(option.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === option.id
                            ? "border-[#2B5F9E] bg-[#F5EFE6]"
                            : "border-gray-200 hover:border-[#2B5F9E]/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ backgroundColor: `${option.color}20` }}
                        >
                          <option.icon
                            className="w-6 h-6"
                            style={{ color: option.color }}
                          />
                        </div>
                        <h3 className="mb-1">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                ) : null}

                <motion.button
                  onClick={handlePaymentConfirm}
                  disabled={event.fee > 0 && !paymentMethod}
                  className={`w-full px-6 py-3 rounded-lg transition-colors ${
                    event.fee > 0 && !paymentMethod
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#2B5F9E] text-white hover:bg-[#234a7e]"
                  }`}
                  whileHover={
                    event.fee === 0 || paymentMethod ? { scale: 1.02 } : {}
                  }
                  whileTap={
                    event.fee === 0 || paymentMethod ? { scale: 0.98 } : {}
                  }
                >
                  {t("register.payment.confirm")}
                </motion.button>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  {language === "zh"
                    ? "* 实际系统将集成Stripe或PayPal支付网关"
                    : "* Production system will integrate Stripe or PayPal gateway"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-[#2B5F9E] mb-4">
                  {t("register.success.title")}
                </h2>
                <p className="text-gray-700 mb-8 max-w-md mx-auto">
                  {t("register.success.message")}
                </p>

                <div className="bg-[#F5EFE6] rounded-xl p-6 mb-6">
                  <h3 className="text-[#2B5F9E] mb-3">
                    {language === "zh" ? "报名信息" : "Registration Details"}
                  </h3>
                  <div className="text-left space-y-2 text-gray-700">
                    <p>
                      <strong>{t("register.form.name")}:</strong>{" "}
                      {formData.name}
                    </p>
                    <p>
                      <strong>{t("register.form.email")}:</strong>{" "}
                      {formData.email}
                    </p>
                    <p>
                      <strong>{t("events.title")}:</strong>{" "}
                      {language === "zh" ? event.title_zh : event.title_en}
                    </p>
                  </div>
                </div>

                <Link to="/events">
                  <motion.button
                    className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("register.success.back")}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
