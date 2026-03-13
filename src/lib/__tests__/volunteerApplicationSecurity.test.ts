import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVolunteerApplication } from "../supabaseApi";

const { fromMock, insertMock, getSupabaseClientMock, logSupabaseErrorMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    insertMock: vi.fn(),
    getSupabaseClientMock: vi.fn(),
    logSupabaseErrorMock: vi.fn(),
  }));

vi.mock("../supabaseClient", () => ({
  getSupabaseClient: getSupabaseClientMock,
  logSupabaseError: logSupabaseErrorMock,
}));

describe("createVolunteerApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockReturnValue({
      insert: insertMock,
    });
    getSupabaseClientMock.mockReturnValue({
      from: fromMock,
    });
  });

  it("rejects payload when volunteer agreements are not fully accepted", async () => {
    await expect(
      createVolunteerApplication({
        name: "Test User",
        birth_year: 1990,
        gender: "male",
        phone: "0412345678",
        email: "test@example.com",
        suburb: "Box Hill",
        language_skills: ["english"],
        volunteer_interests: ["event-support"],
        weekday_availability: ["morning"],
        weekend_availability: [],
        monthly_hours: "2-4",
        emergency_name: "Emergency Contact",
        emergency_relation: "Friend",
        emergency_phone: "0412345678",
        agree_truth: false,
        agree_unpaid: true,
        agree_guidelines: true,
        agree_contact: true,
        agree_privacy: true,
      })
    ).rejects.toThrow("volunteer-agreement-required");

    expect(fromMock).not.toHaveBeenCalled();
  });
});
