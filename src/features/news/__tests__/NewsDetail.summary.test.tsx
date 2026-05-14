import React from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NewsDetail } from "../NewsDetail";
import type { NewsPostRecord } from "@/lib/supabaseApi";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: { id: "news-1" },
  }),
}));

vi.mock("motion/react", () => {
  const passthrough = ({ children, ...props }: Record<string, unknown>) => {
    const {
      initial,
      animate,
      exit,
      whileHover,
      whileTap,
      transition,
      ...domProps
    } = props;
    void initial;
    void animate;
    void exit;
    void whileHover;
    void whileTap;
    void transition;

    return <div {...domProps}>{children as React.ReactNode}</div>;
  };

  const button = ({ children, ...props }: Record<string, unknown>) => {
    const { whileHover, whileTap, transition, ...domProps } = props;
    void whileHover;
    void whileTap;
    void transition;

    return <button {...domProps}>{children as React.ReactNode}</button>;
  };

  return {
    motion: {
      div: passthrough,
      button,
    },
  };
});

vi.mock("@/components/figma/ImageWithFallback", () => ({
  ImageWithFallback: ({ src, alt, className }: Record<string, string>) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

const longEnglishSummary =
  "asdsdsadasdsadsaddsadsadsdsaasdsadsadssdsadsadsdsadadasdsdsdasdsdsadsdsadsdsadsadsdsdsdsa";

const news: NewsPostRecord = {
  id: "news-1",
  title_zh: "测试新闻",
  title_en: "Test News",
  summary_zh: null,
  summary_en: longEnglishSummary,
  content_zh: "<p>内容</p>",
  content_en: "<p>Content</p>",
  cover_source: null,
  cover_type: null,
  cover_keyword: null,
  cover_url: null,
  published_at: "2026-05-07T00:00:00.000Z",
  published: true,
  author_id: null,
};

describe("NewsDetail summary", () => {
  it("allows long English summaries without whitespace to wrap inside the card", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <NewsDetail initialNews={news} />
      </LanguageProvider>
    );

    expect(html).toContain(longEnglishSummary);
    expect(html).toContain("news-summary-text");

    const css = readFileSync(
      path.resolve(process.cwd(), "src/index.css"),
      "utf8"
    );
    expect(css).toContain(".news-summary-text");
    expect(css).toContain("overflow-wrap: anywhere");
  });

  it("keeps article images aligned to the same readable width as videos", () => {
    const css = readFileSync(
      path.resolve(process.cwd(), "src/index.css"),
      "utf8"
    );

    expect(css).toMatch(
      /\.news-content img\s*{[^}]*width:\s*85%;[^}]*max-width:\s*85%;[^}]*margin:\s*1rem auto;/s
    );
    expect(css).toMatch(
      /@media \(min-width:\s*1024px\)\s*{[^}]*\.news-content img,[^}]*width:\s*80%;[^}]*max-width:\s*80%;/s
    );
  });
});
