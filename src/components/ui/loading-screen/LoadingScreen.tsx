import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { InkBackground } from "./InkBackground";
import { RippleRings } from "./RippleRings";
import { BrandLogo } from "./BrandLogo";
import { LoadingProgress } from "./LoadingProgress";
import { variantConfig, loadingTexts, type LoadingScreenProps } from "./types";

/**
 * 加载屏幕主组件
 *
 * 融合中国传统水墨美学与现代玻璃态设计的加载动画
 *
 * @example
 * ```tsx
 * // 基础用法 - 自动进度
 * <LoadingScreen onLoadComplete={() => setLoading(false)} />
 *
 * // 外部控制进度
 * <LoadingScreen progress={uploadProgress} onLoadComplete={handleComplete} />
 *
 * // 自定义样式
 * <LoadingScreen
 *   variant="dark"
 *   logoText="VMCA"
 *   subtitle="自定义副标题"
 *   language="en"
 * />
 * ```
 */
export function LoadingScreen({
  onLoadComplete,
  language = "zh",
  variant = "brand",
  logoText = "MACMAA",
  subtitle,
  showProgress = true,
  progress: externalProgress,
  className,
}: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const progress = externalProgress ?? internalProgress;
  const config = variantConfig[variant];

  // 自动进度逻辑（仅当没有外部进度控制时）
  useEffect(() => {
    if (externalProgress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 延迟触发完成回调，让动画完成
          setTimeout(() => {
            setIsLoaded(true);
            onLoadComplete?.();
          }, 500);
          return 100;
        }
        // 模拟真实加载：前期快（0-50%），后期慢（50-100%）
        const increment = prev < 50 ? Math.random() * 15 : Math.random() * 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [externalProgress, onLoadComplete]);

  // 外部进度达到 100% 时的处理
  useEffect(() => {
    if (
      externalProgress !== undefined &&
      externalProgress >= 100 &&
      !isLoaded
    ) {
      setTimeout(() => {
        setIsLoaded(true);
        onLoadComplete?.();
      }, 500);
    }
  }, [externalProgress, isLoaded, onLoadComplete]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${className ?? ""}`}
          style={{ background: config.bgGradient, zIndex: 9999 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* 水墨背景层 */}
          <InkBackground variant={variant} />

          {/* 扩散圆环动画 */}
          <RippleRings
            color={`${config.accent}33`}
            count={2}
            size={400}
            duration={3}
          />

          {/* 内容层 */}
          <div className="relative z-10 flex flex-col items-center gap-12 px-6">
            {/* Logo */}
            <BrandLogo
              text={logoText}
              subtitle={subtitle}
              language={language}
              variant={variant}
            />

            {/* 进度条 */}
            {showProgress && (
              <LoadingProgress
                progress={progress}
                variant={variant}
                loadingText={loadingTexts[language]}
                showPercentage
              />
            )}
          </div>

          {/* 底部装饰线 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.accent}4d, transparent)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
