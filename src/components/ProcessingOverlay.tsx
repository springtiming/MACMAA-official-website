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

type NonIdleState = Exclude<ProcessingState, "idle">;

type StatusConfig = {
  icon?: typeof Loader2;
  iconClass?: string;
  titleClass: string;
  accent: string;
  borderGradient: string;
  cardBackground: string;
  cardShadow: string;
  progressTrack?: string;
  progressFill?: string;
};

const statusConfig: Record<NonIdleState, StatusConfig> = {
  processing: {
    icon: Loader2,
    iconClass: "",
    titleClass: "text-[#2B5F9E]",
    accent: "#2B5F9E",
    borderGradient:
      "linear-gradient(135deg, rgba(43,95,158,0.65), rgba(149,181,231,0.4))",
    cardBackground: "linear-gradient(160deg, #F7FAFF 0%, #E8F0FF 100%)",
    cardShadow: "0 35px 90px rgba(43,95,158,0.35)",
    progressTrack:
      "linear-gradient(90deg, rgba(216,229,255,0.9), rgba(189,213,255,0.8))",
    progressFill:
      "linear-gradient(90deg, rgba(85,140,214,1), rgba(29,76,148,1))",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-[#4C9A46]",
    titleClass: "text-[#4C9A46]",
    accent: "#4C9A46",
    borderGradient:
      "linear-gradient(135deg, rgba(107,168,104,0.8), rgba(186,223,176,0.5))",
    cardBackground: "linear-gradient(160deg, #F5FFF4 0%, #E8F6E5 100%)",
    cardShadow: "0 35px 90px rgba(76,154,70,0.3)",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-[#D64545]",
    titleClass: "text-[#D64545]",
    accent: "#D64545",
    borderGradient:
      "linear-gradient(135deg, rgba(214,69,69,0.8), rgba(245,169,169,0.5))",
    cardBackground: "linear-gradient(160deg, #FFF5F5 0%, #FDE8E8 100%)",
    cardShadow: "0 35px 90px rgba(214,69,69,0.28)",
  },
};

const ProcessingSpinner = ({ accent }: { accent: string }) => (
  <div className="relative flex items-center justify-center">
    <motion.span
      className="absolute w-24 h-24 rounded-full bg-white/45 blur-2xl"
      animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.1, 0.95] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.svg
      width="76"
      height="76"
      viewBox="0 0 76 76"
      className="relative drop-shadow-[0_20px_40px_rgba(43,95,158,0.35)]"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="38"
        cy="38"
        r="28"
        fill="none"
        stroke="rgba(43,95,158,0.15)"
        strokeWidth="8"
      />
      <motion.circle
        cx="38"
        cy="38"
        r="28"
        fill="none"
        stroke={accent}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="140 80"
        animate={{ strokeDashoffset: [0, -220] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  </div>
);

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
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 1, opacity: 1, y: 0 }}
          animate={
            state === "processing"
              ? { scale: [0.98, 1, 0.98], opacity: 1, y: [-4, 0, -4] }
              : { scale: 1, opacity: 1, y: 0 }
          }
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={
            state === "processing"
              ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", damping: 25, stiffness: 300 }
          }
          className="w-full"
          style={{ maxWidth: "24rem" }}
        >
          <div
            className="rounded-[30px] p-[1.5px]"
            style={{
              background: config.borderGradient,
              boxShadow: config.cardShadow,
            }}
          >
            <div
              className="rounded-[28px] px-8 py-8"
              style={{ background: config.cardBackground }}
            >
              {/* 图标 / 动画 */}
              <motion.div
                className="flex justify-center mb-6"
                initial={false}
              >
                <div className="relative flex items-center justify-center">
                  {state === "processing" ? (
                    <ProcessingSpinner accent={config.accent} />
                  ) : (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.45)",
                          filter: "blur(8px)",
                        }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {Icon && (
                        <Icon
                          className={`w-16 h-16 ${config.iconClass} relative z-10`}
                        />
                      )}
                      {state === "success" && (
                        <motion.div
                          className="absolute inset-0 border-[6px] rounded-full"
                          style={{ borderColor: config.accent }}
                          initial={{ scale: 1.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.8 }}
                          transition={{ duration: 0.35 }}
                        />
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* 标题 */}
              {title && (
                <motion.h3
                  initial={false}
                  className={`${config.titleClass} text-center mb-3 font-semibold`}
                >
                  {title}
                </motion.h3>
              )}

              {/* 消息 */}
              {message && (
                <motion.p
                  initial={false}
                  className="text-gray-600 text-center text-sm"
                >
                  {message}
                </motion.p>
              )}

              {/* 处理中的进度条 */}
              {state === "processing" && (
                <motion.div
                  initial={false}
                  className="mt-6 h-2 rounded-full relative overflow-hidden"
                  style={{ background: config.progressTrack }}
                >
                  <motion.span
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      background: config.progressFill,
                      width: "45%",
                    }}
                    animate={{ x: ["0%", "55%", "0%"] }}
                    transition={{
                      duration: 1.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              )}

              {/* 成功状态的进度条填充 */}
              {state === "success" && (
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.125, ease: "easeInOut" }}
                  className="mt-4"
                >
                  <svg className="w-full h-2" viewBox="0 0 100 2">
                    <motion.rect
                      x="0"
                      y="0"
                      width="100"
                      height="2"
                      fill={config.accent}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
