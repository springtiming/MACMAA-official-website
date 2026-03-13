import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Volunteer } from "../Volunteer";

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

describe("Volunteer page", () => {
  it("renders embedded volunteer application form instead of download flow", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Volunteer />
      </LanguageProvider>
    );

    expect(html).toContain('data-volunteer-form="true"');
  });

  it("renders optional gender field in basic information section", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <Volunteer />
      </LanguageProvider>
    );

    expect(html).toContain("性别（可选）");
  });
});
