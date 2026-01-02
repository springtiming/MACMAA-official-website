import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  FileCheck,
  ArrowLeft,
  X,
  Users,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchPhotos, type UnsplashPhoto } from "@/lib/unsplashApi";
import {
  fetchAdminEvents,
  saveEvent,
  deleteEvent,
  fetchAdminEventRegistrations,
  getPaymentProofSignedUrl,
  updateEventRegistrationPaymentStatus,
  type EventRecord,
  type UpsertEventInput,
  type EventRegistrationRecord,
} from "@/lib/supabaseApi";
import { pickLocalized } from "@/lib/supabaseHelpers";
import { ImageUploadModal } from "@/components/ImageUploadModal";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { useProcessingFeedback } from "@/hooks/useProcessingFeedback";
import { AdminConfirmDialog } from "@/components/AdminConfirmDialog";
import {
  type ErrorMessages,
  type FormErrors,
  type ValidationConfig,
  type ValidationRules,
  getErrorMessage,
  scrollToFirstError,
  validateField as validateFieldUtil,
  validateForm as validateFormUtil,
} from "@/lib/formValidation";

type FormState = {
  id: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  date: string;
  start: string;
  end: string;
  location: string;
  fee: string;
  memberFee: string;
  capacity: string;
  access: "all-welcome" | "members-only";
  imageType: "unsplash" | "upload";
  imageKeyword: string;
  imageUrl: string;
};

const emptyForm: FormState = {
  id: "",
  titleZh: "",
  titleEn: "",
  descZh: "",
  descEn: "",
  date: new Date().toISOString().slice(0, 10),
  start: "",
  end: "",
  location: "",
  fee: "0",
  memberFee: "",
  capacity: "",
  access: "all-welcome",
  imageType: "upload",
  imageKeyword: "",
  imageUrl: "",
};

type EventValidationFields = {
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  date: string;
  start: string;
  location: string;
  fee: string;
  imageUrl: string;
};

const eventValidationRules: ValidationRules<EventValidationFields> = {
  titleZh: {
    pattern: /^.{2,120}$/,
    errorType: "invalidEventTitleZh",
    required: true,
  },
  titleEn: {
    pattern: /^.{2,120}$/,
    errorType: "invalidEventTitleEn",
    required: true,
  },
  descZh: {
    pattern: /^.{10,2000}$/,
    errorType: "invalidEventDescZh",
    required: true,
  },
  descEn: {
    pattern: /^.{10,2000}$/,
    errorType: "invalidEventDescEn",
    required: true,
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    errorType: "invalidEventDate",
    required: true,
  },
  start: {
    pattern: /^\d{2}:\d{2}$/,
    errorType: "invalidEventStart",
    required: true,
  },
  location: {
    pattern: /^.{2,200}$/,
    errorType: "invalidEventLocation",
    required: true,
  },
  fee: {
    pattern: /^\d+(\.\d{1,2})?$/,
    errorType: "invalidEventFee",
    required: true,
  },
  imageUrl: {
    validate: (value: string) => value.trim().length > 0,
    errorType: "invalidEventImage",
    required: true,
  },
};

const eventErrorMessages: ErrorMessages = {
  required: {
    zh: "此字段为必填项",
    en: "This field is required",
  },
  invalidEventTitleZh: {
    zh: "请输入中文标题（至少2个字符）",
    en: "Chinese title must contain at least 2 characters",
  },
  invalidEventTitleEn: {
    zh: "请输入英文标题（至少2个字符）",
    en: "English title must contain at least 2 characters",
  },
  invalidEventDescZh: {
    zh: "请输入10字以上的中文简介",
    en: "Chinese description must be at least 10 characters",
  },
  invalidEventDescEn: {
    zh: "请输入10字以上的英文简介",
    en: "English description must be at least 10 characters",
  },
  invalidEventDate: {
    zh: "请选择活动日期",
    en: "Please select the event date",
  },
  invalidEventStart: {
    zh: "请输入开始时间（HH:mm）",
    en: "Please enter a start time (HH:mm)",
  },
  invalidEventLocation: {
    zh: "请输入活动地点",
    en: "Please enter the event location",
  },
  invalidEventFee: {
    zh: "请输入合法的票价（可含两位小数）",
    en: "Enter a valid price (allows up to two decimals)",
  },
  invalidEventImage: {
    zh: "请选择或上传封面图片",
    en: "Please select or upload a cover image",
  },
};

const eventRequiredFields = Object.keys(
  eventValidationRules
) as (keyof EventValidationFields)[];

const mapEventFormToValidation = (form: FormState): EventValidationFields => ({
  titleZh: form.titleZh.trim(),
  titleEn: form.titleEn.trim(),
  descZh: form.descZh.trim(),
  descEn: form.descEn.trim(),
  date: form.date,
  start: form.start.trim(),
  location: form.location.trim(),
  fee: form.fee.trim(),
  imageUrl: form.imageUrl.trim(),
});

function toForm(e: EventRecord | null): FormState {
  if (!e) return emptyForm;
  const resolvedType: "unsplash" | "upload" =
    e?.image_type ?? (e?.image_url ? "upload" : "unsplash");
  return {
    id: e.id,
    titleZh: e.title_zh ?? "",
    titleEn: e.title_en ?? "",
    descZh: e.description_zh ?? "",
    descEn: e.description_en ?? "",
    date: e.event_date ?? emptyForm.date,
    start: e.start_time?.slice(0, 5) ?? "",
    end: e.end_time?.slice(0, 5) ?? "",
    location: e.location ?? "",
    fee: String(e.fee ?? 0),
    memberFee: e.member_fee != null ? String(e.member_fee) : "",
    capacity: e.capacity != null ? String(e.capacity) : "",
    access: (e.access_type as FormState["access"]) ?? "all-welcome",
    imageType: resolvedType,
    imageKeyword: e.image_keyword ?? "",
    imageUrl: e.image_url ?? "",
  };
}

const inputBaseClass =
  "w-full h-12 border rounded-xl px-4 shadow-sm appearance-none [appearance:textfield] [::-webkit-inner-spin-button]:appearance-none [::-webkit-outer-spin-button]:appearance-none";

const isExternalProofUrl = (value: string) =>
  /^https?:\/\//i.test(value) ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

type PaymentProofLightboxPayload = {
  url: string;
  title: string;
  subtitle?: string;
};

export function AdminEvents() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>(
    []
  );
  const [regsLoading, setRegsLoading] = useState(false);
  const [regsError, setRegsError] = useState<string | null>(null);
  const [activeRegEvent, setActiveRegEvent] = useState<EventRecord | null>(
    null
  );
  const [allRegistrations, setAllRegistrations] = useState<
    EventRegistrationRecord[]
  >([]);
  const [allRegsLoading, setAllRegsLoading] = useState(false);
  const [allRegsError, setAllRegsError] = useState<string | null>(null);
  const [activePaymentEvent, setActivePaymentEvent] =
    useState<EventRecord | null>(null);
  const [lightboxImage, setLightboxImage] =
    useState<PaymentProofLightboxPayload | null>(null);
  const [signedProofUrls, setSignedProofUrls] = useState<
    Record<string, string>
  >({});
  const [paymentUpdates, setPaymentUpdates] = useState<Record<string, boolean>>(
    {}
  );
  const [registrationsTab, setRegistrationsTab] = useState<
    "confirmed" | "pending" | "cancelled"
  >("confirmed");
  const [imageSource, setImageSource] = useState<"unsplash" | "upload">(
    emptyForm.imageType
  );
  const [uploadedImage, setUploadedImage] = useState("");
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [selectedUnsplashId, setSelectedUnsplashId] = useState<string | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "delete";
    targetId: string;
  } | null>(null);
  const {
    state: processingState,
    title: processingTitle,
    message: processingMessage,
    runWithFeedback,
    reset: resetProcessing,
  } = useProcessingFeedback();
  const isUnlimited = form.capacity === "";
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  const eventValidationConfig = useMemo<
    ValidationConfig<EventValidationFields>
  >(
    () => ({
      rules: eventValidationRules,
      requiredFields: eventRequiredFields,
      errorMessages: eventErrorMessages,
      language,
    }),
    [language]
  );

  useEffect(() => {
    if (!showForm) return;
    setFormErrors({});
    setFormTouched({});
  }, [showForm, form.id]);

  const normalizeEventFieldValue = (
    field: keyof EventValidationFields,
    value: string
  ) => {
    if (field === "date" || field === "start") {
      return value;
    }
    return value.trim();
  };

  const clearEventFieldError = (field: keyof EventValidationFields) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const runEventFieldValidation = (
    field: keyof EventValidationFields,
    value?: string
  ) => {
    const fallbackValues = mapEventFormToValidation(form);
    const result = validateFieldUtil(
      field,
      value ?? fallbackValues[field],
      eventValidationConfig
    );
    setFormErrors((prev) => {
      if (result) {
        return { ...prev, [field]: result };
      }
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return result;
  };

  const handleEventFieldBlur = (field: keyof EventValidationFields) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    runEventFieldValidation(field);
  };

  const handleEventFieldChange = (
    field: keyof EventValidationFields,
    value: string
  ) => {
    if (formTouched[field]) {
      runEventFieldValidation(field, normalizeEventFieldValue(field, value));
    } else if (formErrors[field]) {
      clearEventFieldError(field);
    }
  };

  const touchAllEventFields = () => {
    const touchedMap = eventRequiredFields.reduce<Record<string, boolean>>(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {}
    );
    setFormTouched((prev) => ({ ...prev, ...touchedMap }));
  };

  const validateEventBeforeSave = () => {
    const validationErrors = validateFormUtil(
      mapEventFormToValidation(form),
      eventValidationConfig
    );
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      touchAllEventFields();
      scrollToFirstError(validationErrors);
      return false;
    }
    return true;
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminEvents()
      .then((data) => active && setEvents(data))
      .catch(() => active && setError(t("common.error")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    let active = true;
    setAllRegsLoading(true);
    setAllRegsError(null);
    fetchAdminEventRegistrations()
      .then((data) => {
        if (active) {
          setAllRegistrations(data);
        }
      })
      .catch(() => {
        if (active) {
          setAllRegsError(t("common.error"));
        }
      })
      .finally(() => {
        if (active) {
          setAllRegsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return events.filter(
      (e) =>
        (e.title_zh ?? "").toLowerCase().includes(term) ||
        (e.title_en ?? "").toLowerCase().includes(term) ||
        (e.description_zh ?? "").toLowerCase().includes(term) ||
        (e.description_en ?? "").toLowerCase().includes(term)
    );
  }, [events, search]);

  const openRegistrations = async (event: EventRecord) => {
    setActiveRegEvent(event);
    setRegistrationsTab("confirmed");
    setLightboxImage(null);
    setRegsLoading(true);
    setRegsError(null);
    try {
      const data = await fetchAdminEventRegistrations(event.id);
      setRegistrations(data);
    } catch {
      setRegsError(t("common.error"));
    } finally {
      setRegsLoading(false);
    }
  };

  const openImageUpload = () => {
    setShowImageUploadModal(true);
  };

  const closeImageUpload = () => {
    setShowImageUploadModal(false);
  };

  const handleImageUploadSuccess = (url: string) => {
    setUploadedImage(url);
    setForm((prev) => ({ ...prev, imageUrl: url, imageType: "upload" }));
    handleEventFieldChange("imageUrl", url);
    setImageSource("upload");
    setShowImageUploadModal(false);
  };

  const getFeedbackMessages = (action: "save" | "delete") => ({
    processingTitle: t(`admin.events.feedback.${action}.processingTitle`),
    processingMessage: t(`admin.events.feedback.${action}.processingMessage`),
    successTitle: t(`admin.events.feedback.${action}.successTitle`),
    successMessage: t(`admin.events.feedback.${action}.successMessage`),
    errorTitle: t(`admin.events.feedback.${action}.errorTitle`),
    errorMessage: t(`admin.events.feedback.${action}.errorMessage`),
  });

  const handleUnsplashSearch = async () => {
    const keyword = form.imageKeyword.trim();
    if (!keyword) {
      setUnsplashError(
        language === "zh" ? "请输入关键词后再搜索" : "Enter a keyword to search"
      );
      setUnsplashResults([]);
      return;
    }

    setUnsplashLoading(true);
    setUnsplashError(null);
    try {
      const res = await searchPhotos(keyword, 1, 12);
      setUnsplashResults(res.results);
      if (res.results.length === 0) {
        setUnsplashError(
          language === "zh" ? "未找到相关图片" : "No images found"
        );
      }
    } catch (err) {
      console.error("[AdminEvents] unsplash search", err);
      setUnsplashError(
        language === "zh"
          ? "搜索失败，请稍后再试"
          : "Search failed, please try again"
      );
    } finally {
      setUnsplashLoading(false);
    }
  };

  const handleSelectUnsplash = (photo: UnsplashPhoto) => {
    const url =
      photo.urls?.regular ??
      photo.urls?.full ??
      photo.urls?.small ??
      photo.urls?.thumb ??
      "";
    setForm((prev) => ({
      ...prev,
      imageType: "unsplash",
      imageUrl: url,
      imageKeyword: prev.imageKeyword || photo.alt_description || "",
    }));
    handleEventFieldChange("imageUrl", url);
    setImageSource("unsplash");
    setUploadedImage("");
    setSelectedUnsplashId(photo.id);
  };

  const closeRegistrations = () => {
    setActiveRegEvent(null);
    setRegistrations([]);
    setRegsError(null);
    setRegistrationsTab("confirmed");
    setLightboxImage(null);
  };

  const getPaymentMethodLabel = (paymentMethod: string | null): string => {
    if (!paymentMethod) {
      return t("admin.events.payment.none");
    }
    const key = `admin.events.payment.${paymentMethod}`;
    const translated = t(key);
    return translated !== key ? translated : paymentMethod;
  };

  const getPaymentProofUrl = useCallback(
    (reg: EventRegistrationRecord) =>
      reg.payment_proof ??
      reg.payment_proof_url ??
      reg.paymentProof ??
      reg.paymentProofUrl ??
      "",
    []
  );

  const getResolvedPaymentProofUrl = useCallback(
    (reg: EventRegistrationRecord) => {
      const rawUrl = getPaymentProofUrl(reg);
      if (!rawUrl) return "";
      if (isExternalProofUrl(rawUrl)) return rawUrl;
      return signedProofUrls[rawUrl] ?? "";
    },
    [getPaymentProofUrl, signedProofUrls]
  );

  const getPaymentStatus = useCallback(
    (reg: EventRegistrationRecord) =>
      reg.payment_status ?? reg.paymentStatus ?? null,
    []
  );

  const isPaidActiveRegEvent = useMemo(() => {
    const fee = Number(activeRegEvent?.fee ?? 0);
    const memberFee = Number(activeRegEvent?.member_fee ?? 0);
    return fee > 0 || memberFee > 0;
  }, [activeRegEvent]);

  const getRegistrationBucket = useCallback(
    (reg: EventRegistrationRecord) => {
      const status = getPaymentStatus(reg);
      if (status === "confirmed") return "confirmed" as const;
      if (status === "cancelled" || status === "expired") return "cancelled" as const;
      if (status === "pending") return "pending" as const;
      return isPaidActiveRegEvent ? ("pending" as const) : ("confirmed" as const);
    },
    [getPaymentStatus, isPaidActiveRegEvent]
  );

  const isPendingPayment = useCallback(
    (reg: EventRegistrationRecord) => {
      const proofUrl = getPaymentProofUrl(reg);
      if (!proofUrl) return false;
      const status = getPaymentStatus(reg);
      if (!status) return true;
      return status === "pending";
    },
    [getPaymentProofUrl, getPaymentStatus]
  );

  const pendingPaymentsByEvent = useMemo(() => {
    const counts: Record<string, number> = {};
    allRegistrations.forEach((reg) => {
      if (!isPendingPayment(reg)) return;
      counts[reg.event_id] = (counts[reg.event_id] ?? 0) + 1;
    });
    return counts;
  }, [allRegistrations, isPendingPayment]);

  const pendingPaymentsForActiveEvent = useMemo(() => {
    if (!activePaymentEvent) return [];
    return allRegistrations.filter(
      (reg) => reg.event_id === activePaymentEvent.id && isPendingPayment(reg)
    );
  }, [activePaymentEvent, allRegistrations, isPendingPayment]);

  const registrationsByBucket = useMemo(() => {
    const buckets: Record<
      "confirmed" | "pending" | "cancelled",
      EventRegistrationRecord[]
    > = {
      confirmed: [],
      pending: [],
      cancelled: [],
    };

    registrations.forEach((reg) => {
      buckets[getRegistrationBucket(reg)].push(reg);
    });

    return buckets;
  }, [getRegistrationBucket, registrations]);

  useEffect(() => {
    const pendingRegistrationsInModal = registrations.filter(
      (reg) => getRegistrationBucket(reg) === "pending"
    );

    const pendingTargets = [
      ...pendingPaymentsForActiveEvent,
      ...pendingRegistrationsInModal,
    ];

    if (pendingTargets.length === 0) return;
    let active = true;
    const pendingPaths = pendingTargets
      .map(getPaymentProofUrl)
      .filter(
        (path) =>
          path && !isExternalProofUrl(path) && signedProofUrls[path] == null
      );

    if (pendingPaths.length === 0) {
      return () => {
        active = false;
      };
    }

    const uniquePaths = Array.from(new Set(pendingPaths));

    uniquePaths.forEach((path) => {
      getPaymentProofSignedUrl(path)
        .then((signedUrl) => {
          if (!active || !signedUrl) return;
          setSignedProofUrls((prev) =>
            prev[path] ? prev : { ...prev, [path]: signedUrl }
          );
        })
        .catch((err) => {
          console.error("[AdminEvents] sign payment proof", err);
        });
    });

    return () => {
      active = false;
    };
  }, [
    pendingPaymentsForActiveEvent,
    registrations,
    getRegistrationBucket,
    getPaymentProofUrl,
    signedProofUrls,
  ]);

  const openPaymentReview = (event: EventRecord) => {
    setActivePaymentEvent(event);
    setLightboxImage(null);
  };

  const closePaymentReview = () => {
    setActivePaymentEvent(null);
    setLightboxImage(null);
  };

  const handlePaymentDecision = async (
    registrationId: string,
    decision: "approve" | "reject"
  ) => {
    const nextStatus = decision === "approve" ? "confirmed" : "cancelled";
    setPaymentUpdates((prev) => ({ ...prev, [registrationId]: true }));
    try {
      const updated = await updateEventRegistrationPaymentStatus({
        registrationId,
        paymentStatus: nextStatus,
      });
      setAllRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
                ...reg,
                ...updated,
              }
            : reg
        )
      );
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
                ...reg,
                ...updated,
              }
            : reg
        )
      );
    } catch (err) {
      console.error("[AdminEvents] update payment status", err);
      setError(t("common.error"));
    } finally {
      setPaymentUpdates((prev) => {
        const next = { ...prev };
        delete next[registrationId];
        return next;
      });
    }
  };

  const exportRegistrations = () => {
    if (!activeRegEvent) return;
    const exportable = registrations.filter(
      (reg) => getRegistrationBucket(reg) === "confirmed"
    );
    if (exportable.length === 0) return;
    const header = [
      language === "zh" ? "姓名" : "Name",
      language === "zh" ? "电话" : "Phone",
      "Email",
      language === "zh" ? "票数" : "Tickets",
      language === "zh" ? "付款方式" : "Payment",
      language === "zh" ? "报名日期" : "Registration Date",
    ];
    const rows = exportable.map((r) => [
      r.name,
      r.phone,
      r.email ?? "",
      r.tickets,
      getPaymentMethodLabel(r.payment_method),
      r.registration_date,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeRegEvent.title_en || activeRegEvent.title_zh}_registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!validateEventBeforeSave()) return;
    const messages = getFeedbackMessages("save");
    try {
      await runWithFeedback(messages, async () => {
        const payload: UpsertEventInput = {
          id: form.id || undefined,
          title_zh: form.titleZh,
          title_en: form.titleEn,
          description_zh: form.descZh,
          description_en: form.descEn,
          event_date: form.date,
          start_time: form.start ? `${form.start}:00` : null,
          end_time: form.end ? `${form.end}:00` : null,
          location: form.location,
          fee: Number(form.fee) || 0,
          member_fee:
            form.access === "all-welcome" && form.memberFee
              ? Number(form.memberFee)
              : null,
          capacity: form.capacity ? Number(form.capacity) : null,
          access_type: form.access,
          image_type: form.imageType,
          image_keyword:
            form.imageType === "unsplash" ? form.imageKeyword || null : null,
          image_url: form.imageUrl ? form.imageUrl : null,
          published: true,
        };
        const saved = await saveEvent(payload);
        setEvents((prev) => {
          const exists = prev.some((e) => e.id === saved.id);
          return exists
            ? prev.map((e) => (e.id === saved.id ? saved : e))
            : [saved, ...prev];
        });
        setShowForm(false);
        setForm(emptyForm);
        setImageSource(emptyForm.imageType);
        setUploadedImage("");
      });
    } catch {
      setError(t("common.error"));
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ type: "delete", targetId: id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog) return;
    const { targetId } = confirmDialog;
    setConfirmDialog(null);
    const messages = getFeedbackMessages("delete");
    try {
      await runWithFeedback(messages, async () => {
        await deleteEvent(targetId);
        setEvents((prev) => prev.filter((e) => e.id !== targetId));
      });
    } catch {
      setError(t("common.error"));
    }
  };

  const confirmCopy = confirmDialog
    ? {
        title: t("admin.events.confirm.delete.title"),
        message: t("admin.events.confirm.delete.message"),
      }
    : { title: "", message: "" };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      <ProcessingOverlay
        state={processingState}
        title={processingTitle}
        message={processingMessage}
        onComplete={resetProcessing}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-[#2B5F9E] hover:text-[#6BA868] transition-colors mb-4"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("admin.backToDashboard")}</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#2B5F9E] text-2xl">
                {t("admin.events.title")}
              </h1>
            </div>
            <motion.button
              onClick={() => {
                setForm(emptyForm);
                setImageSource(emptyForm.imageType);
                setUploadedImage("");
                setUnsplashResults([]);
                setUnsplashError(null);
                setSelectedUnsplashId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>{t("admin.events.add")}</span>
            </motion.button>
          </div>
        </motion.div>

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {loading && <p className="text-gray-600 mb-3">{t("common.loading")}</p>}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="flex-1 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              placeholder={t("admin.events.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Event list */}
        <div className="space-y-4">
          {filtered.map((event) => {
            const pendingCount = pendingPaymentsByEvent[event.id] ?? 0;
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl text-[#2B5F9E]">
                        {pickLocalized(
                          event.title_zh,
                          event.title_en,
                          language
                        )}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          event.access_type === "members-only"
                            ? "bg-[#EB8C3A] text-white"
                            : "bg-[#7BA3C7] text-white"
                        }`}
                      >
                        {event.access_type === "members-only"
                          ? t("events.memberOnly")
                          : t("events.allWelcome")}
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {pickLocalized(
                        event.description_zh,
                        event.description_en,
                        language
                      )}
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#EB8C3A]" />
                        <span>
                          {event.event_date}{" "}
                          {event.start_time?.slice(0, 5) ?? ""}{" "}
                          {event.end_time
                            ? `- ${event.end_time.slice(0, 5)}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6BA868]" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#2B5F9E]" />
                        <span>
                          {event.fee === 0 ? t("common.free") : `$${event.fee}`}
                          {event.member_fee != null
                            ? ` (${t("events.memberFee")}: $${event.member_fee})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 items-stretch lg:self-center">
                    <button
                      onClick={() => openRegistrations(event)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors min-w-[140px]"
                    >
                      <Users className="w-4 h-4" />
                      <span>
                        {language === "zh" ? "查看报名" : "View registrations"}
                      </span>
                    </button>
                    <button
                      onClick={() => openPaymentReview(event)}
                      disabled={pendingCount === 0}
                      className="glass-btn glass-btn-warning min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={t("admin.events.reviewPayments")}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {t("admin.events.reviewPayments")}
                      </span>
                      <span className="glass-btn-badge">{pendingCount}</span>
                    </button>
                    <button
                      onClick={() => {
                        setForm(toForm(event));
                        setImageSource(
                          (event.image_type as "unsplash" | "upload") ||
                            (event.image_url ? "upload" : "unsplash")
                        );
                        setUploadedImage(event.image_url ?? "");
                        setUnsplashResults([]);
                        setUnsplashError(null);
                        setSelectedUnsplashId(null);
                        setShowForm(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors min-w-[140px]"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("admin.events.edit")}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-w-[140px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t("common.delete")}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">
              {language === "zh" ? "没有找到活动" : "No events found"}
            </p>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <>
              {typeof document !== "undefined" &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) setShowForm(false);
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">
                            {form.id
                              ? t("admin.events.edit")
                              : t("admin.events.add")}
                          </p>
                          <h2 className="text-xl sm:text-2xl font-semibold">
                            {language === "zh"
                              ? "活动信息填写"
                              : "Event Content & Settings"}
                          </h2>
                        </div>
                        <button
                          onClick={() => setShowForm(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.titleZh")}
                            </label>
                            <input
                              id="titleZh"
                              className={`${inputBaseClass}`}
                              value={form.titleZh}
                              onChange={(e) => {
                                setForm({ ...form, titleZh: e.target.value });
                                handleEventFieldChange(
                                  "titleZh",
                                  e.target.value
                                );
                              }}
                              onBlur={() => handleEventFieldBlur("titleZh")}
                            />
                            {formTouched.titleZh && formErrors.titleZh && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.titleZh,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.titleEn")}
                            </label>
                            <input
                              id="titleEn"
                              className={`${inputBaseClass}`}
                              value={form.titleEn}
                              onChange={(e) => {
                                setForm({ ...form, titleEn: e.target.value });
                                handleEventFieldChange(
                                  "titleEn",
                                  e.target.value
                                );
                              }}
                              onBlur={() => handleEventFieldBlur("titleEn")}
                            />
                            {formTouched.titleEn && formErrors.titleEn && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.titleEn,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              中文简介
                            </label>
                            <textarea
                              id="descZh"
                              className="w-full border rounded-xl px-4 py-3 shadow-sm"
                              value={form.descZh}
                              onChange={(e) => {
                                setForm({ ...form, descZh: e.target.value });
                                handleEventFieldChange(
                                  "descZh",
                                  e.target.value
                                );
                              }}
                              onBlur={() => handleEventFieldBlur("descZh")}
                            />
                            {formTouched.descZh && formErrors.descZh && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.descZh,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              英文简介
                            </label>
                            <textarea
                              id="descEn"
                              className="w-full border rounded-xl px-4 py-3 shadow-sm"
                              value={form.descEn}
                              onChange={(e) => {
                                setForm({ ...form, descEn: e.target.value });
                                handleEventFieldChange(
                                  "descEn",
                                  e.target.value
                                );
                              }}
                              onBlur={() => handleEventFieldBlur("descEn")}
                            />
                            {formTouched.descEn && formErrors.descEn && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.descEn,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cover Image (Unsplash / Upload) */}
                        <div
                          id="imageUrl"
                          className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50"
                        >
                          <h3 className="text-gray-700 mb-3">
                            {t("admin.news.form.coverImageSettings")}
                          </h3>

                          <div className="flex gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() => {
                                setImageSource("upload");
                                setForm((prev) => ({
                                  ...prev,
                                  imageType: "upload",
                                }));
                              }}
                              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                imageSource === "upload"
                                  ? "bg-[#2B5F9E] text-white shadow-md"
                                  : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                              }`}
                            >
                              {t("admin.news.form.useUpload")}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setImageSource("unsplash");
                                setUnsplashResults([]);
                                setUnsplashError(null);
                                setSelectedUnsplashId(null);
                                setForm((prev) => ({
                                  ...prev,
                                  imageType: "unsplash",
                                }));
                              }}
                              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                imageSource === "unsplash"
                                  ? "bg-[#2B5F9E] text-white shadow-md"
                                  : "bg-white text-gray-600 border border-gray-300 hover:border-[#2B5F9E]"
                              }`}
                            >
                              {t("admin.news.form.useUnsplash")}
                            </button>
                          </div>

                          {imageSource === "unsplash" && (
                            <div className="space-y-3">
                              <label className="block text-gray-700">
                                {t("admin.news.form.unsplashKeywords")}
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                                  placeholder={t(
                                    "admin.news.form.unsplashKeywordsPlaceholder"
                                  )}
                                  value={form.imageKeyword}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      imageKeyword: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      void handleUnsplashSearch();
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={handleUnsplashSearch}
                                  className="px-4 py-2.5 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors min-w-[120px]"
                                >
                                  {language === "zh" ? "搜索图片" : "Search"}
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                {t("admin.news.form.unsplashHelp")}
                              </p>
                              {unsplashError && (
                                <p
                                  className="text-xs text-red-600"
                                  role="alert"
                                >
                                  {unsplashError}
                                </p>
                              )}
                              {unsplashLoading && (
                                <p className="text-sm text-gray-600">
                                  {language === "zh"
                                    ? "搜索中..."
                                    : "Searching..."}
                                </p>
                              )}
                              {form.imageUrl && (
                                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>
                                      {language === "zh"
                                        ? "已选图片预览"
                                        : "Selected image"}
                                    </span>
                                  </div>
                                  <img
                                    src={form.imageUrl}
                                    alt="Unsplash selection"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                </div>
                              )}
                              {unsplashResults.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {unsplashResults.map((photo) => {
                                    const selected =
                                      selectedUnsplashId === photo.id;
                                    return (
                                      <button
                                        type="button"
                                        key={photo.id}
                                        onClick={() =>
                                          handleSelectUnsplash(photo)
                                        }
                                        className={`relative group overflow-hidden rounded-lg border ${
                                          selected
                                            ? "border-[#2B5F9E] ring-2 ring-[#2B5F9E]"
                                            : "border-gray-200 hover:border-[#2B5F9E]"
                                        }`}
                                      >
                                        <img
                                          src={
                                            photo.urls?.small ??
                                            photo.urls?.thumb ??
                                            photo.urls?.regular ??
                                            ""
                                          }
                                          alt={
                                            photo.alt_description ??
                                            photo.description ??
                                            ""
                                          }
                                          className="w-full h-36 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                                          {selected
                                            ? language === "zh"
                                              ? "已选择"
                                              : "Selected"
                                            : language === "zh"
                                              ? "使用"
                                              : "Use"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {imageSource === "upload" && (
                            <div>
                              <label className="block text-gray-700 mb-2">
                                {language === "zh"
                                  ? "上传封面图片"
                                  : "Upload Cover Image"}
                              </label>
                              <button
                                type="button"
                                onClick={openImageUpload}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
                              >
                                <Upload className="w-5 h-5" />
                                <span>
                                  {t("admin.news.form.uploadImageBtn")}
                                </span>
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                {t("admin.news.form.uploadHelp")}
                              </p>

                              {(uploadedImage || form.imageUrl) && (
                                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>
                                      {t("admin.news.form.imagePreview")}
                                    </span>
                                  </div>
                                  <img
                                    src={uploadedImage || form.imageUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          {formTouched.imageUrl && formErrors.imageUrl && (
                            <p
                              className="text-xs text-red-600 mt-2"
                              role="alert"
                            >
                              {getErrorMessage(
                                formErrors.imageUrl,
                                eventValidationConfig.errorMessages,
                                language
                              )}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.date")}
                            </label>
                            <input
                              id="date"
                              type="date"
                              className={`${inputBaseClass} [::-webkit-calendar-picker-indicator]:opacity-70`}
                              value={form.date}
                              onChange={(e) => {
                                setForm({ ...form, date: e.target.value });
                                handleEventFieldChange("date", e.target.value);
                              }}
                              onBlur={() => handleEventFieldBlur("date")}
                            />
                            {formTouched.date && formErrors.date && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.date,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.time")}
                            </label>
                            <div className="flex gap-2">
                              <input
                                id="start"
                                type="time"
                                className={`${inputBaseClass} [::-webkit-calendar-picker-indicator]:opacity-70`}
                                value={form.start}
                                onChange={(e) => {
                                  setForm({ ...form, start: e.target.value });
                                  handleEventFieldChange(
                                    "start",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => handleEventFieldBlur("start")}
                              />
                              <input
                                type="time"
                                className={`${inputBaseClass} [::-webkit-calendar-picker-indicator]:opacity-70`}
                                value={form.end}
                                onChange={(e) =>
                                  setForm({ ...form, end: e.target.value })
                                }
                              />
                            </div>
                            {formTouched.start && formErrors.start && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.start,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.capacity")}
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="number"
                                min={0}
                                className={`${inputBaseClass} flex-1 min-w-[160px]`}
                                value={form.capacity}
                                onChange={(e) =>
                                  setForm({ ...form, capacity: e.target.value })
                                }
                                disabled={isUnlimited}
                                placeholder={t("admin.events.form.unlimited")}
                              />
                              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isUnlimited}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      capacity: e.target.checked ? "" : "0",
                                    })
                                  }
                                />
                                {t("admin.events.form.unlimited")}
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.location")}
                            </label>
                            <input
                              id="location"
                              className="w-full border rounded-xl px-4 py-3 shadow-sm"
                              value={form.location}
                              onChange={(e) => {
                                setForm({ ...form, location: e.target.value });
                                handleEventFieldChange(
                                  "location",
                                  e.target.value
                                );
                              }}
                              onBlur={() => handleEventFieldBlur("location")}
                            />
                            {formTouched.location && formErrors.location && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.location,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.accessType")}
                            </label>
                            <div className="flex gap-3 mt-2 text-sm text-gray-700">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={form.access === "all-welcome"}
                                  onChange={() =>
                                    setForm({ ...form, access: "all-welcome" })
                                  }
                                />
                                {t("admin.events.form.allWelcome")}
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={form.access === "members-only"}
                                  onChange={() =>
                                    setForm({
                                      ...form,
                                      access: "members-only",
                                      memberFee: "",
                                    })
                                  }
                                />
                                {t("admin.events.form.membersOnly")}
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-sm text-gray-700">
                              {t("admin.events.form.nonMemberPrice")}
                            </label>
                            <input
                              id="fee"
                              type="number"
                              className={`${inputBaseClass}`}
                              value={form.fee}
                              onChange={(e) => {
                                setForm({ ...form, fee: e.target.value });
                                handleEventFieldChange("fee", e.target.value);
                              }}
                              onBlur={() => handleEventFieldBlur("fee")}
                            />
                            {formTouched.fee && formErrors.fee && (
                              <p
                                className="text-xs text-red-600 mt-1"
                                role="alert"
                              >
                                {getErrorMessage(
                                  formErrors.fee,
                                  eventValidationConfig.errorMessages,
                                  language
                                )}
                              </p>
                            )}
                          </div>
                          {form.access === "all-welcome" && (
                            <div>
                              <label className="text-sm text-gray-700">
                                {t("admin.events.form.memberPrice")}
                              </label>
                              <input
                                type="number"
                                className={`${inputBaseClass}`}
                                value={form.memberFee}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    memberFee: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                          <button
                            onClick={() => setShowForm(false)}
                            type="button"
                            className="w-full px-4 py-3 border rounded-xl shadow-sm hover:bg-gray-50"
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            onClick={handleSave}
                            type="button"
                            className="w-full px-4 py-3 bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            {form.id
                              ? t("admin.events.save")
                              : t("admin.events.add")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}
            </>
          )}
        </AnimatePresence>

        {/* Image Upload Modal */}
        {showImageUploadModal && (
          <ImageUploadModal
            onClose={closeImageUpload}
            onSuccess={handleImageUploadSuccess}
          />
        )}

        {/* Payment Review Modal */}
        <AnimatePresence>
          {activePaymentEvent && (
            <>
              {typeof document !== "undefined" &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) closePaymentReview();
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        scale: 0.9,
                        opacity: 0,
                        transition: { duration: 0.3, ease: "easeIn" },
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                      onMouseDown={(e) => e.stopPropagation()}
                      role="dialog"
                      aria-modal="true"
                    >
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-start justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-semibold">
                            {t("admin.events.reviewPayments.title")}
                          </h2>
                          <p className="text-base opacity-90">
                            {pickLocalized(
                              activePaymentEvent.title_zh,
                              activePaymentEvent.title_en,
                              language
                            )}
                          </p>
                          <p className="text-sm opacity-80">
                            {t("admin.events.reviewPayments.pending")}:{" "}
                            {pendingPaymentsForActiveEvent.length}
                          </p>
                        </div>
                        <button
                          onClick={closePaymentReview}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          aria-label={t("admin.events.reviewPayments.close")}
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto">
                        {allRegsLoading && (
                          <p className="text-gray-600">{t("common.loading")}</p>
                        )}
                        {allRegsError && (
                          <p className="text-red-600" role="alert">
                            {allRegsError}
                          </p>
                        )}
                        {!allRegsLoading &&
                          !allRegsError &&
                          pendingPaymentsForActiveEvent.length === 0 && (
                            <p className="text-center text-gray-500">
                              {t("admin.events.reviewPayments.noPending")}
                            </p>
                          )}
                        {!allRegsLoading &&
                          !allRegsError &&
                          pendingPaymentsForActiveEvent.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {pendingPaymentsForActiveEvent.map(
                                (reg, index) => {
                                  const proofUrl =
                                    getResolvedPaymentProofUrl(reg);
                                  const registrationDate =
                                    reg.registration_date || reg.created_at;
                                  const isUpdating = Boolean(
                                    paymentUpdates[reg.id]
                                  );
                                  const hasProofUrl = Boolean(proofUrl);
                                  return (
                                    <motion.div
                                      key={reg.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                        delay: Math.min(index * 0.05, 0.05),
                                      }}
                                      className="border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition-shadow"
                                    >
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-[#2B5F9E]">
                                          {reg.name}
                                        </h3>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                          {t(
                                            "admin.events.reviewPayments.pending"
                                          )}
                                        </span>
                                      </div>

                                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                                        <p>
                                          {t(
                                            "admin.events.registrations.phone"
                                          )}
                                          : {reg.phone}
                                        </p>
                                        <p>
                                          {t(
                                            "admin.events.registrations.email"
                                          )}
                                          : {reg.email || "-"}
                                        </p>
                                        <p>
                                          {t(
                                            "admin.events.registrations.tickets"
                                          )}
                                          : {reg.tickets}
                                        </p>
                                        <p>
                                          {t(
                                            "admin.events.registrations.payment"
                                          )}
                                          :{" "}
                                          {getPaymentMethodLabel(
                                            reg.payment_method
                                          )}
                                        </p>
                                        <p>
                                          {t(
                                            "admin.events.registrations.registrationDate"
                                          )}
                                          : {registrationDate}
                                        </p>
                                      </div>

                                      <div className="mt-4">
                                        <p className="text-sm text-gray-700 mb-2">
                                          {t(
                                            "admin.events.reviewPayments.paymentProof"
                                          )}
                                          :
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!proofUrl) return;
                                            setLightboxImage({
                                              url: proofUrl,
                                              title:
                                                language === "zh"
                                                  ? "支付凭证"
                                                  : "Payment proof",
                                              subtitle: reg.name,
                                            });
                                          }}
                                          disabled={!hasProofUrl}
                                          className={`group relative w-full ${
                                            hasProofUrl
                                              ? ""
                                              : "cursor-not-allowed"
                                          }`}
                                        >
                                          {hasProofUrl ? (
                                            <>
                                              <img
                                                src={proofUrl}
                                                alt={
                                                  language === "zh"
                                                    ? `${reg.name}的支付凭证`
                                                    : `Payment proof from ${reg.name}`
                                                }
                                                className="w-full h-48 object-cover rounded-lg"
                                                loading="lazy"
                                              />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-white" />
                                              </div>
                                            </>
                                          ) : (
                                            <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                              {t("common.loading")}
                                            </div>
                                          )}
                                        </button>
                                        <p className="mt-2 text-xs text-gray-500 text-center">
                                          {t(
                                            "admin.events.reviewPayments.clickToEnlarge"
                                          )}
                                        </p>
                                      </div>

                                      <div className="mt-4 flex gap-2">
                                        <button
                                          type="button"
                                          disabled={isUpdating}
                                          onClick={() =>
                                            handlePaymentDecision(
                                              reg.id,
                                              "approve"
                                            )
                                          }
                                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          <span>
                                            {t(
                                              "admin.events.reviewPayments.approve"
                                            )}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={isUpdating}
                                          onClick={() =>
                                            handlePaymentDecision(
                                              reg.id,
                                              "reject"
                                            )
                                          }
                                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                          <XCircle className="w-4 h-4" />
                                          <span>
                                            {t(
                                              "admin.events.reviewPayments.reject"
                                            )}
                                          </span>
                                        </button>
                                      </div>
                                    </motion.div>
                                  );
                                }
                              )}
                            </div>
                          )}
                      </div>

                      <div className="bg-gray-50 p-6">
                        <button
                          onClick={closePaymentReview}
                          type="button"
                          className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {t("admin.events.reviewPayments.close")}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lightboxImage && (
            <>
              {typeof document !== "undefined" &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]"
                    onMouseDown={() => setLightboxImage(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
                      onMouseDown={(e) => e.stopPropagation()}
                      role="dialog"
                      aria-modal="true"
                    >
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold">
                            {lightboxImage.title}
                          </h3>
                          {lightboxImage.subtitle && (
                            <p className="text-sm opacity-90">
                              {lightboxImage.subtitle}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightboxImage(null)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          aria-label={t("admin.events.reviewPayments.close")}
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex-1 bg-black/5 p-4 flex items-center justify-center">
                        <img
                          src={lightboxImage.url}
                          alt={
                            language === "zh"
                              ? "支付凭证大图"
                              : "Payment proof"
                          }
                          className="max-w-full max-h-[calc(90vh-140px)] object-contain rounded-lg bg-white"
                        />
                      </div>

                      <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-2">
                        <a
                          href={lightboxImage.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm"
                        >
                          {language === "zh" ? "在新窗口打开" : "Open in new tab"}
                        </a>
                        <button
                          type="button"
                          onClick={() => setLightboxImage(null)}
                          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors text-sm"
                        >
                          {t("admin.events.reviewPayments.close")}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}
            </>
          )}
        </AnimatePresence>

        {/* Registrations Modal */}
        <AnimatePresence>
          {activeRegEvent && (
            <>
              {typeof document !== "undefined" &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) closeRegistrations();
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">
                            {language === "zh" ? "报名信息" : "Registrations"}
                          </p>
                          <h2 className="text-xl sm:text-2xl font-semibold">
                            {pickLocalized(
                              activeRegEvent.title_zh,
                              activeRegEvent.title_en,
                              language
                            )}
                          </h2>
                        </div>
                        <button
                          onClick={closeRegistrations}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-sm text-gray-700">
                            {language === "zh" ? (
                              <>
                                已通过：{registrationsByBucket.confirmed.length}
                                {" · "}待审核：{registrationsByBucket.pending.length}
                                {" · "}已取消：{registrationsByBucket.cancelled.length}
                              </>
                            ) : (
                              <>
                                Confirmed: {registrationsByBucket.confirmed.length}
                                {" · "}Pending: {registrationsByBucket.pending.length}
                                {" · "}Cancelled: {registrationsByBucket.cancelled.length}
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={exportRegistrations}
                              disabled={registrationsByBucket.confirmed.length === 0}
                              className="px-4 py-2 rounded-lg bg-[#2B5F9E] text-white hover:bg-[#234a7e] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {language === "zh"
                                ? "导出已通过（CSV）"
                                : "Export confirmed (CSV)"}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setRegistrationsTab("confirmed")}
                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                              registrationsTab === "confirmed"
                                ? "bg-[#2B5F9E] border-[#2B5F9E] text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {language === "zh"
                              ? `已通过 (${registrationsByBucket.confirmed.length})`
                              : `Confirmed (${registrationsByBucket.confirmed.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegistrationsTab("pending")}
                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                              registrationsTab === "pending"
                                ? "bg-[#EB8C3A] border-[#EB8C3A] text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {language === "zh"
                              ? `待审核 (${registrationsByBucket.pending.length})`
                              : `Pending (${registrationsByBucket.pending.length})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegistrationsTab("cancelled")}
                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                              registrationsTab === "cancelled"
                                ? "bg-gray-700 border-gray-700 text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {language === "zh"
                              ? `已取消 (${registrationsByBucket.cancelled.length})`
                              : `Cancelled (${registrationsByBucket.cancelled.length})`}
                          </button>
                        </div>

                        {regsLoading && (
                          <p className="text-gray-600">
                            {language === "zh" ? "加载中..." : "Loading..."}
                          </p>
                        )}
                        {regsError && (
                          <p className="text-red-600" role="alert">
                            {regsError}
                          </p>
                        )}
                        {!regsLoading &&
                          !regsError &&
                          registrations.length === 0 && (
                            <p className="text-gray-500">
                              {language === "zh"
                                ? "暂无报名"
                                : "No registrations yet"}
                            </p>
                          )}
                        {!regsLoading &&
                          !regsError &&
                          registrations.length > 0 &&
                          registrationsByBucket[registrationsTab].length ===
                            0 && (
                            <p className="text-gray-500">
                              {registrationsTab === "confirmed"
                                ? language === "zh"
                                  ? "暂无已通过报名"
                                  : "No confirmed registrations"
                                : registrationsTab === "pending"
                                  ? language === "zh"
                                    ? "暂无待审核报名"
                                    : "No pending registrations"
                                  : language === "zh"
                                    ? "暂无已取消/过期报名"
                                    : "No cancelled registrations"}
                            </p>
                          )}

                        {!regsLoading &&
                          !regsError &&
                          registrationsByBucket[registrationsTab].length >
                            0 &&
                          registrationsTab === "pending" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {registrationsByBucket.pending.map((reg) => {
                                const proofUrl =
                                  getResolvedPaymentProofUrl(reg);
                                const registrationDate =
                                  reg.registration_date || reg.created_at;
                                const isUpdating = Boolean(
                                  paymentUpdates[reg.id]
                                );
                                const hasProofUrl = Boolean(proofUrl);
                                return (
                                  <div
                                    key={reg.id}
                                    className="border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-semibold text-[#2B5F9E]">
                                        {reg.name}
                                      </h3>
                                      <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                        {language === "zh"
                                          ? "待审核"
                                          : "Pending"}
                                      </span>
                                    </div>

                                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                                      <p>
                                        {language === "zh"
                                          ? "电话"
                                          : "Phone"}
                                        : {reg.phone}
                                      </p>
                                      <p>
                                        Email: {reg.email || "-"}
                                      </p>
                                      <p>
                                        {language === "zh"
                                          ? "票数"
                                          : "Tickets"}
                                        : {reg.tickets}
                                      </p>
                                      <p>
                                        {language === "zh"
                                          ? "付款方式"
                                          : "Payment"}
                                        :{" "}
                                        {getPaymentMethodLabel(
                                          reg.payment_method
                                        )}
                                      </p>
                                      <p>
                                        {language === "zh"
                                          ? "报名日期"
                                          : "Date"}
                                        : {registrationDate}
                                      </p>
                                    </div>

                                    <div className="mt-4">
                                      <p className="text-sm text-gray-700 mb-2">
                                        {language === "zh"
                                          ? "收据/凭证"
                                          : "Receipt / proof"}
                                        :
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!proofUrl) return;
                                          setLightboxImage({
                                            url: proofUrl,
                                            title:
                                              language === "zh"
                                                ? "支付凭证"
                                                : "Payment proof",
                                            subtitle: reg.name,
                                          });
                                        }}
                                        disabled={!hasProofUrl}
                                        className={`group relative w-full ${
                                          hasProofUrl
                                            ? ""
                                            : "cursor-not-allowed"
                                        }`}
                                      >
                                        {hasProofUrl ? (
                                          <>
                                            <img
                                              src={proofUrl}
                                              alt={
                                                language === "zh"
                                                  ? `${reg.name}的支付凭证`
                                                  : `Payment proof from ${reg.name}`
                                              }
                                              className="w-full h-40 object-cover rounded-lg"
                                              loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                              <ImageIcon className="w-8 h-8 text-white" />
                                            </div>
                                          </>
                                        ) : (
                                          <div className="w-full h-40 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                            {language === "zh"
                                              ? "未上传"
                                              : "Not uploaded"}
                                          </div>
                                        )}
                                      </button>
                                      <p className="mt-2 text-xs text-gray-500 text-center">
                                        {language === "zh"
                                          ? "点击图片放大查看"
                                          : "Click image to enlarge"}
                                      </p>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() =>
                                          handlePaymentDecision(
                                            reg.id,
                                            "approve"
                                          )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>
                                          {language === "zh"
                                            ? "通过"
                                            : "Approve"}
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() =>
                                          handlePaymentDecision(
                                            reg.id,
                                            "reject"
                                          )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        <span>
                                          {language === "zh"
                                            ? "拒绝"
                                            : "Reject"}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        {!regsLoading &&
                          !regsError &&
                          registrationsByBucket[registrationsTab].length >
                            0 &&
                          registrationsTab !== "pending" && (
                            <div className="space-y-2">
                              {registrationsByBucket[registrationsTab].map(
                                (reg) => (
                                  <div
                                    key={reg.id}
                                    className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                                  >
                                    <div>
                                      <p className="text-[#2B5F9E] font-medium">
                                        {reg.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {language === "zh"
                                          ? "电话"
                                          : "Phone"}
                                        : {reg.phone}
                                        {reg.email
                                          ? ` · Email: ${reg.email}`
                                          : ""}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {language === "zh"
                                          ? "报名日期"
                                          : "Date"}
                                        : {reg.registration_date}
                                      </p>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      <p>
                                        {language === "zh"
                                          ? "票数"
                                          : "Tickets"}
                                        : {reg.tickets}
                                      </p>
                                      <p>
                                        {language === "zh"
                                          ? "付款方式"
                                          : "Payment"}
                                        :{" "}
                                        {getPaymentMethodLabel(
                                          reg.payment_method
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}
            </>
          )}
        </AnimatePresence>

        <AdminConfirmDialog
          open={Boolean(confirmDialog)}
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={t("admin.members.confirm.confirm")}
          cancelLabel={t("admin.members.confirm.cancel")}
          tone="danger"
          onCancel={() => setConfirmDialog(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
