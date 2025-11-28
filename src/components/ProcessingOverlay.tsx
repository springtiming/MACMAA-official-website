import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export type ProcessingState = "idle" | "processing" | "success" | "error";

interface ProcessingOverlayProps {
  state: ProcessingState;
  title?: string;
  message?: string;
  onComplete?: () => void;
}

const statusConfig = {
  processing: {
    icon: Loader2,
    iconClass: "text-[#2B5F9E] animate-spin",
    bgClass: "bg-blue-50 border-blue-200",
    titleClass: "text-[#2B5F9E]",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-[#6BA868]",
    bgClass: "bg-green-50 border-green-200",
    titleClass: "text-[#6BA868]",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50 border-red-200",
    titleClass: "text-red-500",
  },
};

export function ProcessingOverlay({
  state,
  title,
  message,
  onComplete,
}: ProcessingOverlayProps) {
  // 处理结束后自动回调关闭
  useEffect(() => {
    if ((state === "success" || state === "error") && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, onComplete]);

  if (state === "idle") return null;

  const config = statusConfig[state];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/45 backdrop-blur-[6px] flex items-center justify-center p-4 z-[100]"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 18 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className={`${config.bgClass} border border-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.18)] rounded-[24px] w-[360px] max-w-[90vw] p-8`}
        >
          {/* 图标 */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 15 }}
          >
            <div className="relative">
              {state === "processing" && (
                <motion.div
                  className="absolute inset-0 bg-[#2B5F9E] rounded-full opacity-20 blur-[2px]"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.1, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <Icon className={`w-16 h-16 ${config.iconClass} relative z-10`} />

              {state === "success" && (
                <motion.div
                  className="absolute inset-0 border-4 border-[#6BA868] rounded-full"
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </motion.div>

          {/* 标题 */}
          {title && (
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${config.titleClass} text-center mb-3`}
            >
              {title}
            </motion.h3>
          )}

          {/* 消息 */}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-center text-sm"
            >
              {message}
            </motion.p>
          )}

          {/* 处理中的进度条 */}
          {state === "processing" && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-7 h-2 bg-blue-200/70 rounded-full overflow-hidden w-56 mx-auto"
            >
              <motion.div
                className="h-full bg-[#2B5F9E] rounded-full"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: "55%" }}
              />
            </motion.div>
          )}

          {/* 成功状态的进度条填充 */}
          {state === "success" && (
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
              className="mt-4"
            >
              <svg className="w-full h-2" viewBox="0 0 100 2">
                <motion.rect
                  x="0"
                  y="0"
                  width="100"
                  height="2"
                  fill="#6BA868"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
