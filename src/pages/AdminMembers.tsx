import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Eye,
  Check,
  X,
  UserX,
  Users,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Download,
} from "lucide-react";
import {
  ConcurrencyError,
  deleteMember,
  fetchMembers,
  updateMemberStatus,
  type MemberRecord,
} from "../lib/supabaseApi";
import { useLanguage } from "../contexts/LanguageContext";
import {
  ProcessingOverlay,
  type ProcessingState,
} from "../components/ProcessingOverlay";

type MemberFilter = "all" | "pending" | "approved" | "rejected";
const FILTER_OPTIONS: MemberFilter[] = ["all", "pending", "approved", "rejected"];

export function AdminMembers() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<MemberFilter>("all");
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [showRejectedNote, setShowRejectedNote] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "approve" | "reject" | "revoke" | "delete" | "reopen";
    member: MemberRecord;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [processingMessage, setProcessingMessage] = useState({ title: "", message: "" });

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
      setError(null);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        member.chinese_name.toLowerCase().includes(term) ||
        member.english_name.toLowerCase().includes(term) ||
        member.phone.includes(searchTerm) ||
        (member.email ?? "").toLowerCase().includes(term);
      const matchesStatus = filterStatus === "all" || member.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, filterStatus]);

  const openConfirmDialog = (
    type: "approve" | "reject" | "revoke" | "delete" | "reopen",
    member: MemberRecord
  ) => setConfirmDialog({ type, member });

  const getProcessingMessages = (
    type: "approve" | "reject" | "revoke" | "delete" | "reopen",
    member: MemberRecord
  ) => {
    const name = member.chinese_name || member.english_name;
    const zh = {
      approve: {
        processingTitle: "正在审核通过...",
        processingMessage: `正在处理 ${name} 的会员申请`,
        successTitle: "审核成功",
        successMessage: `${name} 已成为正式会员`,
        errorTitle: "审核失败",
        errorMessage: "操作失败，请重试",
      },
      reject: {
        processingTitle: "正在拒绝申请...",
        processingMessage: `正在处理 ${name} 的申请`,
        successTitle: "已拒绝申请",
        successMessage: `已拒绝 ${name} 的会员申请`,
        errorTitle: "操作失败",
        errorMessage: "操作失败，请重试",
      },
      revoke: {
        processingTitle: "正在撤销会员资格...",
        processingMessage: `正在撤销 ${name} 的会员资格`,
        successTitle: "已撤销会员资格",
        successMessage: `已撤销 ${name} 的会员资格`,
        errorTitle: "操作失败",
        errorMessage: "操作失败，请重试",
      },
      reopen: {
        processingTitle: "正在重新开启申请...",
        processingMessage: `正在重新开启 ${name} 的申请`,
        successTitle: "已重新开启",
        successMessage: `${name} 的申请已重新开启`,
        errorTitle: "操作失败",
        errorMessage: "操作失败，请重试",
      },
      delete: {
        processingTitle: "正在删除记录...",
        processingMessage: `正在删除 ${name} 的记录`,
        successTitle: "删除成功",
        successMessage: `已删除 ${name} 的记录`,
        errorTitle: "删除失败",
        errorMessage: "操作失败，请重试",
      },
    };

    const en = {
      approve: {
        processingTitle: "Approving...",
        processingMessage: `Processing application for ${name}`,
        successTitle: "Approved successfully",
        successMessage: `${name} is now an official member`,
        errorTitle: "Approval failed",
        errorMessage: "Operation failed, please try again",
      },
      reject: {
        processingTitle: "Rejecting...",
        processingMessage: `Processing application for ${name}`,
        successTitle: "Application rejected",
        successMessage: `Application for ${name} has been rejected`,
        errorTitle: "Operation failed",
        errorMessage: "Operation failed, please try again",
      },
      revoke: {
        processingTitle: "Revoking membership...",
        processingMessage: `Revoking membership for ${name}`,
        successTitle: "Membership revoked",
        successMessage: `Membership for ${name} has been revoked`,
        errorTitle: "Operation failed",
        errorMessage: "Operation failed, please try again",
      },
      reopen: {
        processingTitle: "Reopening application...",
        processingMessage: `Reopening application for ${name}`,
        successTitle: "Application reopened",
        successMessage: `Application for ${name} has been reopened`,
        errorTitle: "Operation failed",
        errorMessage: "Operation failed, please try again",
      },
      delete: {
        processingTitle: "Deleting record...",
        processingMessage: `Deleting record for ${name}`,
        successTitle: "Deleted successfully",
        successMessage: `Record for ${name} has been deleted`,
        errorTitle: "Deletion failed",
        errorMessage: "Operation failed, please try again",
      },
    };

    return language === "zh" ? zh[type] : en[type];
  };

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    const { type, member } = confirmDialog;
    setConfirmDialog(null);

    const messages = getProcessingMessages(type, member);
    setProcessingState("processing");
    setProcessingMessage({
      title: messages.processingTitle,
      message: messages.processingMessage,
    });

    try {
      if (type === "delete") {
        await deleteMember(member.id);
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        if (selectedMember?.id === member.id) setSelectedMember(null);
      } else {
        const nextStatus =
          type === "approve"
            ? "approved"
            : type === "reject" || type === "revoke"
              ? "rejected"
              : "pending";
        const updated = await updateMemberStatus(
          member.id,
          nextStatus as MemberRecord["status"],
          {
            expectedStatus: member.status,
            expectedUpdatedAt: member.updated_at,
          }
        );
        setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
        if (selectedMember?.id === member.id) setSelectedMember(updated);
      }

      setProcessingState("success");
      setProcessingMessage({
        title: messages.successTitle,
        message: messages.successMessage,
      });
    } catch (err) {
      if (err instanceof ConcurrencyError) {
        setError(
          language === "zh"
            ? "该申请已被其他管理员更新，列表已刷新，请重试。"
            : "This application was updated by another admin. List refreshed, please try again."
        );
        await loadMembers();
      } else {
        setError(t("common.error"));
      }
      setProcessingState("error");
      setProcessingMessage({
        title: messages.errorTitle,
        message: messages.errorMessage,
      });
    }
  };

  const handleExportToCsv = () => {
    const headers = [
      t("admin.members.detail.chineseName"),
      t("admin.members.detail.englishName"),
      t("admin.members.detail.gender"),
      t("admin.members.detail.birthday"),
      t("admin.members.detail.phone"),
      t("admin.members.detail.email"),
      t("admin.members.detail.address"),
      t("admin.members.detail.emergency"),
      t("admin.members.detail.emergencyPhone"),
      t("admin.members.detail.emergencyRelation"),
      t("admin.members.table.applyDate"),
      t("admin.members.table.status"),
    ];
    const rows = filteredMembers.map((m) => [
      m.chinese_name,
      m.english_name,
      t(`membership.form.${m.gender}`),
      m.birthday ?? "",
      m.phone,
      m.email ?? "",
      m.address,
      m.emergency_name ?? "",
      m.emergency_phone ?? "",
      m.emergency_relation ?? "",
      m.apply_date ?? "",
      t(`admin.members.${m.status}`),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MACMAA_Members_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => t(`admin.members.${status}`);

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      <ProcessingOverlay
        state={processingState}
        title={processingMessage.title}
        message={processingMessage.message}
        onComplete={() => setProcessingState("idle")}
      />
      <div className="max-w-7xl mx-auto">
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#2B5F9E]">{t("admin.members.title")}</h1>
            </div>

            <motion.button
              onClick={handleExportToCsv}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-5 h-5" />
              <span>{t("admin.members.export")}</span>
            </motion.button>
          </div>
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
                placeholder={t("admin.members.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  {t(`admin.members.${status}`)}
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
                {t("admin.members.rejectedNote")}
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
          {loading && <p className="text-gray-600 px-4 py-3">{t("common.loading")}</p>}
          {error && (
            <p className="text-red-600 px-4 py-3" role="alert">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B5F9E] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">{t("admin.members.table.name")}</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    {t("admin.members.table.phone")}
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    {t("admin.members.table.email")}
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    {t("admin.members.table.applyDate")}
                  </th>
                  <th className="px-4 py-3 text-left">{t("admin.members.table.status")}</th>
                  <th className="px-4 py-3 text-center">{t("admin.members.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div>{member.chinese_name}</div>
                        <div className="text-sm text-gray-500">{member.english_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{member.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {member.email || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{member.apply_date ?? ""}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                          title={t("admin.members.view")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {member.status === "pending" && (
                          <>
                            <button
                              onClick={() => openConfirmDialog("approve", member)}
                              className="p-2 text-[#6BA868] hover:bg-[#6BA868] hover:text-white rounded-lg transition-colors"
                              title={t("admin.members.approve")}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog("reject", member)}
                              className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              title={t("admin.members.reject")}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {member.status === "approved" && (
                          <button
                            onClick={() => openConfirmDialog("revoke", member)}
                            className="p-2 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-colors"
                            title={t("admin.members.revoke")}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        {member.status === "rejected" && (
                          <>
                            <button
                              onClick={() => openConfirmDialog("reopen", member)}
                              className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                              title={t("admin.members.reopen")}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog("delete", member)}
                              className="p-2 text-gray-500 hover:bg-gray-500 hover:text-white rounded-lg transition-colors"
                              title={t("admin.members.delete")}
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

            {filteredMembers.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                {language === "zh" ? "没有找到符合条件的会员" : "No members found"}
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirm Dialog */}
        <AnimatePresence>
          {confirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setConfirmDialog(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                style={{ borderRadius: "1.75rem" }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  {(() => {
                    const isDestructive =
                      confirmDialog.type === "delete" ||
                      confirmDialog.type === "revoke" ||
                      confirmDialog.type === "reject";
                    return (
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          isDestructive ? "bg-red-50" : "bg-blue-50"
                        }`}
                      >
                        <AlertTriangle
                          className={`w-10 h-10 ${
                            isDestructive ? "text-red-500" : "text-amber-500"
                          }`}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Title */}
                <h3 className="text-gray-900 text-center mb-3">
                  {t(`admin.members.confirm.${confirmDialog.type}.title`)}
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
                  {t(`admin.members.confirm.${confirmDialog.type}.message`)}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("admin.members.confirm.cancel")}
                  </motion.button>
                  <motion.button
                    onClick={handleConfirm}
                    className={`flex-1 px-6 py-3 rounded-xl transition-colors ${
                      confirmDialog.type === "delete" ||
                      confirmDialog.type === "revoke" ||
                      confirmDialog.type === "reject"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-[#6BA868] text-white hover:bg-[#5a9157]"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("admin.members.confirm.confirm")}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden dlex flex-col"
              >
                <div className="sticky top-0 bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl">
                      {t("admin.members.detail.title")}
                    </h2>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {[
                    {
                      label: t("admin.members.detail.chineseName"),
                      value: selectedMember.chinese_name,
                    },
                    {
                      label: t("admin.members.detail.englishName"),
                      value: selectedMember.english_name,
                    },
                    {
                      label: t("admin.members.detail.gender"),
                      value: t(`membership.form.${selectedMember.gender}`),
                    },
                    {
                      label: t("admin.members.detail.birthday"),
                      value: selectedMember.birthday ?? "",
                    },
                    {
                      label: t("admin.members.detail.phone"),
                      value: selectedMember.phone,
                    },
                    {
                      label: t("admin.members.detail.email"),
                      value: selectedMember.email ?? "",
                    },
                    {
                      label: t("admin.members.detail.address"),
                      value: selectedMember.address,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-gray-900">{item.value || "-"}</span>
                    </div>
                  ))}

                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500">
                        {t("admin.members.detail.emergency")}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          {t("admin.members.detail.emergency")}
                        </span>
                        <span className="text-gray-900">
                          {selectedMember.emergency_name ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          {t("admin.members.detail.emergencyPhone")}
                        </span>
                        <span className="text-gray-900">
                          {selectedMember.emergency_phone ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          {t("admin.members.detail.emergencyRelation")}
                        </span>
                        <span className="text-gray-900">
                          {selectedMember.emergency_relation ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {t("admin.members.table.applyDate")}
                    </span>
                    <span className="text-gray-900">
                      {selectedMember.apply_date ?? ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {t("admin.members.table.status")}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(selectedMember.status)}`}>
                      {getStatusText(selectedMember.status)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
