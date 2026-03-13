import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminVolunteers } from "../AdminVolunteers";

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/AdminConfirmDialog", () => ({
  AdminConfirmDialog: () => <span data-testid="confirm-dialog" />,
}));

vi.mock("@/components/ProcessingOverlay", () => ({
  ProcessingOverlay: () => <span data-testid="processing-overlay" />,
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
    AnimatePresence: passthrough,
    motion: {
      div: passthrough,
      button: passthrough,
      tr: passthrough,
    },
  };
});

describe("AdminVolunteers", () => {
  it("renders volunteer review management container", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminVolunteers />
      </LanguageProvider>
    );

    expect(html).toContain('data-admin-volunteers="true"');
  });
});
