/**
 * 字体加载器
 * 根据 fontConfig.ts 中的配置自动加载字体
 */

import { getCurrentFont } from "../config/fontConfig";

/**
 * 动态导入字体 CSS 文件
 * 这个方法会在应用启动时被调用
 */
export function loadFonts() {
  const currentFont = getCurrentFont();
  
  // 动态导入所有需要的字体 CSS 文件
  currentFont.cssImports.forEach((cssPath) => {
    // 使用动态 import 加载字体 CSS
    // 注意：这种方式在 Vite 中会正确处理 CSS 导入
    import(/* @vite-ignore */ cssPath).catch((err) => {
      console.warn(`Failed to load font CSS: ${cssPath}`, err);
    });
  });
}

/**
 * 获取当前字体的 CSS font-family 值
 * 用于在 CSS 变量中设置
 */
export function getFontFamilyCSS(): string {
  return getCurrentFont().family;
}
