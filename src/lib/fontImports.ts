/**
 * 字体导入文件
 *
 * 根据 src/config/fontConfig.ts 中的 CURRENT_FONT 配置
 * 自动导入对应的字体 CSS 文件
 *
 * 要更换字体：
 * 1. 修改 src/config/fontConfig.ts 中的 CURRENT_FONT 值
 * 2. 确保对应的字体包已通过 npm 安装
 * 3. 重新启动开发服务器
 *
 * 注意：由于 TypeScript 的限制，这里使用条件导入
 * 只有当前选中的字体会被实际加载
 */

import { CURRENT_FONT } from "../config/fontConfig";

// 动态导入字体 CSS 的函数
async function loadFonts() {
  switch (CURRENT_FONT) {
    case "inter":
      await Promise.all([
        import("@fontsource/inter/300.css"),
        import("@fontsource/inter/400.css"),
        import("@fontsource/inter/500.css"),
        import("@fontsource/inter/600.css"),
        import("@fontsource/inter/700.css"),
      ]);
      break;
    case "poppins":
      await Promise.all([
        import("@fontsource/poppins/300.css"),
        import("@fontsource/poppins/400.css"),
        import("@fontsource/poppins/500.css"),
        import("@fontsource/poppins/600.css"),
        import("@fontsource/poppins/700.css"),
      ]);
      break;
    case "roboto":
      await Promise.all([
        import("@fontsource/roboto/300.css"),
        import("@fontsource/roboto/400.css"),
        import("@fontsource/roboto/500.css"),
        import("@fontsource/roboto/700.css"),
      ]);
      break;
    case "sourceSansPro":
      await Promise.all([
        import("@fontsource/source-sans-pro/300.css"),
        import("@fontsource/source-sans-pro/400.css"),
        import("@fontsource/source-sans-pro/600.css"),
        import("@fontsource/source-sans-pro/700.css"),
      ]);
      break;
    case "workSans":
      await Promise.all([
        import("@fontsource/work-sans/300.css"),
        import("@fontsource/work-sans/400.css"),
        import("@fontsource/work-sans/500.css"),
        import("@fontsource/work-sans/600.css"),
        import("@fontsource/work-sans/700.css"),
      ]);
      break;
    case "lato":
      await Promise.all([
        import("@fontsource/lato/300.css"),
        import("@fontsource/lato/400.css"),
        import("@fontsource/lato/700.css"),
      ]);
      break;
    case "notoSansSC":
      await Promise.all([
        import("@fontsource/noto-sans-sc/300.css"),
        import("@fontsource/noto-sans-sc/400.css"),
        import("@fontsource/noto-sans-sc/500.css"),
        import("@fontsource/noto-sans-sc/700.css"),
      ]);
      break;
    case "interNotoSansSC":
      await Promise.all([
        import("@fontsource/inter/300.css"),
        import("@fontsource/inter/400.css"),
        import("@fontsource/inter/500.css"),
        import("@fontsource/inter/600.css"),
        import("@fontsource/inter/700.css"),
        import("@fontsource/noto-sans-sc/300.css"),
        import("@fontsource/noto-sans-sc/400.css"),
        import("@fontsource/noto-sans-sc/500.css"),
        import("@fontsource/noto-sans-sc/700.css"),
      ]);
      break;
  }
}

// 立即执行字体加载
loadFonts().catch((err) => {
  console.error("Failed to load fonts:", err);
});
