/**
 * 字体配置
 *
 * 要更换字体，只需修改 CURRENT_FONT 的值即可
 * 确保对应的字体包已通过 npm 安装
 */

export interface FontConfig {
  /** 字体名称（显示用） */
  name: string;
  /** CSS font-family 值 */
  family: string;
  /** 对应的 npm 包名（用于安装和导入） */
  npmPackage: string | string[];
  /** 需要导入的 CSS 文件路径（相对于 npm 包） */
  cssImports: string[];
  /** 字体描述 */
  description: string;
}

export interface HeadingFontConfig {
  /** 字体名称（显示用） */
  name: string;
  /** CSS font-family 值 */
  family: string;
  /** 字体描述 */
  description: string;
}

export const AVAILABLE_FONTS: Record<string, FontConfig> = {
  inter: {
    name: "Inter",
    family:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/inter",
    cssImports: [
      "@fontsource/inter/300.css",
      "@fontsource/inter/400.css",
      "@fontsource/inter/500.css",
      "@fontsource/inter/600.css",
      "@fontsource/inter/700.css",
    ],
    description: "现代、专业、易读性强。适合企业和机构网站。",
  },
  poppins: {
    name: "Poppins",
    family:
      "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/poppins",
    cssImports: [
      "@fontsource/poppins/300.css",
      "@fontsource/poppins/400.css",
      "@fontsource/poppins/500.css",
      "@fontsource/poppins/600.css",
      "@fontsource/poppins/700.css",
    ],
    description: "友好现代，可读性极佳。适合社区组织。",
  },
  roboto: {
    name: "Roboto",
    family:
      "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/roboto",
    cssImports: [
      "@fontsource/roboto/300.css",
      "@fontsource/roboto/400.css",
      "@fontsource/roboto/500.css",
      "@fontsource/roboto/700.css",
    ],
    description: "专业可靠，使用广泛。适合正式内容。",
  },
  sourceSansPro: {
    name: "Source Sans Pro",
    family:
      "'Source Sans Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/source-sans-pro",
    cssImports: [
      "@fontsource/source-sans-pro/300.css",
      "@fontsource/source-sans-pro/400.css",
      "@fontsource/source-sans-pro/600.css",
      "@fontsource/source-sans-pro/700.css",
    ],
    description: "清晰专业，专为界面设计。可读性极佳。",
  },
  workSans: {
    name: "Work Sans",
    family:
      "'Work Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/work-sans",
    cssImports: [
      "@fontsource/work-sans/300.css",
      "@fontsource/work-sans/400.css",
      "@fontsource/work-sans/500.css",
      "@fontsource/work-sans/600.css",
      "@fontsource/work-sans/700.css",
    ],
    description: "现代友好，专为屏幕设计。专业与温暖的完美平衡。",
  },
  lato: {
    name: "Lato",
    family:
      "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/lato",
    cssImports: [
      "@fontsource/lato/300.css",
      "@fontsource/lato/400.css",
      "@fontsource/lato/700.css",
    ],
    description: "优雅专业，带有温暖特质。适合社区协会。",
  },
  notoSansSC: {
    name: "Noto Sans SC",
    family:
      "'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: "@fontsource/noto-sans-sc",
    cssImports: [
      "@fontsource/noto-sans-sc/300.css",
      "@fontsource/noto-sans-sc/400.css",
      "@fontsource/noto-sans-sc/500.css",
      "@fontsource/noto-sans-sc/700.css",
    ],
    description: "现代中文字体，可读性极佳。适合双语内容。",
  },
  interNotoSansSC: {
    name: "Inter + Noto Sans SC",
    family:
      "'Inter', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    npmPackage: ["@fontsource/inter", "@fontsource/noto-sans-sc"],
    cssImports: [
      "@fontsource/inter/300.css",
      "@fontsource/inter/400.css",
      "@fontsource/inter/500.css",
      "@fontsource/inter/600.css",
      "@fontsource/inter/700.css",
      "@fontsource/noto-sans-sc/300.css",
      "@fontsource/noto-sans-sc/400.css",
      "@fontsource/noto-sans-sc/500.css",
      "@fontsource/noto-sans-sc/700.css",
    ],
    description: "Inter（英文）与 Noto Sans SC（中文）的组合。最适合双语网站。",
  },
};

/**
 * 当前使用的字体
 * 修改此值即可切换字体
 */
export const CURRENT_FONT: keyof typeof AVAILABLE_FONTS = "interNotoSansSC";

/**
 * 可用的标题字体配置
 */
export const AVAILABLE_HEADING_FONTS: Record<string, HeadingFontConfig> = {
  serif: {
    name: "衬线字体",
    family: "serif",
    description: "系统默认衬线字体",
  },
};

/**
 * 当前使用的标题字体
 * 修改此值即可切换标题字体
 */
export const CURRENT_HEADING_FONT: keyof typeof AVAILABLE_HEADING_FONTS =
  "serif";

/**
 * 获取当前字体配置
 */
export function getCurrentFont(): FontConfig {
  return AVAILABLE_FONTS[CURRENT_FONT];
}

/**
 * 获取当前标题字体配置
 */
export function getCurrentHeadingFont(): HeadingFontConfig {
  return AVAILABLE_HEADING_FONTS[CURRENT_HEADING_FONT];
}

/**
 * 获取所有可用字体列表
 */
export function getAvailableFonts(): FontConfig[] {
  return Object.values(AVAILABLE_FONTS);
}

/**
 * 获取所有可用标题字体列表
 */
export function getAvailableHeadingFonts(): HeadingFontConfig[] {
  return Object.values(AVAILABLE_HEADING_FONTS);
}
