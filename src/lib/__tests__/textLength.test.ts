import { describe, expect, it } from "vitest";
import { countCharacters, isWithinCharacterLimit } from "../textLength";

describe("textLength helpers", () => {
  it("counts plain ASCII text by visible characters", () => {
    expect(countCharacters("hello world")).toBe(11);
  });

  it("counts line breaks as characters instead of invalidating the value", () => {
    expect(countCharacters("hello\nworld")).toBe(11);
    expect(isWithinCharacterLimit("hello\nworld", 200)).toBe(true);
  });

  it("treats multi-byte characters as one character each", () => {
    expect(countCharacters("中文摘要")).toBe(4);
  });

  it("enforces the configured maximum inclusively", () => {
    expect(isWithinCharacterLimit("a".repeat(200), 200)).toBe(true);
    expect(isWithinCharacterLimit("a".repeat(201), 200)).toBe(false);
  });
});
