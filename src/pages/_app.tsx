import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Noto_Serif_SC } from "next/font/google";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { LoadingScreen } from "@/components/ui/loading-screen";

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

// 使用 next/font 预加载标题字体，减少因字体加载带来的闪烁/替换
// Next.js 要求 preload 时声明 subsets；`Noto Serif SC` 仅提供 `latin`（中文仍按 unicode-range 加载）
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "optional",
  preload: true,
  variable: "--font-noto-serif-sc",
});

/**
 * 应用内部内容组件
 * 需要在 LanguageProvider 内部才能使用 useLanguage
 */
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { language } = useLanguage();

  // 仅首次访问时显示加载动画（使用 sessionStorage 记录）
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("hasVisited");
  });

  const handleLoadComplete = () => {
    sessionStorage.setItem("hasVisited", "true");
    setIsLoading(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [router.asPath]);

  // 条件渲染：加载动画完全覆盖屏幕，不显示 Header/Footer
  if (isLoading) {
    return (
      <LoadingScreen language={language} onLoadComplete={handleLoadComplete} />
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${notoSerifSC.variable}`}>
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
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <AppContent {...props} />
    </LanguageProvider>
  );
}
