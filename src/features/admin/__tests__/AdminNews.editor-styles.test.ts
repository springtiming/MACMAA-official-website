import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

describe("admin news editor scroll styles", () => {
  it("keeps inline editors scrollable instead of clipping long content", () => {
    expect(css).toMatch(
      /\.news-inline-editor\s*{[^}]*height:\s*420px;[^}]*display:\s*flex;/s
    );
    expect(css).toMatch(
      /\.news-inline-editor \.ql-container\.ql-snow\s*{[^}]*overflow:\s*hidden;/s
    );
    expect(css).toMatch(
      /\.news-inline-editor \.ql-editor\s*{[^}]*height:\s*100%;[^}]*overflow-y:\s*auto;/s
    );
  });

  it("does not keep obsolete fullscreen editor styles", () => {
    expect(css).not.toContain("news-fullscreen-editor");
  });
});
