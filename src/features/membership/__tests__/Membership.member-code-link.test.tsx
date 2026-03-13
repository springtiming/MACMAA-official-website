import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Membership } from "../Membership";

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
    AnimatePresence: passthrough,
    motion: {
      div: passthrough,
      button: passthrough,
    },
  };
});

describe("Membership agreement section", () => {
  it("renders a dedicated member code trigger link in agree2 text", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Membership />
      </LanguageProvider>
    );

    expect(html).toContain('data-member-code-trigger="true"');
  });
});
