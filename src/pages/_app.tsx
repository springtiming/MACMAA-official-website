import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getFontFamilyCSS, getHeadingFontFamilyCSS } from "@/lib/fontLoader";

import "../index.css";
import "../styles/glass-buttons.css";
import "../styles/tabs-custom.css";
import "../styles/typography.css";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";

import "@fontsource/noto-serif-sc/chinese-simplified-600.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "@fontsource/noto-serif-sc/latin-600.css";
import "@fontsource/noto-serif-sc/latin-700.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // 设置正文字体
    document.documentElement.style.setProperty(
      "--app-font-family",
      getFontFamilyCSS()
    );
    // 设置标题字体
    document.documentElement.style.setProperty(
      "--app-heading-font-family",
      getHeadingFontFamilyCSS()
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [router.asPath]);

  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={router.asPath}>
              <Component {...pageProps} />
            </PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
