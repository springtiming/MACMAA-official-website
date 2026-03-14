import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Eye,
  HandHeart,
  RotateCcw,
  Search,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import {
  ConcurrencyError,
  deleteVolunteerApplication,
  fetchVolunteerApplications,
  type VolunteerApplicationRecord,
  updateVolunteerApplicationStatus,
} from "@/lib/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { useProcessingFeedback } from "@/hooks/useProcessingFeedback";
import { AdminConfirmDialog } from "@/components/AdminConfirmDialog";

type VolunteerFilter = "all" | "pending" | "approved" | "rejected";

const FILTER_OPTIONS: VolunteerFilter[] = [
  "all",
  "pending",
  "approved",
  "rejected",
];

const LANGUAGE_LABELS: Record<string, { zh: string; en: string }> = {
  english: { zh: "英语", en: "English" },
  mandarin: { zh: "普通话", en: "Mandarin" },
  cantonese: { zh: "粤语", en: "Cantonese" },
  other: { zh: "其他", en: "Other" },
};

const INTEREST_LABELS: Record<string, { zh: string; en: string }> = {
  "event-support": { zh: "活动现场协助", en: "Event Support" },
  "elderly-support": {
    zh: "长者关怀与陪伴",
    en: "Elderly Support & Companionship",
  },
  "migrant-support": { zh: "新移民服务", en: "Migrant Support" },
  administration: { zh: "行政协助", en: "Administration" },
  "photo-video": { zh: "摄影 / 视频", en: "Photography / Video" },
  "writing-translation": { zh: "文案 / 翻译", en: "Writing / Translation" },
  sustainability: { zh: "社区环保活动", en: "Sustainability Programs" },
  other: { zh: "其他", en: "Other" },
};

const TIME_LABELS: Record<string, { zh: string; en: string }> = {
  morning: { zh: "上午", en: "Morning" },
  afternoon: { zh: "下午", en: "Afternoon" },
  evening: { zh: "晚上", en: "Evening" },
};

const HOURS_LABELS: Record<string, { zh: string; en: string }> = {
  "2-4": { zh: "2-4 小时", en: "2-4 hours" },
  "4-8": { zh: "4-8 小时", en: "4-8 hours" },
  "8-12": { zh: "8-12 小时", en: "8-12 hours" },
  depends: { zh: "视情况而定", en: "Depends on schedule" },
};

const GENDER_LABELS: Record<string, { zh: string; en: string }> = {
  male: { zh: "男", en: "Male" },
  female: { zh: "女", en: "Female" },
  "prefer-not-to-say": { zh: "不愿透露", en: "Prefer not to say" },
};

type ConfirmType = "approve" | "reject" | "revoke" | "reopen" | "delete";

export function AdminVolunteers() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const l = (zh: string, en: string) => (language === "zh" ? zh : en);

  const [volunteers, setVolunteers] = useState<VolunteerApplicationRecord[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<VolunteerFilter>("all");
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerApplicationRecord | null>(null);
  const [showRejectedNote, setShowRejectedNote] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: ConfirmType;
    volunteer: VolunteerApplicationRecord;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    state: processingState,
    title: processingTitle,
    message: processingMessage,
    runWithFeedback,
    reset: resetProcessing,
  } = useProcessingFeedback();

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVolunteerApplications();
      setVolunteers(data);
      setError(null);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  const filteredVolunteers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return volunteers.filter((volunteer) => {
      const matchesSearch =
        volunteer.name.toLowerCase().includes(term) ||
        volunteer.phone.includes(searchTerm) ||
        volunteer.email.toLowerCase().includes(term) ||
        volunteer.suburb.toLowerCase().includes(term);
      const matchesStatus =
        filterStatus === "all" || volunteer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, filterStatus]);

  const getStatusColor = (status: VolunteerApplicationRecord["status"]) => {
    switch (status) {
      case "pending":
        return "bg-[#EB8C3A] text-white";
      case "approved":
        return "bg-[#6BA868] text-white";
      case "rejected":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusText = (
    status: VolunteerApplicationRecord["status"] | VolunteerFilter
  ) => {
    if (status === "all") return l("全部", "All");
    if (status === "pending") return l("待审核", "Pending");
    if (status === "approved") return l("已通过", "Approved");
    if (status === "rejected") return l("已拒绝", "Rejected");
    return status;
  };

  const mapLabel = (
    value: string,
    labels: Record<string, { zh: string; en: string }>
  ) => {
    const label = labels[value];
    if (label) {
      return l(label.zh, label.en);
    }
    return value;
  };

  const formatMultiValues = (
    values: string[] | null | undefined,
    labels: Record<string, { zh: string; en: string }>
  ) => {
    if (!values || values.length === 0) return "-";
    return values.map((value) => mapLabel(value, labels)).join(", ");
  };

  const formatMultiValuesWithOther = (
    values: string[] | null | undefined,
    labels: Record<string, { zh: string; en: string }>,
    otherText: string | null | undefined
  ) => {
    const base = formatMultiValues(values, labels);
    if (base === "-") return "-";
    if (otherText?.trim()) {
      const suffix =
        language === "zh" ? `；其他：${otherText.trim()}` : `; other: ${otherText.trim()}`;
      return base + suffix;
    }
    return base;
  };

  const getProcessingMessages = (
    type: ConfirmType,
    volunteer: VolunteerApplicationRecord
  ) => {
    const name = volunteer.name;
    if (language === "zh") {
      if (type === "approve") {
        return {
          processingTitle: "正在通过志愿者申请...",
          processingMessage: `正在处理 ${name} 的申请`,
          successTitle: "审核通过",
          successMessage: `${name} 已通过志愿者审核`,
          errorTitle: "操作失败",
          errorMessage: "请稍后重试",
        };
      }
      if (type === "reject") {
        return {
          processingTitle: "正在拒绝志愿者申请...",
          processingMessage: `正在处理 ${name} 的申请`,
          successTitle: "已拒绝申请",
          successMessage: `${name} 的申请已被拒绝`,
          errorTitle: "操作失败",
          errorMessage: "请稍后重试",
        };
      }
      if (type === "revoke") {
        return {
          processingTitle: "正在撤销通过状态...",
          processingMessage: `正在更新 ${name} 的审核状态`,
          successTitle: "已撤销通过",
          successMessage: `${name} 已改为拒绝状态`,
          errorTitle: "操作失败",
          errorMessage: "请稍后重试",
        };
      }
      if (type === "reopen") {
        return {
          processingTitle: "正在重新开启审核...",
          processingMessage: `正在更新 ${name} 的审核状态`,
          successTitle: "已重新开启",
          successMessage: `${name} 已恢复为待审核`,
          errorTitle: "操作失败",
          errorMessage: "请稍后重试",
        };
      }
      return {
        processingTitle: "正在删除申请记录...",
        processingMessage: `正在删除 ${name} 的申请`,
        successTitle: "删除成功",
        successMessage: `${name} 的申请记录已删除`,
        errorTitle: "删除失败",
        errorMessage: "请稍后重试",
      };
    }

    if (type === "approve") {
      return {
        processingTitle: "Approving volunteer application...",
        processingMessage: `Processing application for ${name}`,
        successTitle: "Application approved",
        successMessage: `${name} has been approved`,
        errorTitle: "Action failed",
        errorMessage: "Please try again later",
      };
    }
    if (type === "reject") {
      return {
        processingTitle: "Rejecting volunteer application...",
        processingMessage: `Processing application for ${name}`,
        successTitle: "Application rejected",
        successMessage: `${name} has been rejected`,
        errorTitle: "Action failed",
        errorMessage: "Please try again later",
      };
    }
    if (type === "revoke") {
      return {
        processingTitle: "Revoking approval...",
        processingMessage: `Updating status for ${name}`,
        successTitle: "Approval revoked",
        successMessage: `${name} has been moved to rejected`,
        errorTitle: "Action failed",
        errorMessage: "Please try again later",
      };
    }
    if (type === "reopen") {
      return {
        processingTitle: "Reopening review...",
        processingMessage: `Updating status for ${name}`,
        successTitle: "Application reopened",
        successMessage: `${name} is now pending review again`,
        errorTitle: "Action failed",
        errorMessage: "Please try again later",
      };
    }
    return {
      processingTitle: "Deleting record...",
      processingMessage: `Deleting application for ${name}`,
      successTitle: "Record deleted",
      successMessage: `${name}'s application record has been removed`,
      errorTitle: "Deletion failed",
      errorMessage: "Please try again later",
    };
  };

  const openConfirmDialog = (
    type: ConfirmType,
    volunteer: VolunteerApplicationRecord
  ) => setConfirmDialog({ type, volunteer });

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    const { type, volunteer } = confirmDialog;
    setConfirmDialog(null);

    const messages = getProcessingMessages(type, volunteer);
    try {
      await runWithFeedback(messages, async () => {
        if (type === "delete") {
          await deleteVolunteerApplication(volunteer.id);
          setVolunteers((prev) =>
            prev.filter((item) => item.id !== volunteer.id)
          );
          if (selectedVolunteer?.id === volunteer.id) {
            setSelectedVolunteer(null);
          }
          return;
        }

        const nextStatus: VolunteerApplicationRecord["status"] =
          type === "approve"
            ? "approved"
            : type === "reject" || type === "revoke"
              ? "rejected"
              : "pending";

        const updated = await updateVolunteerApplicationStatus(
          volunteer.id,
          nextStatus,
          {
            expectedStatus: volunteer.status,
            expectedUpdatedAt: volunteer.updated_at,
          }
        );

        setVolunteers((prev) =>
          prev.map((item) => (item.id === volunteer.id ? updated : item))
        );
        if (selectedVolunteer?.id === volunteer.id) {
          setSelectedVolunteer(updated);
        }
      });
    } catch (err) {
      if (err instanceof ConcurrencyError) {
        setError(
          l(
            "该申请已被其他管理员更新，列表已刷新，请重试。",
            "This application was updated by another admin. List refreshed, please try again."
          )
        );
        await loadVolunteers();
      } else {
        setError(t("common.error"));
      }
    }
  };

  const detailRows = (volunteer: VolunteerApplicationRecord) => [
    { label: l("姓名", "Name"), value: volunteer.name },
    {
      label: l("出生年份", "Year of Birth"),
      value: volunteer.birth_year ? String(volunteer.birth_year) : "-",
    },
    {
      label: l("性别", "Gender"),
      value: volunteer.gender ? mapLabel(volunteer.gender, GENDER_LABELS) : "-",
    },
    { label: l("电话", "Phone"), value: volunteer.phone },
    { label: l("邮箱", "Email"), value: volunteer.email },
    { label: l("居住区域", "Residential Suburb"), value: volunteer.suburb },
    {
      label: l("语言能力", "Language Skills"),
      value: formatMultiValuesWithOther(
        volunteer.language_skills,
        LANGUAGE_LABELS,
        volunteer.language_other
      ),
    },
    {
      label: l("其他语言", "Other Language"),
      value: volunteer.language_other?.trim() || "-",
    },
    {
      label: l("服务意向", "Volunteer Interests"),
      value: formatMultiValuesWithOther(
        volunteer.volunteer_interests,
        INTEREST_LABELS,
        volunteer.interest_other
      ),
    },
    {
      label: l("其他服务意向", "Other Interests"),
      value: volunteer.interest_other?.trim() || "-",
    },
    {
      label: l("平日可参与时间", "Weekday Availability"),
      value: formatMultiValues(volunteer.weekday_availability, TIME_LABELS),
    },
    {
      label: l("周末可参与时间", "Weekend Availability"),
      value: formatMultiValues(volunteer.weekend_availability, TIME_LABELS),
    },
    {
      label: l("每月可服务小时", "Hours per Month"),
      value: mapLabel(volunteer.monthly_hours, HOURS_LABELS),
    },
    {
      label: l("紧急联系人姓名", "Emergency Contact Name"),
      value: volunteer.emergency_name,
    },
    {
      label: l("关系", "Relationship"),
      value: volunteer.emergency_relation,
    },
    {
      label: l("紧急联系电话", "Emergency Contact Phone"),
      value: volunteer.emergency_phone,
    },
    {
      label: l("申请日期", "Apply Date"),
      value: volunteer.apply_date ?? "-",
    },
    {
      label: l("审核状态", "Review Status"),
      value: getStatusText(volunteer.status),
    },
    {
      label: l("信息真实性声明", "Information Accuracy Agreement"),
      value: volunteer.agree_truth ? l("是", "Yes") : l("否", "No"),
    },
    {
      label: l("无薪志愿服务声明", "Unpaid Volunteering Agreement"),
      value: volunteer.agree_unpaid ? l("是", "Yes") : l("否", "No"),
    },
    {
      label: l("行为守则声明", "Conduct Guidelines Agreement"),
      value: volunteer.agree_guidelines ? l("是", "Yes") : l("否", "No"),
    },
    {
      label: l("联系授权声明", "Contact Consent"),
      value: volunteer.agree_contact ? l("是", "Yes") : l("否", "No"),
    },
    {
      label: l("隐私声明同意", "Privacy Policy Agreement"),
      value: volunteer.agree_privacy ? l("是", "Yes") : l("否", "No"),
    },
  ];

  return (
    <div
      data-admin-volunteers="true"
      className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8"
    >
      <ProcessingOverlay
        state={processingState}
        title={processingTitle}
        message={processingMessage}
        onComplete={resetProcessing}
      />
      <div className="max-w-7xl mx-auto">
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

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-xl flex items-center justify-center">
              <HandHeart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[#2B5F9E]">
              {l("志愿者申请审核", "Volunteer Application Review")}
            </h1>
          </div>
          <p className="mt-2 text-gray-600">
            {l(
              "审核网站提交的志愿者申请并维护申请状态。",
              "Review volunteer applications submitted on the website and manage their status."
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={l(
                  "搜索志愿者（姓名、电话、邮箱、区域）...",
                  "Search volunteers (name, phone, email, suburb)..."
                )}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTER_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === status
                      ? "bg-[#2B5F9E] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {filterStatus === "rejected" && showRejectedNote && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 overflow-hidden"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 flex-1">
                {l(
                  "提示：被拒绝的志愿者申请建议在保留期后再删除，以便追踪审核历史。",
                  "Note: Keep rejected volunteer applications for a retention period before deletion to preserve review history."
                )}
              </p>
              <button
                onClick={() => setShowRejectedNote(false)}
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {loading && (
            <p className="text-gray-600 px-4 py-3">{t("common.loading")}</p>
          )}
          {error && (
            <p className="text-red-600 px-4 py-3" role="alert">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B5F9E] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">{l("姓名", "Name")}</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    {l("电话", "Phone")}
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    {l("邮箱", "Email")}
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    {l("申请日期", "Apply Date")}
                  </th>
                  <th className="px-4 py-3 text-left">{l("状态", "Status")}</th>
                  <th className="px-4 py-3 text-center">
                    {l("操作", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer, index) => (
                  <motion.tr
                    key={volunteer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div>{volunteer.name}</div>
                        <div className="text-sm text-gray-500">
                          {volunteer.suburb}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {volunteer.phone}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {volunteer.email}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {volunteer.apply_date ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(volunteer.status)}`}
                      >
                        {getStatusText(volunteer.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedVolunteer(volunteer)}
                          className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                          title={l("查看详情", "View details")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {volunteer.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                openConfirmDialog("approve", volunteer)
                              }
                              className="p-2 text-[#6BA868] hover:bg-[#6BA868] hover:text-white rounded-lg transition-colors"
                              title={l("通过", "Approve")}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                openConfirmDialog("reject", volunteer)
                              }
                              className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              title={l("拒绝", "Reject")}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {volunteer.status === "approved" && (
                          <button
                            onClick={() =>
                              openConfirmDialog("revoke", volunteer)
                            }
                            className="p-2 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-colors"
                            title={l("撤销通过", "Revoke approval")}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        {volunteer.status === "rejected" && (
                          <>
                            <button
                              onClick={() =>
                                openConfirmDialog("reopen", volunteer)
                              }
                              className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                              title={l("重新审核", "Reopen")}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                openConfirmDialog("delete", volunteer)
                              }
                              className="p-2 text-gray-500 hover:bg-gray-500 hover:text-white rounded-lg transition-colors"
                              title={l("删除记录", "Delete record")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredVolunteers.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                {l(
                  "没有找到符合条件的志愿者申请",
                  "No volunteer applications found"
                )}
              </div>
            )}
          </div>
        </motion.div>

        <AdminConfirmDialog
          open={Boolean(confirmDialog)}
          title={
            confirmDialog
              ? l(
                  {
                    approve: "确认通过志愿者申请",
                    reject: "确认拒绝志愿者申请",
                    revoke: "确认撤销通过状态",
                    reopen: "确认重新开启审核",
                    delete: "确认删除申请记录",
                  }[confirmDialog.type],
                  {
                    approve: "Confirm application approval",
                    reject: "Confirm application rejection",
                    revoke: "Confirm approval revocation",
                    reopen: "Confirm application reopen",
                    delete: "Confirm record deletion",
                  }[confirmDialog.type]
                )
              : ""
          }
          message={
            confirmDialog
              ? l(
                  {
                    approve: "确定要通过该志愿者申请吗？",
                    reject: "确定要拒绝该志愿者申请吗？",
                    revoke: "确定要将该申请状态改为已拒绝吗？",
                    reopen: "确定要将该申请状态改为待审核吗？",
                    delete: "确定要删除该志愿者申请记录吗？此操作无法撤销。",
                  }[confirmDialog.type],
                  {
                    approve: "Approve this volunteer application?",
                    reject: "Reject this volunteer application?",
                    revoke: "Move this application status to rejected?",
                    reopen: "Move this application status back to pending?",
                    delete:
                      "Delete this volunteer application record? This action cannot be undone.",
                  }[confirmDialog.type]
                )
              : ""
          }
          confirmLabel={l("确认", "Confirm")}
          cancelLabel={l("取消", "Cancel")}
          tone={
            confirmDialog &&
            ["delete", "revoke", "reject"].includes(confirmDialog.type)
              ? "danger"
              : "default"
          }
          onCancel={() => setConfirmDialog(null)}
          onConfirm={handleConfirm}
        />

        <AnimatePresence>
          {selectedVolunteer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedVolunteer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(event) => event.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="sticky top-0 bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl">
                      {l("志愿者申请详情", "Volunteer Application Details")}
                    </h2>
                    <button
                      onClick={() => setSelectedVolunteer(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {detailRows(selectedVolunteer).map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3"
                    >
                      <span className="text-gray-500">{row.label}</span>
                      <span className="text-gray-900 text-left sm:text-right break-words">
                        {row.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
