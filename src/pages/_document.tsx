import { Head, Html, Main, NextScript } from "next/document";
import { getFontFamilyCSS, getHeadingFontFamilyCSS } from "@/lib/fontLoader";
import {
  SPLASH_PRELOAD_MANIFEST,
  SPLASH_PRELOAD_STORAGE_KEY,
  SPLASH_PRELOAD_TTL_MS,
  SPLASH_READY_CLASS,
} from "@/lib/splashPreload";

export default function Document() {
  // 在 SSR 阶段写入字体 CSS 变量（正文/标题）
  const initialHeadCSS = `:root{--app-font-family:${getFontFamilyCSS()};--app-heading-font-family:${getHeadingFontFamilyCSS()};}
 html.${SPLASH_READY_CLASS} .vmca-loading-screen{display:none !important;}`;

  const setReadyClassScript = `(function () {
  try {
    if (!window.localStorage) return;
    var raw = window.localStorage.getItem(${JSON.stringify(SPLASH_PRELOAD_STORAGE_KEY)});
    if (!raw) return;
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.manifest !== "string" || typeof parsed.ts !== "number") return;
    if (parsed.manifest !== ${JSON.stringify(SPLASH_PRELOAD_MANIFEST)}) return;
    if (Date.now() - parsed.ts > ${SPLASH_PRELOAD_TTL_MS}) return;
    document.documentElement.classList.add(${JSON.stringify(SPLASH_READY_CLASS)});
  } catch (e) {
    // ignore
  }
})();`;

  return (
    <Html lang="zh">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: setReadyClassScript }} />
        <style dangerouslySetInnerHTML={{ __html: initialHeadCSS }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
