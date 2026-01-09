import { motion } from "motion/react";
import {
  variantConfig,
  defaultSubtitles,
  type BrandLogoProps,
} from "./types";

/**
 * 品牌 Logo 组件
 * 显示 Logo 文字和副标题，带呼吸动画效果
 */
export function BrandLogo({
  text = "MACMAA",
  subtitle,
  language = "zh",
  variant = "brand",
  animate = true,
}: BrandLogoProps) {
  const config = variantConfig[variant];
  const displaySubtitle = subtitle ?? defaultSubtitles[language];
  const isDark = variant === "dark";

  return (
    <motion.div
      className="relative flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Logo 文字容器 */}
      <div className="text-center">
        {/* 主 Logo */}
        <motion.div
          className="font-bold tracking-[0.15em]"
          style={{
            fontSize: "clamp(3rem, 10vw, 4.5rem)",
            background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accentDark} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          animate={animate ? { opacity: [0.6, 1, 0.6] } : undefined}
          transition={
            animate
              ? { duration: 3, ease: "easeInOut", repeat: Infinity }
              : undefined
          }
        >
          {text}
        </motion.div>

        {/* 副标题 */}
        {displaySubtitle && (
          <div
            className="mt-3 text-sm font-light tracking-[0.15em]"
            style={{
              color: isDark ? "#9CA3AF" : config.accent,
              opacity: 0.7,
            }}
          >
            {displaySubtitle}
          </div>
        )}
      </div>

      {/* 水墨点缀 - 左侧 */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          left: "-64px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.accent}4d 0%, transparent 70%)`,
          filter: "blur(4px)",
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: [0, 0.3, 0], x: [-20, 0, 20] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />

      {/* 水墨点缀 - 右侧 */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: "-64px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.accent}40 0%, transparent 70%)`,
          filter: "blur(4px)",
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: [0, 0.3, 0], x: [20, 0, -20] }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2,
        }}
      />
    </motion.div>
  );
}
