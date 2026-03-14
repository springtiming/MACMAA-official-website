import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnimatePresence } from "motion/react";
import { LanguageProvider } from "@/contexts/LanguageContext";

describe("Home hero animation", () => {
  it("does not server-render the hero in its final animated state before splash completes", async () => {
    (globalThis as typeof globalThis & { React: typeof React }).React = React;
    const { Home } = await import("../Home");

    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AnimatePresence initial={false}>
          <Home splashComplete={false} />
        </AnimatePresence>
      </LanguageProvider>
    );

    expect(html).toContain(">澳洲万年市华人互助会</h1>");
    expect(html).not.toContain(
      'style="opacity:1;transform:none">澳洲万年市华人互助会</h1>'
    );
    expect(html).not.toContain(
      'class="hidden sm:block absolute top-10 left-10 w-20 h-20 rounded-full bg-[#6BA868]/20" style="transform:none"'
    );
    expect(html).not.toContain(
      'class="hidden sm:block absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#EB8C3A]/20" style="transform:none"'
    );
  });
});
