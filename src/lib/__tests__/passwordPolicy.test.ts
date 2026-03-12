import { describe, expect, it } from "vitest";
import { isStrongAdminPassword } from "../passwordPolicy";

describe("isStrongAdminPassword", () => {
  it("accepts passwords that meet all requirements", () => {
    expect(isStrongAdminPassword("Abcd!234")).toBe(true);
    expect(isStrongAdminPassword("LongerPass#2026")).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(isStrongAdminPassword("Aa1!aaa")).toBe(false);
  });

  it("rejects passwords without uppercase letters", () => {
    expect(isStrongAdminPassword("abcd!234")).toBe(false);
  });

  it("rejects passwords without lowercase letters", () => {
    expect(isStrongAdminPassword("ABCD!234")).toBe(false);
  });

  it("rejects passwords without digits", () => {
    expect(isStrongAdminPassword("Abcd!efg")).toBe(false);
  });

  it("rejects passwords without special characters", () => {
    expect(isStrongAdminPassword("Abcd1234")).toBe(false);
  });
});
