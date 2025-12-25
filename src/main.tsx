import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import "./styles/glass-buttons.css";
import "./styles/tabs-custom.css";
// 导入字体（根据 fontConfig.ts 中的配置自动选择）
import "./lib/fontImports";
// 设置字体 CSS 变量
import { getFontFamilyCSS } from "./lib/fontLoader";

// 在 DOM 加载后设置字体 CSS 变量
document.documentElement.style.setProperty(
  "--app-font-family",
  getFontFamilyCSS()
);

createRoot(document.getElementById("root")!).render(<App />);
