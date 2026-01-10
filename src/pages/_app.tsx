import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
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

// 霞鹜文楷 - 标题字体
import "lxgw-wenkai-webfont/style.css";

// 需要预加载的关键图片（首页 hero 背景等）
const PRELOAD_IMAGES = ["/assets/hero.jpg"];

/**
 * 应用内部内容组件
 * 需要在 LanguageProvider 内部才能使用 useLanguage
 */
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { language } = useLanguage();

  // 仅首次访问时显示加载动画（使用 sessionStorage 记录）
  // 初始状态设为 true，避免 SSR 和客户端 hydration mismatch
  const [isLoading, setIsLoading] = useState(true);
  const imagesPreloadedRef = useRef(false);
  const animationCompleteRef = useRef(false);

  // 检查是否可以结束加载
  const tryFinishLoading = useCallback(() => {
    if (imagesPreloadedRef.current && animationCompleteRef.current) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hasVisited", "true");
      }
      setIsLoading(false);
    }
  }, []);

  // 在客户端挂载后检查是否已访问过，并预加载关键图片
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasVisited = sessionStorage.getItem("hasVisited");
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    // 预加载关键图片
    let loadedCount = 0;
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= PRELOAD_IMAGES.length) {
          imagesPreloadedRef.current = true;
          tryFinishLoading();
        }
      };
    });
  }, [tryFinishLoading]);

  const handleLoadComplete = useCallback(() => {
    animationCompleteRef.current = true;
    tryFinishLoading();
  }, [tryFinishLoading]);

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
  );
}

export default function App(props: AppProps) {
  return (
    <LanguageProvider>
      <AppContent {...props} />
    </LanguageProvider>
  );
}
