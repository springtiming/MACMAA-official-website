import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface FontOption {
  name: string;
  family: string;
  /** 原始 Google Fonts 对应的 family，用于调试展示 */
  originalFamily?: string;
  googleFontUrl: string;
  description: string;
  zhDescription: string;
}

const fonts: FontOption[] = [
  {
    name: "Inter",
    // 优先使用本地 VMCA Inter，回退到系统无衬线
    family: '"VMCA Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    originalFamily: "'Inter', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
    description:
      "Modern, professional, highly readable. Perfect for corporate and institutional websites.",
    zhDescription: "现代、专业、易读性强。适合企业和机构网站。",
  },
  {
    name: "Poppins",
    family: "'Poppins', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
    description:
      "Friendly and modern, with excellent readability. Great for community organizations.",
    zhDescription: "友好现代，可读性极佳。适合社区组织。",
  },
  {
    name: "Roboto",
    family: "'Roboto', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
    description:
      "Professional and reliable, widely used. Excellent for formal content.",
    zhDescription: "专业可靠，使用广泛。适合正式内容。",
  },
  {
    name: "Source Sans Pro",
    family: "'Source Sans Pro', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap",
    description:
      "Clear and professional, designed for user interfaces. Great for readability.",
    zhDescription: "清晰专业，专为界面设计。可读性极佳。",
  },
  {
    name: "Work Sans",
    family: "'Work Sans', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap",
    description:
      "Modern and friendly, designed for screens. Perfect balance of professionalism and warmth.",
    zhDescription: "现代友好，专为屏幕设计。专业与温暖的完美平衡。",
  },
  {
    name: "Lato",
    family: "'Lato', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
    description:
      "Elegant and professional, with a warm character. Ideal for community associations.",
    zhDescription: "优雅专业，带有温暖特质。适合社区协会。",
  },
  {
    name: "Noto Sans SC",
    // 优先使用本地 VMCA Noto Sans SC，回退到系统中文无衬线
    family:
      '"VMCA Noto Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
    originalFamily: "'Noto Sans SC', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap",
    description:
      "Modern Chinese font with excellent readability. Perfect for bilingual content.",
    zhDescription: "现代中文字体，可读性极佳。适合双语内容。",
  },
  {
    name: "Inter + Noto Sans SC",
    // 本地组合字体：英文 Inter + 中文 Noto Sans SC
    family:
      '"VMCA Inter Noto", "VMCA Inter", "VMCA Noto Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
    originalFamily: "'Inter', 'Noto Sans SC', sans-serif",
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap",
    description:
      "Combination of Inter (English) and Noto Sans SC (Chinese). Best for bilingual websites.",
    zhDescription: "Inter（英文）与思源黑体（中文）的组合。最适合双语网站。",
  },
];

export function FontShowcase() {
  const [selectedFont, setSelectedFont] = useState<FontOption | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [fontLoadStatus, setFontLoadStatus] = useState<
    Record<string, "loaded" | "unknown">
  >({});
  const [computedFamilies, setComputedFamilies] = useState<
    Record<string, string>
  >({});
  const sampleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const loadFonts = async () => {
      // 检查是否已经加载过
      const existingLinks = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      ).map((link) => (link as HTMLLinkElement).href);

      const promises = fonts.map((font) => {
        return new Promise<void>((resolve) => {
          // 如果已经加载过，直接返回
          const fontNameForUrl = font.name.replace(/\s+/g, "+");
          if (existingLinks.some((url) => url.includes(fontNameForUrl))) {
            resolve();
            return;
          }

          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = font.googleFontUrl;
          link.crossOrigin = "anonymous";
          link.onload = () => {
            // 检查字体是否真的可用
            if (document.fonts && document.fonts.check) {
              const fontName = font.family
                .split(",")[0]
                .replace(/'/g, "")
                .trim();
              const fontSpec = '16px "' + fontName + '"';
              const isLoaded = document.fonts.check(fontSpec);
              console.log(
                "Font " + font.name + " (" + fontName + ") loaded:",
                isLoaded
              );
            }
            resolve();
          };
          link.onerror = () => {
            console.error(`Failed to load font: ${font.name}`);
            resolve();
          };
          document.head.appendChild(link);
        });
      });

      await Promise.all(promises);

      // 等待字体真正加载完成
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
          // 检查所有字体，并记录加载状态
          const status: Record<string, "loaded" | "unknown"> = {};
          fonts.forEach((font) => {
            const fontName = font.family.split(",")[0].replace(/'/g, "").trim();
            const fontSpec = '16px "' + fontName + '"';
            const isAvailable =
              document.fonts && document.fonts.check
                ? document.fonts.check(fontSpec)
                : false;
            status[font.name] = isAvailable ? "loaded" : "unknown";
            console.log(
              "Font " + font.name + " available:",
              isAvailable,
              "Family:",
              font.family
            );
          });
          setFontLoadStatus(status);
        } catch (e) {
          console.warn("Font loading check failed:", e);
        }
      }

      // 额外等待确保字体渲染
      setTimeout(() => {
        setFontsReady(true);
        console.log(
          "All fonts loaded. Check browser DevTools > Elements > Computed to see applied fonts."
        );
      }, 1000);
    };

    loadFonts();
  }, []);

  // 在字体加载完成后，读取每个示例块的 computed font-family
  useEffect(() => {
    if (!fontsReady) return;
    const next: Record<string, string> = {};
    fonts.forEach((font) => {
      const el = sampleRefs.current[font.name];
      if (el) {
        const computed = window.getComputedStyle(el).fontFamily;
        next[font.name] = computed;
      }
    });
    setComputedFamilies(next);
  }, [fontsReady]);

  const handleSelectFont = (font: FontOption) => {
    setSelectedFont(font);
  };

  const sampleTexts = {
    title: {
      en: "Victoria Mandarin Chinese Association",
      zh: "维多利亚州华人协会",
    },
    subtitle: {
      en: "Building Community, Connecting Cultures",
      zh: "建设社区，连接文化",
    },
    paragraph: {
      en: "The Victoria Mandarin Chinese Association (VMCA) is dedicated to fostering cultural exchange, supporting community members, and organizing meaningful events that bring people together. We welcome everyone to join our vibrant community and participate in our diverse range of activities.",
      zh: "维多利亚州华人协会致力于促进文化交流，支持社区成员，组织有意义的活动，将人们聚集在一起。我们欢迎每个人加入我们充满活力的社区，参与我们多样化的活动。",
    },
    heading: {
      en: "Upcoming Events",
      zh: "即将举行的活动",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2B5F9E] mb-4">
            字体选择展示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            为协会网站选择合适的字体，体现专业、友好、现代的气质
          </p>
          {!fontsReady && (
            <p className="text-sm text-gray-500 mt-2">正在加载字体...</p>
          )}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-left max-w-3xl mx-auto">
            <p className="font-semibold mb-2">调试说明：</p>
            <p>
              本页为开发者提供字体调试能力。核心候选字体优先使用本地
              <code className="px-1 mx-1 rounded bg-yellow-100 border border-yellow-200">
                VMCA Inter / VMCA Noto Sans SC
              </code>
              ，确保在当前环境下能看出差异。
            </p>
            <p className="mt-2">
              如果某些卡片看起来仍然相同，可以：
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>查看卡片底部的“配置 font-family”与“实际生效”对比</li>
              <li>打开开发者工具（F12），在 Elements &gt; Computed 中查看 font-family</li>
              <li>检查控制台中的字体加载日志（document.fonts.check 结果）</li>
            </ol>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {fonts.map((font, index) => (
            <motion.div
              key={font.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
                selectedFont?.name === font.name
                  ? "ring-4 ring-[#2B5F9E] scale-105"
                  : "hover:shadow-xl"
              }`}
              onClick={() => handleSelectFont(font)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-[#2B5F9E]">
                  {font.name}
                </h3>
                {selectedFont?.name === font.name && (
                  <span className="px-3 py-1 bg-[#2B5F9E] text-white rounded-full text-sm">
                    已选择
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">{font.zhDescription}</p>
              <div
                className="space-y-3 border-t pt-4"
                style={
                  {
                    fontFamily: font.family,
                    isolation: "isolate",
                  } as React.CSSProperties
                }
                // 用于读取实际渲染的 font-family
                ref={(el) => {
                  sampleRefs.current[font.name] = el;
                }}
              >
                <div style={{ fontFamily: font.family } as React.CSSProperties}>
                  <p
                    className="text-xs text-gray-500 mb-1"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    标题示例
                  </p>
                  <h4
                    className="text-xl font-bold text-[#2B5F9E]"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    {sampleTexts.title.zh}
                  </h4>
                  <h4
                    className="text-lg font-semibold text-gray-700 mt-1"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    {sampleTexts.title.en}
                  </h4>
                </div>
                <div style={{ fontFamily: font.family } as React.CSSProperties}>
                  <p
                    className="text-xs text-gray-500 mb-1"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    副标题示例
                  </p>
                  <p
                    className="text-base text-gray-600"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    {sampleTexts.subtitle.zh} / {sampleTexts.subtitle.en}
                  </p>
                </div>
                <div style={{ fontFamily: font.family } as React.CSSProperties}>
                  <p
                    className="text-xs text-gray-500 mb-1"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    正文示例
                  </p>
                  <p
                    className="text-sm text-gray-700 leading-relaxed"
                    style={{ fontFamily: font.family } as React.CSSProperties}
                  >
                    {sampleTexts.paragraph.zh}
                  </p>
                </div>
                <div className="mt-3 rounded-md bg-gray-50 border border-dashed border-gray-200 p-3 text-xs text-gray-600 space-y-1">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-700">
                      配置 font-family:
                    </span>
                    <code className="px-1 rounded bg-white border border-gray-200">
                      {font.family}
                    </code>
                  </div>
                  {font.originalFamily && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <span className="font-semibold text-gray-700">
                        原始 Google Fonts:
                      </span>
                      <code className="px-1 rounded bg-white border border-gray-200">
                        {font.originalFamily}
                      </code>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-700">
                      实际生效:
                    </span>
                    <code className="px-1 rounded bg-white border border-gray-200">
                      {computedFamilies[font.name] || "（等待计算或不可用）"}
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      加载状态:
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                        fontLoadStatus[font.name] === "loaded"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {fontLoadStatus[font.name] === "loaded"
                        ? "已加载（document.fonts.check）"
                        : "未确认 / 本地字体可能回退"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-700">
                      Google Fonts:
                    </span>
                    <a
                      href={font.googleFontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2B5F9E] underline underline-offset-2 break-all"
                    >
                      打开字体配置链接
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedFont && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#2B5F9E]">
                完整预览：{selectedFont.name}
              </h2>
              <button
                onClick={() => setSelectedFont(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                清除选择
              </button>
            </div>

            <div
              className="space-y-8"
              style={{ fontFamily: selectedFont.family }}
            >
              <div
                className="border-b pb-6"
                style={{ fontFamily: selectedFont.family }}
              >
                <h1
                  className="text-5xl font-bold text-[#2B5F9E] mb-3"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.title.zh}
                </h1>
                <h2
                  className="text-3xl font-semibold text-gray-700 mb-4"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.title.en}
                </h2>
                <p
                  className="text-xl text-gray-600"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.subtitle.zh} / {sampleTexts.subtitle.en}
                </p>
              </div>

              <div style={{ fontFamily: selectedFont.family }}>
                <h3
                  className="text-2xl font-bold text-[#2B5F9E] mb-4"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.heading.zh}
                </h3>
                <p
                  className="text-lg text-gray-700 leading-relaxed mb-4"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.paragraph.zh}
                </p>
                <p
                  className="text-base text-gray-600 leading-relaxed"
                  style={{ fontFamily: selectedFont.family }}
                >
                  {sampleTexts.paragraph.en}
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t"
                style={{ fontFamily: selectedFont.family }}
              >
                <div>
                  <p
                    className="text-xs text-gray-500 mb-2"
                    style={{ fontFamily: selectedFont.family }}
                  >
                    字体粗细
                  </p>
                  <div className="space-y-2">
                    <p
                      className="font-light"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Light (300)
                    </p>
                    <p
                      className="font-normal"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Regular (400)
                    </p>
                    <p
                      className="font-medium"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Medium (500)
                    </p>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Semibold (600)
                    </p>
                    <p
                      className="font-bold"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Bold (700)
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs text-gray-500 mb-2"
                    style={{ fontFamily: selectedFont.family }}
                  >
                    字号大小
                  </p>
                  <div className="space-y-2">
                    <p
                      className="text-xs"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Extra Small (12px)
                    </p>
                    <p
                      className="text-sm"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Small (14px)
                    </p>
                    <p
                      className="text-base"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Base (16px)
                    </p>
                    <p
                      className="text-lg"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Large (18px)
                    </p>
                    <p
                      className="text-xl"
                      style={{ fontFamily: selectedFont.family }}
                    >
                      Extra Large (20px)
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs text-gray-500 mb-2"
                    style={{ fontFamily: selectedFont.family }}
                  >
                    应用场景
                  </p>
                  <div className="space-y-2 text-sm">
                    <p style={{ fontFamily: selectedFont.family }}>
                      ✓ 网站标题
                    </p>
                    <p style={{ fontFamily: selectedFont.family }}>
                      ✓ 正文内容
                    </p>
                    <p style={{ fontFamily: selectedFont.family }}>
                      ✓ 按钮文字
                    </p>
                    <p style={{ fontFamily: selectedFont.family }}>
                      ✓ 导航菜单
                    </p>
                    <p style={{ fontFamily: selectedFont.family }}>
                      ✓ 表单输入
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#2B5F9E] text-white rounded-xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold mb-4">推荐建议</h3>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong>最佳选择：</strong>Inter + Noto Sans SC 组合
            </p>
            <p>
              Inter 是专为屏幕设计的现代无衬线字体，在英文内容上表现优秀；Noto
              Sans SC 是 Google 开发的中文字体，与 Inter
              风格协调，适合双语网站。
            </p>
            <p>
              <strong>备选方案：</strong>Work Sans 或 Lato
            </p>
            <p>
              这两个字体在专业性和友好度之间取得了很好的平衡，适合社区协会的定位。
            </p>
          </div>
        </motion.div>

        {selectedFont && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 text-gray-100 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-white">应用方法</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-300 mb-2">
                  1. 在 index.html 中添加字体链接：
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {'<link rel="stylesheet" href="' +
                    selectedFont.googleFontUrl +
                    '" />'}
                </pre>
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  2. 在 src/index.css 中更新字体变量：
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {"--font-sans: " + selectedFont.family + ";"}
                </pre>
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  3. 或者在 Tailwind 配置中设置：
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                  {`fontFamily: {
  sans: [${selectedFont.family
    .split(",")
    .map((f) => f.trim())
    .join(", ")}],
}`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
