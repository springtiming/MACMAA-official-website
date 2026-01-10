import { Head, Html, Main, NextScript } from "next/document";
import { getFontFamilyCSS, getHeadingFontFamilyCSS } from "@/lib/fontLoader";

export default function Document() {
  // 只设置正文字体，标题字体由 next/font 通过 CSS 变量注入
  const initialHeadCSS = `:root{--app-font-family:${getFontFamilyCSS()};--app-heading-font-family:var(--font-noto-serif-sc, "Noto Serif SC"), ${getHeadingFontFamilyCSS()};}
html.vmca-has-visited .vmca-loading-screen{display:none !important;}`;

  const setVisitedClassScript = `(function () {
  try {
    if (
      window.localStorage &&
      window.localStorage.getItem("vmca_has_visited") === "true"
    ) {
      document.documentElement.classList.add("vmca-has-visited");
    }
  } catch (e) {
    // ignore
  }
})();`;

  return (
    <Html lang="zh">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: setVisitedClassScript }} />
        <style dangerouslySetInnerHTML={{ __html: initialHeadCSS }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
