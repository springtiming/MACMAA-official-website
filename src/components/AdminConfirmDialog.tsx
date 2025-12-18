import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: "default" | "danger" | "success";
  icon?: LucideIcon;
};

const TONE_STYLES: Record<
  NonNullable<AdminConfirmDialogProps["tone"]>,
  { button: string; iconWrapper: string; iconColor: string }
> = {
  default: {
    button: "bg-[#6BA868] text-white hover:bg-[#5a9157]",
    iconWrapper: "bg-blue-50",
    iconColor: "text-[#2B5F9E]",
  },
  danger: {
    button: "bg-red-500 text-white hover:bg-red-600",
    iconWrapper: "bg-red-50",
    iconColor: "text-red-500",
  },
  success: {
    button: "bg-[#6BA868] text-white hover:bg-[#5a9157]",
    iconWrapper: "bg-green-50",
    iconColor: "text-green-600",
  },
};

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = "default",
  icon: Icon = AlertTriangle,
}: AdminConfirmDialogProps) {
  const styles = TONE_STYLES[tone];

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            style={{ borderRadius: "1.75rem" }}
          >
            <div className="flex justify-center mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${styles.iconWrapper}`}
              >
                <Icon className={`w-10 h-10 ${styles.iconColor}`} />
              </div>
            </div>

            <h3 className="text-gray-900 text-center mb-3 text-xl">{title}</h3>

            <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 rounded-xl transition-colors ${styles.button}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") {
    return dialog;
  }

  return createPortal(dialog, document.body);
}
