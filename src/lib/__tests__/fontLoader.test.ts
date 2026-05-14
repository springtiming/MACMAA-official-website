import { describe, expect, it } from "vitest";
import { getFontFamilyCSS, getHeadingFontFamilyCSS } from "../fontLoader";

describe("fontLoader", () => {
  it("uses a Chinese-capable font in the global body stack", () => {
    expect(getFontFamilyCSS()).toContain("'Noto Sans SC'");
  });

  it("keeps headings from falling back to a Chinese-unsafe generic serif only", () => {
    const headingFontFamily = getHeadingFontFamilyCSS();

    expect(headingFontFamily).toContain("'Noto Sans SC'");
    expect(headingFontFamily.trim()).not.toBe("serif");
  });
});
