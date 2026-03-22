import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../Header";
import { LanguageProvider } from "@/contexts/LanguageContext";

vi.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/membership",
  }),
}));

vi.mock("motion/react", () => {
  const passthrough = ({ children, ...props }: Record<string, unknown>) => {
    const {
      whileHover,
      whileTap,
      transition,
      initial,
      animate,
      exit,
      ...domProps
    } = props;
    void whileHover;
    void whileTap;
    void transition;
    void initial;
    void animate;
    void exit;

    return children ? (
      <span {...domProps}>{children as React.ReactNode}</span>
    ) : (
      <span {...domProps} />
    );
  };

  return {
    motion: {
      span: passthrough,
      div: passthrough,
      button: passthrough,
    },
  };
});

describe("Header", () => {
  it("uses the desktop flex layout with centered navigation in the header row", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    );

    expect(html).toContain("hidden md:flex flex-1 items-center justify-center");
  });
});
