/**
 * 字体加载器
 * 根据 fontConfig.ts 中的配置自动加载字体
 */

import { getCurrentFont, getCurrentHeadingFont } from "../config/fontConfig";

/**
 * 字体 CSS 加载
 *
 * Vite 版本使用动态 import 加载 @fontsource CSS。
 * Next.js 版本由 `src/pages/_app.tsx` 统一导入全局字体 CSS。
 */
export function loadFonts() {
  // no-op in Next.js
}

/**
 * 获取当前字体的 CSS font-family 值
 * 用于在 CSS 变量中设置
 */
export function getFontFamilyCSS(): string {
  return getCurrentFont().family;
}

/**
 * 获取当前标题字体的 CSS font-family 值
 * 用于在 CSS 变量中设置
 */
export function getHeadingFontFamilyCSS(): string {
  return getCurrentHeadingFont().family;
}
