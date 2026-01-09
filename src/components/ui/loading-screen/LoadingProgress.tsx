import { motion } from "motion/react";
import { variantConfig, type LoadingProgressProps } from "./types";

/**
 * 加载进度条组件
 * 显示加载进度和百分比
 */
export function LoadingProgress({
  progress,
  variant = "brand",
  loadingText = "加载中",
  showPercentage = true,
}: LoadingProgressProps) {
  const config = variantConfig[variant];
  const isDark = variant === "dark";

  return (
    <motion.div
      className="w-full"
      style={{ maxWidth: "clamp(256px, 80vw, 320px)" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      {/* 加载文字 */}
      <motion.p
        className="mb-4 text-center text-sm font-light"
        style={{
          color: isDark ? "#9CA3AF" : config.accent,
          opacity: 0.6,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {loadingText}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.p>

      {/* 进度条容器 */}
      <div
        className="relative h-1 rounded-full overflow-hidden"
        style={{
          background: isDark ? `${config.accent}26` : `${config.accent}1a`,
        }}
      >
        {/* 进度条填充 */}
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${config.accent}, ${config.accentDark})`,
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* 百分比显示 */}
      {showPercentage && (
        <motion.div
          className="mt-3 text-center text-xs font-light tabular-nums tracking-wide"
          style={{
            color: isDark ? "#9CA3AF" : config.accent,
            opacity: 0.6,
          }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </motion.div>
  );
}
