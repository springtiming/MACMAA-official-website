import React, { useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  Briefcase,
  Check,
  Clock,
  FileText,
  Heart,
  Laptop,
  Megaphone,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createVolunteerApplication } from "@/lib/supabaseApi";

type FormErrors = Record<string, string>;
type Option = { value: string; zh: string; en: string };

const LANGUAGE_OPTIONS: Option[] = [
  { value: "english", zh: "英语", en: "English" },
  { value: "mandarin", zh: "普通话", en: "Mandarin" },
  { value: "cantonese", zh: "粤语", en: "Cantonese" },
  { value: "other", zh: "其他", en: "Other" },
];

const INTEREST_OPTIONS: Option[] = [
  { value: "event-support", zh: "活动现场协助", en: "Event Support" },
  {
    value: "elderly-support",
    zh: "长者关怀与陪伴",
    en: "Elderly Support & Companionship",
  },
  { value: "migrant-support", zh: "新移民服务", en: "Migrant Support" },
  { value: "administration", zh: "行政协助", en: "Administration" },
  { value: "photo-video", zh: "摄影 / 视频", en: "Photography / Video" },
  {
    value: "writing-translation",
    zh: "文案 / 翻译",
    en: "Writing / Translation",
  },
  {
    value: "sustainability",
    zh: "社区环保活动",
    en: "Sustainability Programs",
  },
  { value: "other", zh: "其他", en: "Other" },
];

const TIME_OPTIONS: Option[] = [
  { value: "morning", zh: "上午", en: "Morning" },
  { value: "afternoon", zh: "下午", en: "Afternoon" },
  { value: "evening", zh: "晚上", en: "Evening" },
];

const HOURS_OPTIONS: Option[] = [
  { value: "2-4", zh: "2-4 小时", en: "2-4 hours" },
  { value: "4-8", zh: "4-8 小时", en: "4-8 hours" },
  { value: "8-12", zh: "8-12 小时", en: "8-12 hours" },
  { value: "depends", zh: "视情况而定", en: "Depends on schedule" },
];

const GENDER_OPTIONS: Option[] = [
  { value: "male", zh: "男", en: "Male" },
  { value: "female", zh: "女", en: "Female" },
  {
    value: "prefer-not-to-say",
    zh: "不愿透露",
    en: "Prefer not to say",
  },
];

const PHONE_PATTERN = /^(04\d{8}|0[2-8]\d{8}|\+61\s?4\d{8})$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function Volunteer() {
  const { language, t } = useLanguage();
  const l = (zh: string, en: string) => (language === "zh" ? zh : en);

  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    gender: "",
    phone: "",
    email: "",
    suburb: "",
    languageSkills: [] as string[],
    languageOther: "",
    interests: [] as string[],
    interestOther: "",
    weekdayAvailability: [] as string[],
    weekendAvailability: [] as string[],
    monthlyHours: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    agreeTruth: false,
    agreeUnpaid: false,
    agreeGuidelines: false,
    agreeContact: false,
    agreePrivacy: false,
  });

  const updateField = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleArray = (
    field:
      | "languageSkills"
      | "interests"
      | "weekdayAvailability"
      | "weekendAvailability",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const validate = () => {
    const next: FormErrors = {};
    const currentYear = new Date().getFullYear();
    if (!formData.name.trim())
      next.name = l("请填写姓名", "Please enter your name");
    if (formData.birthYear.trim()) {
      const year = Number(formData.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        next.birthYear = l("出生年份无效", "Invalid year of birth");
      }
    }
    if (!PHONE_PATTERN.test(formData.phone.trim())) {
      next.phone = l("请填写有效电话", "Please enter a valid phone number");
    }
    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      next.email = l("请填写有效邮箱", "Please enter a valid email address");
    }
    if (!formData.suburb.trim()) {
      next.suburb = l("请填写居住区域", "Please enter residential suburb");
    }
    if (formData.languageSkills.length === 0) {
      next.languageSkills = l(
        "请至少选择一项语言能力",
        "Please select at least one language"
      );
    }
    if (
      formData.languageSkills.includes("other") &&
      !formData.languageOther.trim()
    ) {
      next.languageOther = l("请补充其他语言", "Please specify other language");
    }
    if (formData.interests.length === 0) {
      next.interests = l(
        "请至少选择一项服务意向",
        "Please select at least one interest"
      );
    }
    if (
      formData.interests.includes("other") &&
      !formData.interestOther.trim()
    ) {
      next.interestOther = l(
        "请补充其他服务意向",
        "Please specify other interest"
      );
    }
    if (
      formData.weekdayAvailability.length === 0 &&
      formData.weekendAvailability.length === 0
    ) {
      next.availability = l(
        "请至少选择一个可参与时间",
        "Please select at least one available time"
      );
    }
    if (!formData.monthlyHours) {
      next.monthlyHours = l(
        "请选择每月可服务小时数",
        "Please select monthly hours"
      );
    }
    if (!formData.emergencyName.trim()) {
      next.emergencyName = l(
        "请填写紧急联系人",
        "Please enter emergency contact name"
      );
    }
    if (!formData.emergencyRelation.trim()) {
      next.emergencyRelation = l("请填写关系", "Please enter relationship");
    }
    if (!PHONE_PATTERN.test(formData.emergencyPhone.trim())) {
      next.emergencyPhone = l(
        "请填写有效紧急联系电话",
        "Please enter a valid emergency phone"
      );
    }
    if (!formData.agreeTruth)
      next.agreeTruth = l("请确认信息真实", "Please confirm accuracy");
    if (!formData.agreeUnpaid)
      next.agreeUnpaid = l(
        "请确认志愿服务无薪酬",
        "Please confirm unpaid volunteering"
      );
    if (!formData.agreeGuidelines)
      next.agreeGuidelines = l(
        "请同意遵守行为守则",
        "Please agree to conduct guidelines"
      );
    if (!formData.agreeContact)
      next.agreeContact = l("请同意联系授权", "Please agree to contact");
    if (!formData.agreePrivacy)
      next.agreePrivacy = l("请同意隐私声明", "Please agree to privacy policy");
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createVolunteerApplication({
        name: formData.name.trim(),
        birth_year: formData.birthYear ? Number(formData.birthYear) : null,
        gender:
          (formData.gender as "male" | "female" | "prefer-not-to-say") || null,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        suburb: formData.suburb.trim(),
        language_skills: formData.languageSkills,
        language_other: formData.languageOther.trim() || null,
        volunteer_interests: formData.interests,
        interest_other: formData.interestOther.trim() || null,
        weekday_availability: formData.weekdayAvailability,
        weekend_availability: formData.weekendAvailability,
        monthly_hours: formData.monthlyHours,
        emergency_name: formData.emergencyName.trim(),
        emergency_relation: formData.emergencyRelation.trim(),
        emergency_phone: formData.emergencyPhone.trim(),
        agree_truth: formData.agreeTruth,
        agree_unpaid: formData.agreeUnpaid,
        agree_guidelines: formData.agreeGuidelines,
        agree_contact: formData.agreeContact,
        agree_privacy: formData.agreePrivacy,
      });
      setSubmitted(true);
    } catch {
      setSubmitError(
        l("提交失败，请稍后重试。", "Submission failed, please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (key: string) =>
    errors[key] ? (
      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {errors[key]}
      </p>
    ) : null;

  const responsibilities = [
    { icon: FileText, text: t("volunteer.responsibilities.1") },
    { icon: Briefcase, text: t("volunteer.responsibilities.2") },
    { icon: Megaphone, text: t("volunteer.responsibilities.3") },
    { icon: Laptop, text: t("volunteer.responsibilities.4") },
  ];

  const requirements = [
    { icon: Users, text: t("volunteer.requirements.1") },
    { icon: UserCheck, text: t("volunteer.requirements.2") },
    { icon: Sparkles, text: t("volunteer.requirements.3") },
    { icon: Clock, text: t("volunteer.requirements.4") },
  ];

  const volunteerBenefits = [
    { icon: Award, text: t("volunteer.benefits.1") },
    { icon: Heart, text: t("volunteer.benefits.2") },
    { icon: Laptop, text: t("volunteer.benefits.3") },
    { icon: Users, text: t("volunteer.benefits.4") },
  ];

  const handleOpenForm = () => {
    if (!showForm) {
      setShowForm(true);
    }

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        formSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2 font-bold font-heading">
                  {t("volunteer.title")}
                </h1>
                <p className="text-gray-700 max-w-2xl mx-auto text-base sm:text-lg px-4">
                  {t("volunteer.subtitle")}
                </p>
              </div>

              <div data-volunteer-guide="true" className="space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8">
                  <h2 className="text-xl text-[#2B5F9E] mb-4">
                    {t("volunteer.responsibilities.title")}
                  </h2>
                  <div className="space-y-3">
                    {responsibilities.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#2B5F9E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-[#2B5F9E]" />
                        </div>
                        <span className="text-gray-700">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8">
                  <h2 className="text-xl text-[#2B5F9E] mb-4">
                    {t("volunteer.requirements.title")}
                  </h2>
                  <div className="space-y-3">
                    {requirements.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#6BA868]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-[#6BA868]" />
                        </div>
                        <span className="text-gray-700">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#F5EFE6] to-[#E8DCC8] rounded-xl sm:rounded-2xl p-5 sm:p-8">
                  <h2 className="text-xl text-[#2B5F9E] mb-6">
                    {t("volunteer.benefits.title")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {volunteerBenefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 bg-white rounded-lg p-4"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#6BA868]/20 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-5 h-5 text-[#6BA868]" />
                        </div>
                        <span className="text-gray-700">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-2">
                  <motion.button
                    type="button"
                    onClick={handleOpenForm}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#2B5F9E] text-white text-lg rounded-lg hover:bg-[#234a7e] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {l("立即报名", "Apply Now")}
                  </motion.button>
                </div>
              </div>

              {showForm && (
                <motion.div
                  ref={formSectionRef}
                  id="volunteer-application-form"
                  className="mt-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl text-[#2B5F9E] mb-2">
                        {l("志愿者申请表", "Volunteer Application Form")}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {l(
                          "请完整填写以下信息，带 * 为必填项。",
                          "Please complete the fields below. Items marked with * are required."
                        )}
                      </p>
                    </div>
                    <form
                      data-volunteer-form="true"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("姓名*", "Name*")}
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("出生年份", "Year of Birth")}
                          value={formData.birthYear}
                          onChange={(e) =>
                            updateField("birthYear", e.target.value)
                          }
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("电话*", "Phone*")}
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("邮箱*", "Email*")}
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg md:col-span-2"
                          placeholder={l("居住区域*", "Residential Suburb*")}
                          value={formData.suburb}
                          onChange={(e) =>
                            updateField("suburb", e.target.value)
                          }
                        />
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-[#2B5F9E]">
                            {l("性别（可选）", "Gender (Optional)")}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {GENDER_OPTIONS.map((opt) => (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name="gender"
                                  value={opt.value}
                                  checked={formData.gender === opt.value}
                                  onChange={(e) =>
                                    updateField("gender", e.target.value)
                                  }
                                />
                                <span>{l(opt.zh, opt.en)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      {renderError("name")}
                      {renderError("birthYear")}
                      {renderError("phone")}
                      {renderError("email")}
                      {renderError("suburb")}

                      <div className="space-y-2">
                        <p className="text-[#2B5F9E]">
                          {l(
                            "语言能力（可多选）",
                            "Language Skills (Multiple choices)"
                          )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.languageSkills.includes(
                                  opt.value
                                )}
                                onChange={() =>
                                  toggleArray("languageSkills", opt.value)
                                }
                              />
                              <span>{l(opt.zh, opt.en)}</span>
                            </label>
                          ))}
                        </div>
                        {formData.languageSkills.includes("other") && (
                          <input
                            className="w-full px-3 py-2.5 border rounded-lg"
                            placeholder={l("其他语言", "Other language")}
                            value={formData.languageOther}
                            onChange={(e) =>
                              updateField("languageOther", e.target.value)
                            }
                          />
                        )}
                        {renderError("languageSkills")}
                        {renderError("languageOther")}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[#2B5F9E]">
                          {l(
                            "志愿服务意向（可多选）",
                            "Volunteer Interests (Multiple choices)"
                          )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {INTEREST_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.interests.includes(opt.value)}
                                onChange={() =>
                                  toggleArray("interests", opt.value)
                                }
                              />
                              <span>{l(opt.zh, opt.en)}</span>
                            </label>
                          ))}
                        </div>
                        {formData.interests.includes("other") && (
                          <input
                            className="w-full px-3 py-2.5 border rounded-lg"
                            placeholder={l("其他服务意向", "Other interest")}
                            value={formData.interestOther}
                            onChange={(e) =>
                              updateField("interestOther", e.target.value)
                            }
                          />
                        )}
                        {renderError("interests")}
                        {renderError("interestOther")}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[#2B5F9E]">
                          {l("可参与时间", "Availability")}
                        </p>
                        <p>{l("平日", "Weekdays")}</p>
                        <div className="flex flex-wrap gap-4">
                          {TIME_OPTIONS.map((opt) => (
                            <label
                              key={`wd-${opt.value}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.weekdayAvailability.includes(
                                  opt.value
                                )}
                                onChange={() =>
                                  toggleArray("weekdayAvailability", opt.value)
                                }
                              />
                              <span>{l(opt.zh, opt.en)}</span>
                            </label>
                          ))}
                        </div>
                        <p>{l("周末", "Weekends")}</p>
                        <div className="flex flex-wrap gap-4">
                          {TIME_OPTIONS.map((opt) => (
                            <label
                              key={`we-${opt.value}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.weekendAvailability.includes(
                                  opt.value
                                )}
                                onChange={() =>
                                  toggleArray("weekendAvailability", opt.value)
                                }
                              />
                              <span>{l(opt.zh, opt.en)}</span>
                            </label>
                          ))}
                        </div>
                        <select
                          className="w-full px-3 py-2.5 border rounded-lg"
                          value={formData.monthlyHours}
                          onChange={(e) =>
                            updateField("monthlyHours", e.target.value)
                          }
                        >
                          <option value="">
                            {l("每月可服务小时数*", "Approx. hours per month*")}
                          </option>
                          {HOURS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {l(opt.zh, opt.en)}
                            </option>
                          ))}
                        </select>
                        {renderError("availability")}
                        {renderError("monthlyHours")}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("紧急联系人姓名*", "Emergency Name*")}
                          value={formData.emergencyName}
                          onChange={(e) =>
                            updateField("emergencyName", e.target.value)
                          }
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("关系*", "Relationship*")}
                          value={formData.emergencyRelation}
                          onChange={(e) =>
                            updateField("emergencyRelation", e.target.value)
                          }
                        />
                        <input
                          className="w-full px-3 py-2.5 border rounded-lg"
                          placeholder={l("紧急联系电话*", "Emergency Phone*")}
                          value={formData.emergencyPhone}
                          onChange={(e) =>
                            updateField("emergencyPhone", e.target.value)
                          }
                        />
                      </div>
                      {renderError("emergencyName")}
                      {renderError("emergencyRelation")}
                      {renderError("emergencyPhone")}

                      <div className="space-y-2">
                        {[
                          [
                            "agreeTruth",
                            l(
                              "我确认所填信息真实准确。",
                              "I confirm information is accurate."
                            ),
                          ],
                          [
                            "agreeUnpaid",
                            l(
                              "我理解志愿服务为无薪。",
                              "I understand volunteering is unpaid."
                            ),
                          ],
                          [
                            "agreeGuidelines",
                            l(
                              "我同意遵守协会行为守则。",
                              "I agree to follow conduct guidelines."
                            ),
                          ],
                          [
                            "agreeContact",
                            l(
                              "我同意协会联系我。",
                              "I consent to be contacted."
                            ),
                          ],
                          [
                            "agreePrivacy",
                            l(
                              "我同意隐私声明。",
                              "I agree to the privacy policy."
                            ),
                          ],
                        ].map(([key, text]) => (
                          <label key={key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(
                                formData[key as keyof typeof formData]
                              )}
                              onChange={(e) =>
                                updateField(key, e.target.checked)
                              }
                            />
                            <span>{text} *</span>
                          </label>
                        ))}
                        {renderError("agreeTruth")}
                        {renderError("agreeUnpaid")}
                        {renderError("agreeGuidelines")}
                        {renderError("agreeContact")}
                        {renderError("agreePrivacy")}
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors disabled:opacity-50"
                        disabled={submitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {submitting
                          ? l("提交中...", "Submitting...")
                          : l("提交志愿者申请", "Submit Volunteer Application")}
                      </motion.button>

                      {submitError && (
                        <p className="text-red-600 text-sm text-center">
                          {submitError}
                        </p>
                      )}
                    </form>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-[#2B5F9E] mb-4">
                {l("申请已提交！", "Application Submitted!")}
              </h2>
              <p className="text-gray-700 mb-8 max-w-md mx-auto">
                {l(
                  "感谢您的申请，我们会尽快联系您。",
                  "Thank you. We will contact you soon."
                )}
              </p>
              <motion.button
                onClick={() => (window.location.href = "/")}
                className="px-8 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {l("返回首页", "Back to Home")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
