import { describe, expect, it } from "vitest";
import { getPageTransitionKey } from "../pageTransitionKey";

describe("getPageTransitionKey", () => {
  it("forces a fresh transition for the home page when splash state changes", () => {
    expect(getPageTransitionKey("/", false)).not.toBe(
      getPageTransitionKey("/", true)
    );
    expect(getPageTransitionKey("/about", false)).toBe("/about");
    expect(getPageTransitionKey("/about", true)).toBe("/about");
  });
});
