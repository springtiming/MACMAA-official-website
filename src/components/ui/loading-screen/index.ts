/**
 * LoadingScreen 模块化组件
 *
 * 融合中国传统水墨美学与现代玻璃态设计的加载动画系统
 *
 * @example
 * ```tsx
 * import { LoadingScreen } from '@/components/ui/loading-screen';
 *
 * // 基础用法
 * <LoadingScreen onLoadComplete={() => setLoading(false)} />
 *
 * // 单独使用子组件
 * import { RippleRings, LoadingProgress } from '@/components/ui/loading-screen';
 *
 * <RippleRings color="rgba(0, 128, 0, 0.3)" count={3} />
 * <LoadingProgress progress={75} variant="dark" />
 * ```
 */

// 主组件
export { LoadingScreen } from "./LoadingScreen";

// 子组件（可单独使用）
export { InkBackground } from "./InkBackground";
export { RippleRings } from "./RippleRings";
export { BrandLogo } from "./BrandLogo";
export { LoadingProgress } from "./LoadingProgress";

// 类型和配置
export type {
  LoadingScreenProps,
  LoadingScreenVariant,
  LoadingLanguage,
  LoadingProgressProps,
  RippleRingsProps,
  InkBackgroundProps,
  BrandLogoProps,
  VariantConfig,
} from "./types";

export { variantConfig, defaultSubtitles, loadingTexts } from "./types";
