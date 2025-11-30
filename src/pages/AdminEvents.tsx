import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  ArrowLeft,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  fetchAdminEvents,
  saveEvent,
  deleteEvent,
  type EventRecord,
  type UpsertEventInput,
} from "../lib/supabaseApi";
import { pickLocalized } from "../lib/supabaseHelpers";

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
};

function toForm(e: EventRecord | null): FormState {
  if (!e) return emptyForm;
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
  };
}

export function AdminEvents() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);

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

  const handleSave = async () => {
    try {
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
        image_type: null,
        image_keyword: null,
        image_url: null,
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
    } catch {
      setError(t("common.error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.events.deleteConfirm"))) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError(t("common.error"));
    }
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
              <h1 className="text-[#2B5F9E] text-2xl">
                {t("admin.events.title")}
              </h1>
            </div>
            <motion.button
              onClick={() => {
                setForm(emptyForm);
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
          {filtered.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl text-[#2B5F9E]">
                      {pickLocalized(event.title_zh, event.title_en, language)}
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
                        {event.event_date} {event.start_time?.slice(0, 5) ?? ""}{" "}
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setForm(toForm(event));
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157]"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t("admin.events.edit")}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t("common.delete")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">
              {language === "zh" ? "没有找到活动" : "No events found"}
            </p>
          )}
        </div>

        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowForm(false);
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-[#2B5F9E]">
                  {form.id ? t("admin.events.edit") : t("admin.events.add")}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.titleZh")}
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.titleZh}
                    onChange={(e) =>
                      setForm({ ...form, titleZh: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.titleEn")}
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.titleEn}
                    onChange={(e) =>
                      setForm({ ...form, titleEn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.descriptionZh")}
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={form.descZh}
                    onChange={(e) =>
                      setForm({ ...form, descZh: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.descriptionEn")}
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={form.descEn}
                    onChange={(e) =>
                      setForm({ ...form, descEn: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.date")}
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.time")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={form.start}
                      onChange={(e) =>
                        setForm({ ...form, start: e.target.value })
                      }
                    />
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={form.end}
                      onChange={(e) =>
                        setForm({ ...form, end: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.capacity")}
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-700">
                    {t("admin.events.form.location")}
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
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
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  />
                </div>
                {form.access === "all-welcome" && (
                  <div>
                    <label className="text-sm text-gray-700">
                      {t("admin.events.form.memberPrice")}
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={form.memberFee}
                      onChange={(e) =>
                        setForm({ ...form, memberFee: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  type="button"
                  className="px-4 py-2 border rounded-lg"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="px-4 py-2 bg-[#6BA868] text-white rounded-lg"
                >
                  {form.id ? t("admin.events.save") : t("admin.events.add")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
