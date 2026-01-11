/**
 * LoadingScreen 组件类型定义
 */

/** 样式变体 */
export type LoadingScreenVariant = "brand" | "minimal" | "dark";

/** 语言选项 */
export type LoadingLanguage = "zh" | "en";

/** 变体配置 */
export interface VariantConfig {
  accent: string;
  accentDark: string;
  bgGradient: string;
  inkOpacity: number;
}

/** LoadingScreen 主组件 Props */
export interface LoadingScreenProps {
  /** 加载完成回调 */
  onLoadComplete?: () => void;
  /** 语言 */
  language?: LoadingLanguage;
  /** 样式变体 */
  variant?: LoadingScreenVariant;
  /** 自定义 Logo 文字 */
  logoText?: string;
  /** 自定义副标题（覆盖默认） */
  subtitle?: string;
  /** 是否显示进度条 */
  showProgress?: boolean;
  /** 自定义进度（0-100），不传则自动模拟 */
  progress?: number;
  /** 自定义类名 */
  className?: string;
}

/** LoadingProgress 组件 Props */
export interface LoadingProgressProps {
  /** 进度值（0-100） */
  progress: number;
  /** 样式变体 */
  variant?: LoadingScreenVariant;
  /** 加载文字 */
  loadingText?: string;
  /** 是否显示百分比 */
  showPercentage?: boolean;
}

/** RippleRings 组件 Props */
export interface RippleRingsProps {
  /** 圆环颜色 */
  color?: string;
  /** 圆环数量 */
  count?: number;
  /** 圆环大小（px） */
  size?: number;
  /** 动画周期（秒） */
  duration?: number;
}

/** InkBackground 组件 Props */
export interface InkBackgroundProps {
  /** 样式变体 */
  variant?: LoadingScreenVariant;
}

/** BrandLogo 组件 Props */
export interface BrandLogoProps {
  /** Logo 文字 */
  text?: string;
  /** 副标题 */
  subtitle?: string;
  /** 语言 */
  language?: LoadingLanguage;
  /** 样式变体 */
  variant?: LoadingScreenVariant;
  /** 是否启用呼吸动画 */
  animate?: boolean;
}

/** 变体配置对象 */
export const variantConfig: Record<LoadingScreenVariant, VariantConfig> = {
  brand: {
    accent: "#2B5F9E",
    accentDark: "#1e4a7d",
    bgGradient: "linear-gradient(180deg, #FAF7F2 0%, #F5EFE6 100%)",
    inkOpacity: 0.3,
  },
  minimal: {
    accent: "#6B7280",
    accentDark: "#4B5563",
    bgGradient: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
    inkOpacity: 0.15,
  },
  dark: {
    accent: "#60A5FA",
    accentDark: "#3B82F6",
    bgGradient: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
    inkOpacity: 0.4,
  },
};

/** 默认副标题 */
export const defaultSubtitles: Record<LoadingLanguage, string> = {
  zh: "澳洲万年市华人互助会",
  en: "Manningham Chinese Mutual Aid Association",
};

/** 加载文字 */
export const loadingTexts: Record<LoadingLanguage, string> = {
  zh: "加载中",
  en: "Loading",
};
