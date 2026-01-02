import { Head, Html, Main, NextScript } from "next/document";
import { getFontFamilyCSS } from "@/lib/fontLoader";

export default function Document() {
  // 只设置正文字体，标题字体由 next/font 通过 CSS 变量注入
  const initialFontVars = `:root{--app-font-family:${getFontFamilyCSS()};}`;

  return (
    <Html lang="zh">
      <Head>
        <style dangerouslySetInnerHTML={{ __html: initialFontVars }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
