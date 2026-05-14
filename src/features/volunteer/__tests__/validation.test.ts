import { describe, expect, it } from "vitest";
import { isValidVolunteerPhoneNumber } from "../validation";

describe("isValidVolunteerPhoneNumber", () => {
  it("accepts common local and international phone formats", () => {
    expect(isValidVolunteerPhoneNumber("0412345678")).toBe(true);
    expect(isValidVolunteerPhoneNumber("+61 412 345 678")).toBe(true);
    expect(isValidVolunteerPhoneNumber("13800138000")).toBe(true);
    expect(isValidVolunteerPhoneNumber("+86 138 0013 8000")).toBe(true);
    expect(isValidVolunteerPhoneNumber("+1 (415) 555-2671")).toBe(true);
  });

  it("rejects clearly invalid phone inputs", () => {
    expect(isValidVolunteerPhoneNumber("12345")).toBe(false);
    expect(isValidVolunteerPhoneNumber("phone123")).toBe(false);
    expect(isValidVolunteerPhoneNumber("++8613800138000")).toBe(false);
  });
});
