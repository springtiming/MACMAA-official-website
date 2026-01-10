import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
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

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    if (typeof img.decode === "function") {
      img
        .decode()
        .catch(() => {})
        .finally(() => resolve());
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

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
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 在客户端挂载后检查是否已访问过，并预加载关键图片
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasVisited = sessionStorage.getItem("hasVisited");
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // 进度条：快速到 50%，然后放缓，最多到 90% 等待关键资源加载完成。
    const interval = window.setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = prev < 50 ? Math.random() * 15 : Math.random() * 5;
        return Math.min(prev + increment, 90);
      });
    }, 150);

    Promise.all(PRELOAD_IMAGES.map(preloadImage))
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        window.clearInterval(interval);
        setLoadingProgress(100);
      });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleLoadComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasVisited", "true");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [router.asPath]);

  // 条件渲染：加载动画完全覆盖屏幕，不显示 Header/Footer
  if (isLoading) {
    return (
      <LoadingScreen
        language={language}
        progress={loadingProgress}
        onLoadComplete={handleLoadComplete}
      />
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
