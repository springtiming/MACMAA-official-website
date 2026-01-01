import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
  uploadPaymentProof,
  type EventRecord,
} from "@/lib/supabaseApi";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

type PaymentMethod = "card" | "cash" | "transfer" | null;
type TransferMethod = "payid" | "traditional" | null;
type MemberInfo = {
  name: string;
  email: string;
  verifiedAt: string;
};

const MEMBER_STORAGE_KEY = "macmaa_member_info";

const getStoredMemberInfo = (): MemberInfo | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(MEMBER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as MemberInfo;
  } catch {
    return null;
  }
};

const saveMemberInfo = (info: MemberInfo) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(info));
};

const clearMemberInfo = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MEMBER_STORAGE_KEY);
};

export function EventRegistration() {
  const router = useRouter();
  const idParam = router.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const statusParam = router.query.status;
  const status = Array.isArray(statusParam) ? statusParam[0] : statusParam;
  const { language, t } = useLanguage();
  const [loadedEvent, setLoadedEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [transferMethod, setTransferMethod] = useState<TransferMethod>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(
    null
  );
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadIdRef = useRef(0);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(() =>
    getStoredMemberInfo()
  );
  const [isMemberChecked, setIsMemberChecked] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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
    if (!router.isReady) return;
    if (status === "success") {
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
  }, [router.isReady, status]);

  useEffect(() => {
    // 等待 router 准备好，避免 hydration 过程中的闪烁
    if (!router.isReady) return;
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
  }, [router.isReady, id, t]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

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
          href="/events"
          className="text-[#2B5F9E] hover:underline mt-4 inline-block"
        >
          {t("events.back")}
        </Link>
      </div>
    );
  }

  const transferDetails = {
    payId: "macmaa@payid.com.au",
    accountName: "Manningham Australian Chinese Mutual Aid Association Inc.",
    bsb: "063-000",
    accountNumber: "1234 5678",
  };

  const clearPaymentProof = () => {
    uploadIdRef.current += 1;
    setPaymentProofUrl(null);
    setIsUploadingProof(false);
    setUploadError(null);
    setPaymentProofPreview((prev) => {
      if (prev && typeof URL !== "undefined") {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  };

  const resetTransferData = () => {
    setTransferMethod(null);
    clearPaymentProof();
    setCopiedField(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
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
    if (!loadedEvent) {
      setUploadError(
        language === "zh"
          ? "上传失败，请刷新页面后再试"
          : "Upload failed, please refresh and try again"
      );
      return;
    }

    const uploadId = uploadIdRef.current + 1;
    uploadIdRef.current = uploadId;
    const previewUrl = URL.createObjectURL(file);
    setPaymentProofPreview((prev) => {
      if (prev && typeof URL !== "undefined") {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });
    setPaymentProofUrl(null);
    setIsUploadingProof(true);

    try {
      const path = await uploadPaymentProof({
        eventId: loadedEvent.id,
        file,
      });
      if (uploadIdRef.current !== uploadId) {
        return;
      }
      setPaymentProofUrl(path);
    } catch (err) {
      if (uploadIdRef.current !== uploadId) {
        return;
      }
      console.error("[events] upload payment proof failed", err);
      setUploadError(
        language === "zh"
          ? "上传失败，请重试"
          : "Upload failed, please try again"
      );
      setPaymentProofUrl(null);
      setPaymentProofPreview((prev) => {
        if (prev && typeof URL !== "undefined") {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    } finally {
      if (uploadIdRef.current === uploadId) {
        setIsUploadingProof(false);
      }
    }
  };

  const memberFee = loadedEvent.member_fee ?? loadedEvent.fee;
  const hasMemberDiscount =
    loadedEvent.fee > 0 &&
    loadedEvent.member_fee != null &&
    Number(loadedEvent.member_fee) < Number(loadedEvent.fee);
  const finalFee =
    hasMemberDiscount && memberInfo
      ? Number(memberFee)
      : Number(loadedEvent.fee);
  const savings = hasMemberDiscount
    ? Number(loadedEvent.fee) - Number(memberFee)
    : 0;

  // Stripe 手续费计算：逆向计算确保协会收到原价
  // 公式：totalWithFee = (原价 + 固定费) / (1 - 费率)
  const STRIPE_FEE_RATE = 0.017; // 1.7%
  const STRIPE_FEE_FIXED = 0.3; // $0.30 AUD
  const totalWithFee =
    loadedEvent.fee > 0
      ? Number(((finalFee + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_RATE)).toFixed(2))
      : 0;
  const stripeFee =
    loadedEvent.fee > 0 ? Number((totalWithFee - finalFee).toFixed(2)) : 0;

  const resetMemberVerification = () => {
    setMemberEmail("");
    setVerificationCode("");
    setCodeSent(false);
    setResendCooldown(0);
    setIsVerifying(false);
  };

  const handleSendVerificationCode = async () => {
    if (!memberEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
      alert(t("register.member.invalidEmail"));
      return;
    }
    setIsVerifying(true);
    try {
      const response = await fetch("/api/send-member-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail.trim() }),
      });
      if (response.ok) {
        setCodeSent(true);
        setVerificationCode("");
        setResendCooldown(60);
        alert(t("register.member.sendSuccess"));
      } else {
        const error = await response.json();
        alert(error.message || t("register.member.sendFailed"));
      }
    } catch (err) {
      console.error("[member] send code failed", err);
      alert(t("register.member.sendFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert(t("register.member.invalidCode"));
      return;
    }
    setIsVerifying(true);
    try {
      const response = await fetch("/api/verify-member-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: memberEmail.trim(),
          code: verificationCode.trim(),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const newMemberInfo: MemberInfo = {
          name: data?.data?.name || formData.name.trim() || "会员",
          email: memberEmail.trim(),
          verifiedAt: new Date().toISOString(),
        };
        setMemberInfo(newMemberInfo);
        saveMemberInfo(newMemberInfo);
        setIsMemberChecked(false);
        resetMemberVerification();
        alert(t("register.member.verifySuccess"));
      } else {
        const error = await response.json();
        alert(error.message || t("register.member.verifyFailed"));
      }
    } catch (err) {
      console.error("[member] verify failed", err);
      alert(t("register.member.verifyFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogoutMember = () => {
    if (window.confirm(t("register.member.logoutConfirm"))) {
      clearMemberInfo();
      setMemberInfo(null);
      setIsMemberChecked(false);
      resetMemberVerification();
    }
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
        payment_proof_url: needsReview
          ? (paymentProofUrl ?? undefined)
          : undefined,
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

  const handleGoToPayment = async () => {
    if (!loadedEvent) return;

    setSubmitting(true);
    setSubmitError(null);
    const tickets = Number(formData.participants) || 1;
    const successUrl = `${window.location.origin}/events/${loadedEvent.id}/register?status=success`;
    const cancelUrl = `${window.location.origin}/events/${loadedEvent.id}/register?status=cancel`;

    // 保存表单数据到 localStorage
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
        memberEmail: memberInfo?.email ?? undefined,
        successUrl,
        cancelUrl,
        totalAmount: loadedEvent.fee > 0 ? totalWithFee : undefined,
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
  };

  const handlePaymentConfirm = async () => {
    if (!loadedEvent) return;

    if (loadedEvent.fee === 0) {
      // 免费活动直接提交
      await submitRegistration();
      return;
    }

    // 只处理银行转账
    if (paymentMethod === "transfer") {
      if (!transferMethod) {
        alert(t("register.payment.selectTransfer"));
        return;
      }
      if (isUploadingProof) {
        alert(t("register.payment.uploading"));
        return;
      }
      if (!paymentProofUrl) {
        alert(t("register.payment.pleaseUpload"));
        return;
      }
      await submitRegistration();
      return;
    }
  };

  const paymentOptions = [
    {
      id: "card" as PaymentMethod,
      icon: CreditCard,
      title: t("register.payment.online"),
      desc:
        language === "zh"
          ? "信用卡/借记卡（含手续费）"
          : "Credit/Debit Card (incl. processing fee)",
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
              <div
                key={s}
                className={`flex items-center ${index < 2 ? "flex-1" : ""}`}
              >
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
                href={`/events/${loadedEvent.id}`}
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
                        loadedEvent.fee === 0 ? "免费" : `$${finalFee} AUD`
                      }`
                    : `Event fee: ${
                        loadedEvent.fee === 0 ? "Free" : `$${finalFee} AUD`
                      }`}
                </p>

                {loadedEvent.fee > 0 && (
                  <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("register.member.amountToPay")}
                    </p>
                    <p className="text-3xl font-bold text-[#2B5F9E]">
                      ${finalFee} AUD
                    </p>
                    {hasMemberDiscount && memberInfo && (
                      <p className="text-xs text-green-600 mt-1">
                        {t("register.member.discountApplied")}
                      </p>
                    )}
                  </div>
                )}

                {hasMemberDiscount && loadedEvent.fee > 0 && (
                  <div className="mb-6">
                    {memberInfo ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("register.member.verified")}
                              </p>
                              <p className="font-semibold text-gray-800">
                                {t("register.member.greeting")},{" "}
                                {memberInfo.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {memberInfo.email}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleLogoutMember}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                          >
                            {t("register.member.logout")}
                          </button>
                        </div>

                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                {t("register.member.regularPrice")}
                              </p>
                              <p className="text-gray-400 line-through">
                                ${loadedEvent.fee} AUD
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">
                                {t("register.member.memberPrice")}
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                ${memberFee} AUD
                              </p>
                            </div>
                          </div>
                          {savings > 0 && (
                            <div className="mt-2 text-center">
                              <p className="text-sm text-green-600 font-semibold">
                                {language === "zh"
                                  ? `您节省了 $${savings}`
                                  : `You save $${savings}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="member-checkbox"
                            checked={isMemberChecked}
                            onChange={(e) => {
                              setIsMemberChecked(e.target.checked);
                              if (!e.target.checked) {
                                resetMemberVerification();
                              }
                            }}
                            className="mt-1 w-5 h-5 text-green-600 rounded"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor="member-checkbox"
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-800">
                                  {t("register.member.applyDiscount")}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  {t("register.member.regularPrice")}:
                                  <span className="line-through ml-1">
                                    ${loadedEvent.fee} AUD
                                  </span>
                                </p>
                                <p>
                                  {t("register.member.memberPrice")}:
                                  <span className="text-green-600 font-bold ml-1">
                                    ${memberFee} AUD
                                  </span>
                                  <span className="ml-2 text-green-600">
                                    {language === "zh"
                                      ? `省 $${savings}`
                                      : `Save $${savings}`}
                                  </span>
                                </p>
                              </div>
                            </label>

                            {isMemberChecked && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 p-4 bg-white rounded-lg border border-green-200"
                              >
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  {t("register.member.verificationTitle")}
                                </h4>

                                <div className="mb-3">
                                  <label className="block text-sm text-gray-600 mb-2">
                                    {t("register.member.email")}
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="email"
                                      value={memberEmail}
                                      onChange={(e) =>
                                        setMemberEmail(e.target.value)
                                      }
                                      placeholder={t(
                                        "register.member.emailPlaceholder"
                                      )}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                      disabled={isVerifying}
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSendVerificationCode}
                                      disabled={
                                        !memberEmail ||
                                        isVerifying ||
                                        resendCooldown > 0
                                      }
                                      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                                        isVerifying || resendCooldown > 0
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                          : "bg-green-600 text-white hover:bg-green-700"
                                      }`}
                                    >
                                      {isVerifying
                                        ? t("register.member.sending")
                                        : codeSent
                                          ? resendCooldown > 0
                                            ? language === "zh"
                                              ? `重新发送(${resendCooldown}s)`
                                              : `Resend (${resendCooldown}s)`
                                            : t("register.member.resendCode")
                                          : t("register.member.sendCode")}
                                    </button>
                                  </div>
                                </div>

                                {codeSent && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <label className="block text-sm text-gray-600 mb-2">
                                      {t("register.member.code")}
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) =>
                                          setVerificationCode(
                                            e.target.value
                                              .replace(/\D/g, "")
                                              .slice(0, 6)
                                          )
                                        }
                                        placeholder={t(
                                          "register.member.codePlaceholder"
                                        )}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none font-mono text-lg tracking-widest"
                                        maxLength={6}
                                        disabled={isVerifying}
                                      />
                                      <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={
                                          verificationCode.length !== 6 ||
                                          isVerifying
                                        }
                                        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                                          verificationCode.length !== 6 ||
                                          isVerifying
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-green-600 text-white hover:bg-green-700"
                                        }`}
                                      >
                                        {isVerifying
                                          ? t("register.member.verifying")
                                          : t("register.member.verify")}
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {t("register.member.codeHint")}
                                    </p>
                                  </motion.div>
                                )}

                                <p className="text-xs text-gray-500 mt-3">
                                  {t("register.member.autoDiscountHint")}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                  {paymentMethod === "card" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                        <h3 className="text-lg text-[#2B5F9E] mb-4">
                          {language === "zh" ? "在线支付" : "Online Payment"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {language === "zh"
                            ? "点击下方按钮跳转到安全的支付页面完成支付"
                            : "Click the button below to proceed to the secure payment page"}
                        </p>
                        <div className="bg-white rounded-lg p-5 mb-4 border border-blue-200">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {language === "zh" ? "活动费用" : "Event Fee"}
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                ${finalFee.toFixed(2)} AUD
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {language === "zh"
                                  ? "手续费"
                                  : "Processing Fee"}
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                ${stripeFee.toFixed(2)} AUD
                              </span>
                            </div>
                            {hasMemberDiscount && memberInfo && (
                              <div className="pt-1">
                                <p className="text-xs text-green-600">
                                  {t("register.member.discountApplied")}
                                </p>
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-300">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-gray-800">
                                  {language === "zh" ? "总计" : "Total"}
                                </span>
                                <span className="text-xl font-bold text-[#2B5F9E]">
                                  ${totalWithFee.toFixed(2)} AUD
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          onClick={handleGoToPayment}
                          disabled={submitting}
                          className={`w-full px-6 py-3 rounded-lg transition-colors ${
                            submitting
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-[#2B5F9E] text-white hover:bg-[#234a7e]"
                          }`}
                          whileHover={!submitting ? { scale: 1.02 } : {}}
                          whileTap={!submitting ? { scale: 0.98 } : {}}
                        >
                          {submitting
                            ? t("common.loading")
                            : language === "zh"
                              ? "前往支付"
                              : "Proceed to Payment"}
                        </motion.button>
                        {submitError && (
                          <p className="text-red-600 text-sm mt-3 text-center">
                            {submitError}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

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
                                      ${finalFee} AUD
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        String(finalFee),
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
                                      ${finalFee} AUD
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyToClipboard(
                                        String(finalFee),
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
                            {/* 费用明细 - 与在线支付对齐 */}
                            <div className="bg-white rounded-lg p-5 mb-4 border border-orange-200">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {language === "zh"
                                      ? "活动费用"
                                      : "Event Fee"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">
                                    ${finalFee.toFixed(2)} AUD
                                  </span>
                                </div>
                                {hasMemberDiscount && memberInfo && (
                                  <div className="pt-1">
                                    <p className="text-xs text-green-600">
                                      {t("register.member.discountApplied")}
                                    </p>
                                  </div>
                                )}
                                <div className="pt-2 border-t border-gray-300">
                                  <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-gray-800">
                                      {language === "zh" ? "总计" : "Total"}
                                    </span>
                                    <span className="text-xl font-bold text-[#EB8C3A]">
                                      ${finalFee.toFixed(2)} AUD
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <h4 className="text-sm text-gray-600 mb-3">
                              {t("register.payment.uploadProof")}
                            </h4>
                            {!paymentProofPreview ? (
                              <label
                                className={`block ${
                                  isUploadingProof
                                    ? "cursor-not-allowed opacity-70"
                                    : "cursor-pointer"
                                }`}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  disabled={isUploadingProof}
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
                                <ImageWithFallback
                                  src={paymentProofPreview || undefined}
                                  alt={t("register.payment.uploadProof")}
                                  className="w-full h-48 object-cover rounded-lg"
                                  onError={() => {
                                    // 如果 blob URL 失效，清除预览
                                    if (
                                      paymentProofPreview?.startsWith("blob:")
                                    ) {
                                      setPaymentProofPreview((prev) => {
                                        if (
                                          prev &&
                                          typeof URL !== "undefined"
                                        ) {
                                          URL.revokeObjectURL(prev);
                                        }
                                        return null;
                                      });
                                    }
                                  }}
                                />
                                <div className="mt-2 flex items-center justify-between">
                                  {isUploadingProof ? (
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <Upload className="w-4 h-4 animate-pulse" />
                                      <span className="text-sm">
                                        {t("register.payment.uploading")}
                                      </span>
                                    </div>
                                  ) : paymentProofUrl ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-sm">
                                        {t("register.payment.uploadSuccess")}
                                      </span>
                                    </div>
                                  ) : (
                                    <div />
                                  )}
                                  <button
                                    type="button"
                                    onClick={clearPaymentProof}
                                    disabled={isUploadingProof}
                                    className={`p-2 bg-red-500 text-white rounded-full transition-colors shadow-sm ${
                                      isUploadingProof
                                        ? "cursor-not-allowed opacity-60"
                                        : "hover:bg-red-600"
                                    }`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
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

                            {/* 确认报名按钮 */}
                            <motion.button
                              onClick={handlePaymentConfirm}
                              disabled={
                                submitting ||
                                isUploadingProof ||
                                !paymentProofUrl
                              }
                              className={`w-full mt-6 px-6 py-3 rounded-lg transition-colors ${
                                submitting ||
                                isUploadingProof ||
                                !paymentProofUrl
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-[#EB8C3A] text-white hover:bg-[#d67b2e]"
                              }`}
                              whileHover={
                                !submitting &&
                                !isUploadingProof &&
                                paymentProofUrl
                                  ? { scale: 1.02 }
                                  : {}
                              }
                              whileTap={
                                !submitting &&
                                !isUploadingProof &&
                                paymentProofUrl
                                  ? { scale: 0.98 }
                                  : {}
                              }
                            >
                              {submitting
                                ? t("common.loading")
                                : paymentProofUrl
                                  ? t("register.payment.confirm")
                                  : language === "zh"
                                    ? "请先上传转账凭证"
                                    : "Please upload proof first"}
                            </motion.button>
                            {submitError && (
                              <p className="text-red-600 text-sm mt-3 text-center">
                                {submitError}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 底部确认按钮 - 只在免费活动时显示 */}
                {loadedEvent.fee === 0 && (
                  <motion.button
                    onClick={handlePaymentConfirm}
                    disabled={submitting}
                    className={`w-full px-6 py-3 rounded-lg transition-colors ${
                      submitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#2B5F9E] text-white hover:bg-[#234a7e]"
                    }`}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                  >
                    {submitting
                      ? t("common.loading")
                      : t("register.payment.confirm")}
                  </motion.button>
                )}

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

                <Link href="/events">
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
