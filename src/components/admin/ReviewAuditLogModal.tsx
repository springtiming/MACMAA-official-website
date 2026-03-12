import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReviewAuditLogRecord } from "@/lib/supabaseApi";
import {
  getReviewActionLabel,
  getReviewStatusLabel,
  type ReviewLogLanguage,
  type ReviewLogModule,
} from "@/lib/reviewAuditLog";

type ReviewAuditLogModalProps = {
  open: boolean;
  title: string;
  module: ReviewLogModule;
  language: ReviewLogLanguage;
  logs: ReviewAuditLogRecord[];
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
};

function formatDateTime(iso: string, language: ReviewLogLanguage) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(language === "zh" ? "zh-CN" : "en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ReviewAuditLogModal({
  open,
  title,
  module,
  language,
  logs,
  loading = false,
  error = null,
  onClose,
}: ReviewAuditLogModalProps) {
  const emptyText =
    language === "zh" ? "暂无审核日志" : "No review logs available";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={language === "zh" ? "关闭" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loading && (
                <p className="text-gray-600">
                  {language === "zh" ? "加载中..." : "Loading..."}
                </p>
              )}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !error && logs.length === 0 && (
                <p className="text-gray-500">{emptyText}</p>
              )}

              {!loading &&
                !error &&
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50/60"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-[#2B5F9E]/10 text-[#2B5F9E]">
                        {getReviewActionLabel(log.action_type, language)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(log.reviewed_at, language)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-700">
                        <span className="text-gray-500">
                          {language === "zh" ? "操作人：" : "Operator: "}
                        </span>
                        {log.reviewed_by_username || "-"}
                      </p>
                      <p className="text-gray-700">
                        <span className="text-gray-500">
                          {language === "zh" ? "状态变更：" : "Status: "}
                        </span>
                        {getReviewStatusLabel(module, log.from_status, language)}{" "}
                        → {getReviewStatusLabel(module, log.to_status, language)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
