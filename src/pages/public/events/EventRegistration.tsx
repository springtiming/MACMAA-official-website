import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CreditCard,
  Building,
  Check,
  Upload,
  X,
  Copy,
  CheckCircle,
  Wallet,
} from "lucide-react";
import {
  createEventRegistration,
  createStripeCheckoutSession,
  fetchEventById,
  notifyEventRegistration,
  type EventRecord,
} from "@/lib/supabaseApi";

type PaymentMethod = "card" | "cash" | "transfer" | null;
type TransferMethod = "payid" | "traditional" | null;

export function EventRegistration() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [loadedEvent, setLoadedEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [transferMethod, setTransferMethod] = useState<TransferMethod>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: "1",
    notes: "",
  });

  // Handle Stripe redirect: check URL status param and restore form data
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      const saved = localStorage.getItem("pendingEventRegistration");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...data }));
        } catch {
          // ignore parse error
        }
        localStorage.removeItem("pendingEventRegistration");
      }
      setStep("success");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchEventById(id)
      .then((data) => {
        if (active) {
          setLoadedEvent(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(t("common.error"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (!loadedEvent) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">{loadError || "Event not found"}</p>
        <Link
          to="/events"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("events.back")}
        </Link>
      </div>
    );
  }

  const transferDetails = {
    payId: "macmaa@payid.com.au",
    accountName:
      "Manningham Australian Chinese Mutual Aid Association Inc.",
    bsb: "063-000",
    accountNumber: "1234 5678",
  };

  const resetTransferData = () => {
    setTransferMethod(null);
    setPaymentProof(null);
    setCopiedField(null);
    setUploadError(null);
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    if (!navigator?.clipboard?.writeText) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError(
        language === "zh" ? "请上传图片文件" : "Please upload an image file"
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        language === "zh"
          ? "图片大小不能超过 5MB"
          : "Image size must be less than 5MB"
      );
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitRegistration = async () => {
    if (!loadedEvent) return;
    if (loadedEvent.fee > 0 && !paymentMethod) return;
    setSubmitting(true);
    setSubmitError(null);
    const tickets = Number(formData.participants) || 1;
    const resolvedPaymentMethod =
      paymentMethod === "transfer" && transferMethod === "payid"
        ? "payid"
        : paymentMethod;
    const needsReview =
      resolvedPaymentMethod === "transfer" || resolvedPaymentMethod === "payid";
    try {
      await createEventRegistration({
        event_id: loadedEvent.id,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        tickets,
        payment_method: resolvedPaymentMethod,
        payment_status: needsReview ? "pending" : undefined,
        payment_proof: needsReview ? paymentProof : undefined,
      });
      void notifyEventRegistration({
        eventTitleZh: loadedEvent.title_zh,
        eventTitleEn: loadedEvent.title_en,
        name: formData.name.trim(),
        email: formData.email.trim(),
        tickets,
        paymentMethod: resolvedPaymentMethod,
        notes: formData.notes.trim() || null,
        notifyAdminNotes: Boolean(formData.notes),
      });
      setStep("success");
    } catch (err) {
      console.error("[events] registration failed", err);
      setSubmitError(
        language === "zh"
          ? "报名失败，请稍后再试。"
          : "Registration failed, please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadedEvent?.fee === 0) {
      // 免费活动直接提交
      await submitRegistration();
    } else {
      // 付费活动进入支付步骤
      setStep("payment");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!loadedEvent) return;

    if (loadedEvent.fee === 0) {
      await submitRegistration();
      return;
    }

    if (paymentMethod === "transfer") {
      if (!transferMethod) {
        alert(t("register.payment.selectTransfer"));
        return;
      }
      if (!paymentProof) {
        alert(t("register.payment.pleaseUpload"));
        return;
      }
    }

    if (paymentMethod === "card") {
      setSubmitting(true);
      setSubmitError(null);
      const tickets = Number(formData.participants) || 1;
      const successUrl = `${window.location.origin}/events/${loadedEvent.id}/register?status=success`;
      const cancelUrl = `${window.location.origin}/events/${loadedEvent.id}/register?status=cancel`;
      // Save form data to localStorage before redirecting to Stripe
      localStorage.setItem(
        "pendingEventRegistration",
        JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          participants: formData.participants,
        })
      );
      try {
        const session = await createStripeCheckoutSession({
          eventId: loadedEvent.id,
          tickets,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim() || undefined,
          successUrl,
          cancelUrl,
        });

        if (session.url) {
          window.location.href = session.url;
          return;
        }

        throw new Error("Missing checkout session URL");
      } catch (err) {
        console.error("[events] stripe checkout failed", err);
        setSubmitError(
          language === "zh"
            ? "支付创建失败，请稍后再试。"
            : "Could not start payment, please try again."
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    await submitRegistration();
  };

  const paymentOptions = [
    {
      id: "card" as PaymentMethod,
      icon: CreditCard,
      title: t("register.payment.online"),
      desc:
        language === "zh"
          ? "信用卡/借记卡（含手续费）"
          : "Credit/Debit Card (incl. fee)",
      color: "#2B5F9E",
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
          <div className="flex items-center justify-between mb-2 w-full">
            {["form", "payment", "success"].map((s, index) => (
              <div key={s} className={`flex items-center ${index < 2 ? "flex-1" : ""}`}>
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
                to={`/events/${loadedEvent.id}`}
                className="inline-flex items-center gap-2 text-[#2B5F9E] hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-[#2B5F9E] mb-2">{t("register.title")}</h2>
                <p className="text-gray-600 mb-6">
                  {language === "zh"
                    ? loadedEvent.title_zh
                    : loadedEvent.title_en}
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
                    ? `活动费用：${
                        loadedEvent.fee === 0
                          ? "免费"
                          : `$${loadedEvent.fee} AUD`
                      }`
                    : `Event fee: ${
                        loadedEvent.fee === 0
                          ? "Free"
                          : `$${loadedEvent.fee} AUD`
                      }`}
                </p>

                {loadedEvent.fee > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paymentOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => {
                          setPaymentMethod(option.id);
                          if (option.id !== "transfer") {
                            resetTransferData();
                          }
                        }}
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

                <AnimatePresence>
                  {paymentMethod === "transfer" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                        <h3 className="text-lg text-[#EB8C3A] mb-4">
                          {t("register.payment.selectTransfer")}
                        </h3>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <button
                            type="button"
                            onClick={() => setTransferMethod("payid")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              transferMethod === "payid"
                                ? "border-[#EB8C3A] bg-white shadow-md"
                                : "border-orange-200 bg-white/50 hover:border-[#EB8C3A]/50"
                            }`}
                          >
                            <Wallet className="w-6 h-6 mx-auto mb-2 text-[#EB8C3A]" />
                            <p className="text-sm">
                              {t("register.payment.payid")}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("register.payment.payid.instant")}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTransferMethod("traditional")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              transferMethod === "traditional"
                                ? "border-[#EB8C3A] bg-white shadow-md"
                                : "border-orange-200 bg-white/50 hover:border-[#EB8C3A]/50"
                            }`}
                          >
                            <Building className="w-6 h-6 mx-auto mb-2 text-[#EB8C3A]" />
                            <p className="text-sm">
                              {t("register.payment.traditional")}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("register.payment.traditional.bsb")}
                            </p>
                          </button>
                        </div>

                        <AnimatePresence mode="wait">
                          {transferMethod === "payid" && (
                            <motion.div
                              key="payid"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white rounded-lg p-5 mb-4 border border-orange-200"
                            >
                              <h4 className="text-sm text-gray-600 mb-3">
                                {t("register.payment.details.payid")}
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.payid")}
                                    </p>
                                    <p className="text-sm font-mono">
                                      {transferDetails.payId}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        transferDetails.payId,
                                        "payid"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "payid" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.accountName")}
                                    </p>
                                    <p className="text-sm">
                                      {transferDetails.accountName}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        transferDetails.accountName,
                                        "accountName"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "accountName" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.amount")}
                                    </p>
                                    <p className="text-lg text-[#EB8C3A]">
                                      ${loadedEvent.fee} AUD
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        String(loadedEvent.fee),
                                        "amount"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "amount" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {transferMethod === "traditional" && (
                            <motion.div
                              key="traditional"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white rounded-lg p-5 mb-4 border border-orange-200"
                            >
                              <h4 className="text-sm text-gray-600 mb-3">
                                {t("register.payment.details.traditional")}
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.bsb")}
                                    </p>
                                    <p className="text-sm font-mono">
                                      {transferDetails.bsb}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        transferDetails.bsb,
                                        "bsb"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "bsb" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.accountNumber")}
                                    </p>
                                    <p className="text-sm font-mono">
                                      {transferDetails.accountNumber}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        transferDetails.accountNumber.replace(
                                          /\s/g,
                                          ""
                                        ),
                                        "accountNumber"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "accountNumber" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.accountName")}
                                    </p>
                                    <p className="text-sm">
                                      {transferDetails.accountName}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        transferDetails.accountName,
                                        "accountName"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "accountName" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t("register.payment.amount")}
                                    </p>
                                    <p className="text-lg text-[#EB8C3A]">
                                      ${loadedEvent.fee} AUD
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        String(loadedEvent.fee),
                                        "amount"
                                      )
                                    }
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {copiedField === "amount" ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {transferMethod && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h4 className="text-sm text-gray-600 mb-3">
                              {t("register.payment.uploadProof")}
                            </h4>
                            {!paymentProof ? (
                              <label className="block cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                                <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-[#EB8C3A] hover:bg-orange-50/50 transition-all">
                                  <Upload className="w-12 h-12 mx-auto mb-3 text-[#EB8C3A]" />
                                  <p className="text-sm text-gray-700 mb-1">
                                    {t("register.payment.uploadClick")}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {t("register.payment.uploadFormat")}
                                  </p>
                                </div>
                              </label>
                            ) : (
                              <div className="relative">
                                <img
                                  src={paymentProof}
                                  alt={t("register.payment.uploadProof")}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentProof(null);
                                    setUploadError(null);
                                  }}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="mt-2 flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    {t("register.payment.uploadSuccess")}
                                  </span>
                                </div>
                              </div>
                            )}
                            {uploadError && (
                              <p className="text-xs text-red-600 mt-2">
                                {uploadError}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-3">
                              {t("register.payment.uploadWarning")}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handlePaymentConfirm}
                  disabled={
                    (loadedEvent.fee > 0 && !paymentMethod) || submitting
                  }
                  className={`w-full px-6 py-3 rounded-lg transition-colors ${
                    loadedEvent.fee > 0 && !paymentMethod
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#2B5F9E] text-white hover:bg-[#234a7e]"
                  }`}
                  whileHover={
                    loadedEvent.fee === 0 || paymentMethod
                      ? { scale: 1.02 }
                      : {}
                  }
                  whileTap={
                    loadedEvent.fee === 0 || paymentMethod
                      ? { scale: 0.98 }
                      : {}
                  }
                >
                  {submitting
                    ? t("common.loading")
                    : t("register.payment.confirm")}
                </motion.button>

                {submitError && (
                  <p className="text-red-600 text-sm mt-3 text-center">
                    {submitError}
                  </p>
                )}
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
                      {language === "zh"
                        ? loadedEvent.title_zh
                        : loadedEvent.title_en}
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
