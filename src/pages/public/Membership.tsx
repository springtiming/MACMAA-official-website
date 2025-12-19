import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Users, Check, AlertCircle } from "lucide-react";
import {
  createMemberApplication,
  notifyMemberApplication,
} from "@/lib/supabaseApi";

// Validation error types (language-independent)
type ErrorType =
  | "required"
  | "invalidChineseName"
  | "invalidEnglishName"
  | "invalidPhone"
  | "invalidEmail"
  | "invalidAddress"
  | "invalidEmergencyName"
  | "invalidEmergencyPhone"
  | "invalidEmergencyRelation"
  | "invalidBirthday"
  | "agreeRequired1"
  | "agreeRequired2"
  | "agreeRequired3";

// Validation rules and regex patterns
const validationRules = {
  chineseName: {
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    errorType: "invalidChineseName" as ErrorType,
  },
  englishName: {
    pattern: /^[a-zA-Z\s]{2,50}$/,
    errorType: "invalidEnglishName" as ErrorType,
  },
  phone: {
    pattern: /^(04\d{8}|0[2-8]\d{8}|\+61\s?4\d{8})$/,
    errorType: "invalidPhone" as ErrorType,
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    errorType: "invalidEmail" as ErrorType,
  },
  address: {
    pattern: /^.{5,200}$/,
    errorType: "invalidAddress" as ErrorType,
  },
  emergencyName: {
    pattern: /^.{2,50}$/,
    errorType: "invalidEmergencyName" as ErrorType,
  },
  emergencyPhone: {
    pattern: /^(04\d{8}|0[2-8]\d{8}|\+61\s?4\d{8})$/,
    errorType: "invalidEmergencyPhone" as ErrorType,
  },
  emergencyRelation: {
    pattern: /^.{2,20}$/,
    errorType: "invalidEmergencyRelation" as ErrorType,
  },
  birthday: {
    validate: (value: string) => {
      if (!value) return false;
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 0 && age <= 120;
    },
    errorType: "invalidBirthday" as ErrorType,
  },
};

// Error messages by type and language
const errorMessages: Record<ErrorType, { zh: string; en: string }> = {
  required: {
    zh: "此字段为必填项",
    en: "This field is required",
  },
  invalidChineseName: {
    zh: "请输入2-10个中文字符",
    en: "Please enter 2-10 Chinese characters",
  },
  invalidEnglishName: {
    zh: "请输入2-50个英文字母和空格",
    en: "Please enter 2-50 English letters and spaces",
  },
  invalidPhone: {
    zh: "请输入有效的澳洲手机号码（例如：0412345678）",
    en: "Please enter a valid Australian phone number (e.g., 0412345678)",
  },
  invalidEmail: {
    zh: "请输入有效的邮箱地址",
    en: "Please enter a valid email address",
  },
  invalidAddress: {
    zh: "请输入5-200个字符的完整地址",
    en: "Please enter a complete address (5-200 characters)",
  },
  invalidEmergencyName: {
    zh: "请输入2-50个字符的紧急联系人姓名",
    en: "Please enter emergency contact name (2-50 characters)",
  },
  invalidEmergencyPhone: {
    zh: "请输入有效的澳洲手机号码（例如：0412345678）",
    en: "Please enter a valid Australian phone number (e.g., 0412345678)",
  },
  invalidEmergencyRelation: {
    zh: "请输入2-20个字符的关系",
    en: "Please enter relationship (2-20 characters)",
  },
  invalidBirthday: {
    zh: "请选择有效的出生日期",
    en: "Please select a valid date of birth",
  },
  agreeRequired1: {
    zh: "请确认所填信息真实无误",
    en: "Please confirm the information is accurate",
  },
  agreeRequired2: {
    zh: "请同意遵守会员守则",
    en: "Please agree to follow membership rules",
  },
  agreeRequired3: {
    zh: "请同意在审核通过后缴纳年度会员费",
    en: "Please agree to pay annual membership fee after approval",
  },
};

type FormErrors = {
  [key: string]: ErrorType;
};

export function Membership() {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
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

  // Get error message in current language
  const getErrorMessage = (errorType: ErrorType): string => {
    return errorMessages[errorType][language];
  };

  // Validate a single field
  const validateField = (
    name: string,
    value: string | boolean | null | undefined
  ): ErrorType | "" => {
    const rule = validationRules[name as keyof typeof validationRules];

    if (!rule) return "";
    if (typeof value !== "string") return "";

    // Check if field is required and empty
    const requiredFields = [
      "chineseName",
      "englishName",
      "birthday",
      "phone",
      "email",
      "address",
      "emergencyName",
      "emergencyPhone",
      "emergencyRelation",
    ];

    if (requiredFields.includes(name) && !value) {
      return "required";
    }

    // Special validation for birthday
    if (name === "birthday" && "validate" in rule) {
      if (!rule.validate(value)) {
        return rule.errorType;
      }
      return "";
    }

    // Regex validation
    if ("pattern" in rule && value && !rule.pattern.test(value)) {
      return rule.errorType;
    }

    return "";
  };

  // Handle field blur - mark as touched and validate
  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const value = formData[name as keyof typeof formData];
    if (typeof value === "string") {
      const error = validateField(name, value);
      if (error) {
        setErrors({ ...errors, [name]: error });
        return;
      }
    }
    const newErrors = { ...errors };
    delete newErrors[name];
    setErrors(newErrors);
  };

  // Handle field change - validate if already touched
  const handleChange = (name: string, value: string | boolean) => {
    setFormData({ ...formData, [name]: value });

    // Clear error immediately when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // If field was touched, validate on change (only string fields)
    if (touched[name] && typeof value === "string") {
      const error = validateField(name, value);
      if (error) {
        setErrors({ ...errors, [name]: error });
      }
    }
  };

  // Validate all fields on submit
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    const allFields = [
      "chineseName",
      "englishName",
      "birthday",
      "phone",
      "email",
      "address",
      "emergencyName",
      "emergencyPhone",
      "emergencyRelation",
    ];

    allFields.forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof typeof formData]
      );
      if (error) {
        newErrors[field] = error;
      }
    });

    // Check agreement checkboxes
    if (!formData.agree1) {
      newErrors.agree1 = "agreeRequired1";
    }
    if (!formData.agree2) {
      newErrors.agree2 = "agreeRequired2";
    }
    if (!formData.agree3) {
      newErrors.agree3 = "agreeRequired3";
    }

    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    allFields.forEach((field) => {
      allTouched[field] = true;
    });
    // Also mark checkboxes as touched
    allTouched.agree1 = true;
    allTouched.agree2 = true;
    allTouched.agree3 = true;
    setTouched(allTouched);

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    createMemberApplication({
      chinese_name: formData.chineseName.trim(),
      english_name: formData.englishName.trim(),
      gender: formData.gender as "male" | "female",
      birthday: formData.birthday || null,
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim(),
      emergency_name: formData.emergencyName.trim() || null,
      emergency_phone: formData.emergencyPhone.trim() || null,
      emergency_relation: formData.emergencyRelation.trim() || null,
    })
      .then(() => {
        void notifyMemberApplication({
          chineseName: formData.chineseName.trim(),
          englishName: formData.englishName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          applyDate: new Date().toISOString(),
        });
        setSubmitted(true);
      })
      .catch(() => {
        setSubmitError(
          language === "zh"
            ? "提交失败，请稍后再试。"
            : "Submission failed, please try again later."
        );
      })
      .finally(() => setSubmitting(false));
  };

  // Helper to get input className with error state
  const getInputClassName = (fieldName: string, baseClassName: string = "") => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base transition-colors ${
      hasError
        ? "border-red-500 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:ring-[#2B5F9E]"
    } ${baseClassName}`;
  };

  return (
    <div className="bg-gradient-to-b from-[#2B5F9E] via-[#6BA868] to-[#F5EFE6] min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                >
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <h1 className="text-[#2B5F9E] mb-3 sm:mb-4 text-3xl sm:text-4xl px-2">
                  {t("membership.title")}
                </h1>
                <p className="text-gray-700 max-w-2xl mx-auto mb-2 text-sm sm:text-base px-4">
                  {t("membership.subtitle")}
                </p>
                <div className="text-[#2B5F9E] px-4">
                  <p className="mb-1 text-base sm:text-lg">
                    {t("membership.fee")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("membership.feeNote")}
                  </p>
                </div>
              </div>

              {/* Application Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8"
              >
                <h2 className="text-[#2B5F9E] mb-5 sm:mb-6 text-2xl sm:text-3xl">
                  {t("membership.form.title")}
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                        {t("membership.form.chineseName")} *
                      </label>
                      <input
                        id="chineseName"
                        type="text"
                        value={formData.chineseName}
                        onChange={(e) =>
                          handleChange("chineseName", e.target.value)
                        }
                        onBlur={() => handleBlur("chineseName")}
                        className={getInputClassName("chineseName")}
                        placeholder={
                          language === "zh" ? "例如：张三" : "e.g., 张三"
                        }
                      />
                      {touched.chineseName && errors.chineseName && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.chineseName)}</span>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                        {t("membership.form.englishName")} *
                      </label>
                      <input
                        id="englishName"
                        type="text"
                        value={formData.englishName}
                        onChange={(e) =>
                          handleChange("englishName", e.target.value)
                        }
                        onBlur={() => handleBlur("englishName")}
                        className={getInputClassName("englishName")}
                        placeholder="e.g., John Smith"
                      />
                      {touched.englishName && errors.englishName && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.englishName)}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
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
                              handleChange("gender", e.target.value)
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
                              handleChange("gender", e.target.value)
                            }
                            className="w-4 h-4 text-[#2B5F9E]"
                          />
                          <span>{t("membership.form.female")}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                        {t("membership.form.birthday")} *
                      </label>
                      <input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) =>
                          handleChange("birthday", e.target.value)
                        }
                        onBlur={() => handleBlur("birthday")}
                        className={getInputClassName("birthday")}
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {touched.birthday && errors.birthday && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.birthday)}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                      {t("membership.form.phone")} *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      className={getInputClassName("phone")}
                      placeholder="0412345678"
                    />
                    {touched.phone && errors.phone && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage(errors.phone)}</span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                      {t("membership.form.email")} *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={getInputClassName("email")}
                      placeholder="example@email.com"
                    />
                    {touched.email && errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage(errors.email)}</span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                      {t("membership.form.address")} *
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      onBlur={() => handleBlur("address")}
                      className={getInputClassName("address")}
                      placeholder={
                        language === "zh"
                          ? "例如：123 Main St, Melbourne VIC 3000"
                          : "e.g., 123 Main St, Melbourne VIC 3000"
                      }
                    />
                    {touched.address && errors.address && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{getErrorMessage(errors.address)}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t pt-6">
                    <h3 className="text-[#2B5F9E] mb-4">
                      {t("membership.form.emergency")}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                          {t("membership.form.emergencyName")} *
                        </label>
                        <input
                          id="emergencyName"
                          type="text"
                          value={formData.emergencyName}
                          onChange={(e) =>
                            handleChange("emergencyName", e.target.value)
                          }
                          onBlur={() => handleBlur("emergencyName")}
                          className={getInputClassName("emergencyName")}
                          placeholder={
                            language === "zh"
                              ? "例如：张三"
                              : "e.g., John Smith"
                          }
                        />
                        {touched.emergencyName && errors.emergencyName && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{getErrorMessage(errors.emergencyName)}</span>
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                            {t("membership.form.emergencyPhone")} *
                          </label>
                          <input
                            id="emergencyPhone"
                            type="tel"
                            value={formData.emergencyPhone}
                            onChange={(e) =>
                              handleChange("emergencyPhone", e.target.value)
                            }
                            onBlur={() => handleBlur("emergencyPhone")}
                            className={getInputClassName("emergencyPhone")}
                            placeholder="0412345678"
                          />
                          {touched.emergencyPhone && errors.emergencyPhone && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                {getErrorMessage(errors.emergencyPhone)}
                              </span>
                            </motion.div>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                            {t("membership.form.emergencyRelation")} *
                          </label>
                          <input
                            id="emergencyRelation"
                            type="text"
                            value={formData.emergencyRelation}
                            onChange={(e) =>
                              handleChange("emergencyRelation", e.target.value)
                            }
                            onBlur={() => handleBlur("emergencyRelation")}
                            className={getInputClassName("emergencyRelation")}
                            placeholder={
                              language === "zh"
                                ? "例如：配偶、子女"
                                : "e.g., Spouse, Child"
                            }
                          />
                          {touched.emergencyRelation &&
                            errors.emergencyRelation && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 mt-1 text-red-600 text-sm"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>
                                  {getErrorMessage(errors.emergencyRelation)}
                                </span>
                              </motion.div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership Type */}
                  <div className="bg-[#F5EFE6] rounded-lg p-4">
                    <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                      {t("membership.form.memberType")}
                    </label>
                    <p className="text-[#2B5F9E]">
                      {t("membership.form.regular")}
                    </p>
                  </div>

                  {/* Agreement Checkboxes */}
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agree1}
                          onChange={(e) => {
                            handleChange("agree1", e.target.checked);
                            if (e.target.checked && errors.agree1) {
                              const newErrors = { ...errors };
                              delete newErrors.agree1;
                              setErrors(newErrors);
                            }
                          }}
                          className={`mt-1 w-4 h-4 ${
                            touched.agree1 && errors.agree1
                              ? "accent-red-500"
                              : "text-[#2B5F9E]"
                          }`}
                        />
                        <span
                          className={`${
                            touched.agree1 && errors.agree1
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {t("membership.form.agree1")} *
                        </span>
                      </label>
                      {touched.agree1 && errors.agree1 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 ml-7 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.agree1)}</span>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agree2}
                          onChange={(e) => {
                            handleChange("agree2", e.target.checked);
                            if (e.target.checked && errors.agree2) {
                              const newErrors = { ...errors };
                              delete newErrors.agree2;
                              setErrors(newErrors);
                            }
                          }}
                          className={`mt-1 w-4 h-4 ${
                            touched.agree2 && errors.agree2
                              ? "accent-red-500"
                              : "text-[#2B5F9E]"
                          }`}
                        />
                        <span
                          className={`${
                            touched.agree2 && errors.agree2
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {t("membership.form.agree2")} *
                        </span>
                      </label>
                      {touched.agree2 && errors.agree2 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 ml-7 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.agree2)}</span>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agree3}
                          onChange={(e) => {
                            handleChange("agree3", e.target.checked);
                            if (e.target.checked && errors.agree3) {
                              const newErrors = { ...errors };
                              delete newErrors.agree3;
                              setErrors(newErrors);
                            }
                          }}
                          className={`mt-1 w-4 h-4 ${
                            touched.agree3 && errors.agree3
                              ? "accent-red-500"
                              : "text-[#2B5F9E]"
                          }`}
                        />
                        <span
                          className={`${
                            touched.agree3 && errors.agree3
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {t("membership.form.agree3")} *
                        </span>
                      </label>
                      {touched.agree3 && errors.agree3 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 mt-1 ml-7 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{getErrorMessage(errors.agree3)}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting
                      ? language === "zh"
                        ? "提交中..."
                        : "Submitting..."
                      : t("membership.form.submit")}
                  </motion.button>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-600 text-center text-sm"
                    >
                      {submitError}
                    </motion.div>
                  )}
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
                    {formData.email}
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
    </div>
  );
}
