import { Head, Html, Main, NextScript } from "next/document";
import { getFontFamilyCSS, getHeadingFontFamilyCSS } from "@/lib/fontLoader";

export default function Document() {
  const initialFontVars = `:root{--app-font-family:${getFontFamilyCSS()};--app-heading-font-family:${getHeadingFontFamilyCSS()};}`;

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
