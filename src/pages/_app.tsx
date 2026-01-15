import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  SPLASH_PRELOAD_IMAGES,
  SPLASH_PRELOAD_MANIFEST,
  SPLASH_PRELOAD_STORAGE_KEY,
  SPLASH_READY_CLASS,
  isSplashPreloadCacheValid,
  parseSplashPreloadCacheRecord,
} from "@/lib/splashPreload";

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

import "lxgw-wenkai-webfont/lxgwwenkai-regular.css";
import "lxgw-wenkai-webfont/lxgwwenkai-bold.css";

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

  // 初始状态设为 true：默认 SSR 先渲染开屏；若资源已就绪，会在客户端挂载后快速关闭（并在 _document.tsx 中提前隐藏）
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // 追踪开屏动画是否完全结束（包括淡出动画），用于触发首页渐入
  const [splashComplete, setSplashComplete] = useState(false);

  // 在客户端挂载后检查是否已缓存关键资源，并预加载首页首屏 + 轮播图 + 协会简介关键图片
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const record = parseSplashPreloadCacheRecord(
        window.localStorage?.getItem(SPLASH_PRELOAD_STORAGE_KEY) ?? null
      );
      if (isSplashPreloadCacheValid(record)) {
        document.documentElement.classList.add(SPLASH_READY_CLASS);
        setIsLoading(false);
        setLoadingProgress(100);
        setSplashComplete(true); // 缓存有效时直接完成
        return;
      }
    } catch {
      // Ignore storage access errors (e.g. privacy mode)
    }

    let cancelled = false;

    const total = SPLASH_PRELOAD_IMAGES.length;
    let loaded = 0;

    setLoadingProgress(0);

    const updateProgress = () => {
      if (cancelled) return;
      const next = Math.round((loaded / total) * 100);
      setLoadingProgress(next);
    };

    SPLASH_PRELOAD_IMAGES.forEach((src) => {
      preloadImage(src)
        .catch(() => {})
        .finally(() => {
          loaded += 1;
          updateProgress();
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const record = JSON.stringify({
          manifest: SPLASH_PRELOAD_MANIFEST,
          ts: Date.now(),
        });
        window.localStorage?.setItem(SPLASH_PRELOAD_STORAGE_KEY, record);
        document.documentElement.classList.add(SPLASH_READY_CLASS);
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
    // 等待 LoadingScreen 淡出动画完成后触发首页渐入
    setTimeout(() => {
      setSplashComplete(true);
    }, 650); // LoadingScreen exit 动画 0.6s + 50ms 缓冲
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [router.asPath]);

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading && (
        <LoadingScreen
          className="vmca-loading-screen"
          language={language}
          progress={loadingProgress}
          onLoadComplete={handleLoadComplete}
        />
      )}
      <motion.div
        className="flex flex-col min-h-screen"
        initial={{ opacity: 0, y: 12 }}
        animate={
          splashComplete
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 12 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={router.asPath}>
              <Component {...pageProps} />
            </PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
      </motion.div>
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
