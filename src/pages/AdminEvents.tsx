import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  X,
  Save,
  Upload,
  ArrowLeft,
  Users,
  Download,
} from "lucide-react";
import { ImageCropper } from "../components/ImageCropper";
import * as XLSX from "xlsx";
import {
  deleteEvent,
  fetchAdminEvents,
  fetchAdminEventRegistrations,
  saveEvent,
  type EventRecord,
  type EventRegistrationRecord,
  type UpsertEventInput,
} from "../lib/supabaseApi";
import { pickLocalized } from "../lib/supabaseHelpers";

type EventFormState = {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  fee: number;
  memberFee: number | "";
  capacity: number | "";
  imageType: "unsplash" | "upload";
  imageKeyword: string;
  imageUrl: string;
  accessType: "members-only" | "all-welcome";
};

const defaultDate = new Date().toISOString().split("T")[0];

function normalizeTime(value: string) {
  if (!value) return "";
  if (value.length === 5) return `${value}:00`;
  return value;
}

function sortEvents(list: EventRecord[]) {
  return [...list].sort((a, b) => {
    if (a.event_date === b.event_date) {
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    }
    return a.event_date.localeCompare(b.event_date);
  });
}

function formatTimeRange(start?: string | null, end?: string | null) {
  const startShort = start ? start.slice(0, 5) : "";
  const endShort = end ? end.slice(0, 5) : "";
  if (startShort && endShort) return `${startShort} - ${endShort}`;
  if (startShort) return startShort;
  return "";
}

function formatEventDate(
  event: EventRecord,
  language: "zh" | "en" | string = "en"
) {
  if (!event.event_date) return "";
  const datePart = new Date(event.event_date).toLocaleDateString(
    language === "zh" ? "zh-CN" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const timePart = formatTimeRange(event.start_time, event.end_time);
  return timePart ? `${datePart} ${timePart}` : datePart;
}

function eventToFormState(event: EventRecord | null): EventFormState {
  if (!event) {
    return {
      id: "",
      title: { zh: "", en: "" },
      description: { zh: "", en: "" },
      date: defaultDate,
      startTime: "",
      endTime: "",
      location: "",
      fee: 0,
      memberFee: "",
      capacity: 50,
      imageType: "unsplash",
      imageKeyword: "",
      imageUrl: "",
      accessType: "all-welcome",
    };
  }

  return {
    id: event.id,
    title: { zh: event.title_zh ?? "", en: event.title_en ?? "" },
    description: {
      zh: event.description_zh ?? "",
      en: event.description_en ?? "",
    },
    date: event.event_date ?? defaultDate,
    startTime: event.start_time ? event.start_time.slice(0, 5) : "",
    endTime: event.end_time ? event.end_time.slice(0, 5) : "",
    location: event.location ?? "",
    fee: Number(event.fee ?? 0),
    memberFee:
      event.access_type === "all-welcome" && event.member_fee !== null
        ? Number(event.member_fee)
        : "",
    capacity: event.capacity ?? "",
    imageType: (event.image_type as "unsplash" | "upload") ?? "unsplash",
    imageKeyword: event.image_keyword ?? "",
    imageUrl: event.image_url ?? "",
    accessType: (event.access_type as "members-only" | "all-welcome") ??
      "all-welcome",
  };
}

export function AdminEvents() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registrations, setRegistrations] = useState<
    EventRegistrationRecord[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminEvents()
      .then((data) => {
        if (active) {
          setEvents(sortEvents(data));
        }
      })
      .catch(() => {
        if (active) setError(t("common.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    if (!viewingRegistrations) {
      setRegistrations([]);
      return;
    }

    let active = true;
    setRegistrationsLoading(true);
    fetchAdminEventRegistrations(viewingRegistrations)
      .then((data) => {
        if (active) setRegistrations(data);
      })
      .catch(() => {
        if (active) setError(t("common.error"));
      })
      .finally(() => {
        if (active) setRegistrationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [viewingRegistrations, t]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.filter((event) => {
      const title = pickLocalized(event.title_zh, event.title_en, language)
        ?.toLowerCase()
        .trim();
      const desc = pickLocalized(
        event.description_zh,
        event.description_en,
        language
      )
        ?.toLowerCase()
        .trim();
      const location = event.location?.toLowerCase() ?? "";
      return (
        title?.includes(term) ||
        desc?.includes(term) ||
        location.includes(term)
      );
    });
  }, [events, searchTerm, language]);

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event: EventRecord) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.events.deleteConfirm"))) return;
    setError(null);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccess(language === "zh" ? "已删除" : "Deleted");
    } catch {
      setError(t("common.error"));
    }
  };

  const handleSave = async (form: EventFormState) => {
    setSaving(true);
    setError(null);
    try {
      const payload: UpsertEventInput = {
        id: form.id || undefined,
        title_zh: form.title.zh,
        title_en: form.title.en,
        description_zh: form.description.zh,
        description_en: form.description.en,
        event_date: form.date,
        start_time: form.startTime ? normalizeTime(form.startTime) : null,
        end_time: form.endTime ? normalizeTime(form.endTime) : null,
        location: form.location,
        fee: Number(form.fee) || 0,
        member_fee:
          form.accessType === "all-welcome" && form.memberFee !== ""
            ? Number(form.memberFee)
            : null,
        capacity: form.capacity === "" ? null : Number(form.capacity),
        access_type: form.accessType,
        image_type: form.imageType,
        image_keyword:
          form.imageType === "unsplash" ? form.imageKeyword || null : null,
        image_url: form.imageType === "upload" ? form.imageUrl || null : null,
        published: true,
      };

      const saved = await saveEvent(payload);

      setEvents((prev) => {
        const exists = prev.some((e) => e.id === saved.id);
        if (exists) {
          return sortEvents(prev.map((e) => (e.id === saved.id ? saved : e)));
        }
        return sortEvents([saved, ...prev]);
      });

      setSuccess(language === "zh" ? "活动已保存" : "Event saved");
      setShowForm(false);
      setEditingEvent(null);
    } catch {
      setError(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    setViewingRegistrations(eventId);
  };

  const handleExportRegistrations = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const eventRegs = registrations.filter((r) => r.event_id === eventId);
    if (eventRegs.length === 0) return;

    const headers = [
      t("admin.events.registrations.name"),
      t("admin.events.registrations.phone"),
      t("admin.events.registrations.email"),
      t("admin.events.registrations.tickets"),
      t("admin.events.registrations.payment"),
      t("admin.events.registrations.registrationDate"),
    ];

    const data = eventRegs.map((reg) => [
      reg.name,
      reg.phone,
      reg.email ?? "",
      reg.tickets,
      reg.payment_method
        ? t(`admin.events.payment.${reg.payment_method}`)
        : "",
      reg.registration_date,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "2B5F9E" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "left", vertical: "center" },
      } as never;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      language === "zh" ? "报名信息" : "Registrations"
    );

    const filename = `${pickLocalized(
      event.title_zh,
      event.title_en,
      language
    )}_${language === "zh" ? "报名信息" : "Registrations"}_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/admin/dashboard")}
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
              <h1 className="text-[#2B5F9E]">{t("admin.events.title")}</h1>
            </div>
            <motion.button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>{t("admin.events.add")}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.events.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
            />
          </div>
        </motion.div>

        {loading && <p className="text-gray-600 mb-3">{t("common.loading")}</p>}
        {error && (
          <p className="text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 mb-3" role="status">
            {success}
          </p>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-[#2B5F9E] text-lg sm:text-xl">
                      {pickLocalized(event.title_zh, event.title_en, language)}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
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

                  <p className="text-gray-600 mb-4">
                    {pickLocalized(
                      event.description_zh,
                      event.description_en,
                      language
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{t("events.date")}:</span>
                      <div className="text-gray-900">
                        {formatEventDate(event, language)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t("events.location")}:
                      </span>
                      <div className="text-gray-900">{event.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t("events.fee")}:</span>
                      <div className="text-gray-900">
                        {event.fee === 0
                          ? t("common.free")
                          : `$${event.fee}`}
                        {event.member_fee !== null &&
                          event.access_type === "all-welcome" && (
                            <span className="text-[#6BA868] ml-2">
                              ({t("events.memberFee")}: ${event.member_fee})
                            </span>
                          )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t("events.capacity")}:
                      </span>
                      <div className="text-gray-900">
                        {event.capacity ?? t("admin.events.unlimited")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <button
                    onClick={() => handleViewRegistrations(event.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex-1 lg:flex-initial"
                    title={t("admin.events.viewRegistrations")}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("admin.events.viewRegistrations")}
                    </span>
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex-1 lg:flex-initial"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("admin.events.edit")}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1 lg:flex-initial"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("admin.events.delete")}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              {language === "zh" ? "没有找到活动" : "No events found"}
            </div>
          )}
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <EventFormModal
            event={editingEvent}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
            saving={saving}
          />
        )}

        {/* Registrations Modal */}
        {viewingRegistrations && (
          <RegistrationsModal
            event={events.find((e) => e.id === viewingRegistrations)!}
            registrations={registrations.filter(
              (r) => r.event_id === viewingRegistrations
            )}
            loading={registrationsLoading}
            onClose={() => setViewingRegistrations(null)}
            onExport={() => handleExportRegistrations(viewingRegistrations)}
          />
        )}
      </div>
    </div>
  );
}

function EventFormModal({
  event,
  onSave,
  onClose,
  saving,
}: {
  event: EventRecord | null;
  onSave: (event: EventFormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<EventFormState>(
    eventToFormState(event)
  );
  const [showCropper, setShowCropper] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData({ ...formData, imageUrl: croppedImage, imageType: "upload" });
    setShowCropper(false);
    setUploadedImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl">
              {event ? t("admin.events.edit") : t("admin.events.add")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.titleZh")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title.zh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, zh: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.titleEn")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.descriptionZh")}
                </label>
                <textarea
                  value={formData.description.zh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        zh: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.descriptionEn")}
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        en: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Date, Time, Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.date")} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.time")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.capacity")}
                </label>
                <input
                  type="number"
                  placeholder={t("admin.events.form.unlimited")}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: e.target.value
                        ? parseInt(e.target.value, 10)
                        : "",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.events.form.location")} *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
            </div>

            {/* Access Type */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.events.form.accessType")} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="all-welcome"
                    checked={formData.accessType === "all-welcome"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessType: e.target.value as
                          | "all-welcome"
                          | "members-only",
                        memberFee:
                          e.target.value === "all-welcome"
                            ? formData.memberFee || formData.fee
                            : "",
                      })
                    }
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t("admin.events.form.allWelcome")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="members-only"
                    checked={formData.accessType === "members-only"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessType: e.target.value as
                          | "all-welcome"
                          | "members-only",
                        memberFee: "",
                      })
                    }
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t("admin.events.form.membersOnly")}</span>
                </label>
              </div>
            </div>

            {/* Fee */}
            {formData.accessType === "members-only" ? (
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("admin.events.form.price")} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t("admin.events.form.nonMemberPrice")} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t("admin.events.form.memberPrice")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={formData.fee.toString()}
                    value={formData.memberFee === "" ? "" : formData.memberFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memberFee: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>
              </div>
            )}

            {/* Image Type Selection */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.events.form.imageLabel")}
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageType"
                    value="unsplash"
                    checked={formData.imageType === "unsplash"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        imageType: "unsplash",
                        imageUrl: "",
                      })
                    }
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t("admin.events.form.unsplash")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageType"
                    value="upload"
                    checked={formData.imageType === "upload"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        imageType: "upload",
                        imageKeyword: "",
                      })
                    }
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t("admin.events.form.uploadImage")}</span>
                </label>
              </div>

              {formData.imageType === "unsplash" ? (
                <div>
                  <input
                    type="text"
                    placeholder="community,festival"
                    value={formData.imageKeyword || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, imageKeyword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("admin.events.form.imageHint")}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2B5F9E] transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {t("admin.events.form.upload")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {t("admin.events.form.imagePreview")}
                      </p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              {t("admin.events.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving
                ? t("common.loading")
                : event
                  ? t("admin.events.save")
                  : t("admin.events.add")}
            </button>
          </div>
        </form>

        {/* Image Cropper Modal */}
        {showCropper && uploadedImage && (
          <div className="absolute inset-0 bg-white z-10">
            <ImageCropper
              image={uploadedImage}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setUploadedImage(null);
              }}
              aspect={2}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function RegistrationsModal({
  event,
  registrations,
  loading,
  onClose,
  onExport,
}: {
  event: EventRecord;
  registrations: EventRegistrationRecord[];
  loading: boolean;
  onClose: () => void;
  onExport: () => void;
}) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRegistrations = registrations.filter((reg) => {
    const term = searchTerm.toLowerCase();
    return (
      reg.name.toLowerCase().includes(term) ||
      reg.phone.toLowerCase().includes(term) ||
      (reg.email ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl">
              {t("admin.events.registrations.title")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">
            {pickLocalized(event.title_zh, event.title_en, language)}
          </p>
          <p className="text-white/80 text-sm mt-1">
            {t("admin.events.registrations.count")}: {registrations.length}
          </p>
        </div>

        {/* Search and Export Bar */}
        <div className="p-4 border-b bg-gray-50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.events.registrations.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E] text-sm"
            />
          </div>

          <button
            onClick={onExport}
            disabled={registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{t("admin.events.registrations.export")}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              {t("common.loading")}
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">
                      {t("admin.events.registrations.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden sm:table-cell">
                      {t("admin.events.registrations.phone")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden md:table-cell">
                      {t("admin.events.registrations.email")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">
                      {t("admin.events.registrations.tickets")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden lg:table-cell">
                      {t("admin.events.registrations.payment")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden lg:table-cell">
                      {t("admin.events.registrations.registrationDate")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg, index) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{reg.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {reg.phone}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {reg.email ?? ""}
                      </td>
                      <td className="px-4 py-3">{reg.tickets}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {reg.payment_method ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${
                              reg.payment_method === "card"
                                ? "bg-blue-100 text-blue-700"
                                : reg.payment_method === "cash"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {t(`admin.events.payment.${reg.payment_method}`)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {reg.registration_date}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm
                ? language === "zh"
                  ? "没有找到匹配的报名记录"
                  : "No matching registrations found"
                : language === "zh"
                  ? "暂无报名记录"
                  : "No registrations yet"}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t("admin.events.registrations.close")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
