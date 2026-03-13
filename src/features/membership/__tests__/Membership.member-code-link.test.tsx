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

describe("Membership page", () => {
  it("renders guide section with apply button before showing membership form", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Membership />
      </LanguageProvider>
    );

    expect(html).toContain('data-membership-guide="true"');
    expect(html).toContain("报名");
    expect(html).not.toContain('data-member-code-trigger="true"');
  });
});
