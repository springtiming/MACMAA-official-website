import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSupabaseServiceClientMock = vi.fn();
const logSupabaseErrorMock = vi.fn();
const requireAdminMock = vi.fn();
const requireOwnerMock = vi.fn();
const hashPasswordMock = vi.fn();

vi.mock("@/server/api/_supabaseAdminClient", () => ({
  getSupabaseServiceClient: getSupabaseServiceClientMock,
  logSupabaseError: logSupabaseErrorMock,
}));

vi.mock("@/server/api/_auth", () => ({
  requireAdmin: requireAdminMock,
  requireOwner: requireOwnerMock,
}));

vi.mock("@/server/api/_password", () => ({
  hashPassword: hashPasswordMock,
}));

function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader: vi.fn((name: string, value: string) => {
      res.headers[name] = value;
      return res;
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload: unknown) => {
      res.body = payload;
      return res;
    }),
    end: vi.fn(() => res),
  };

  return res;
}

describe("admin-accounts API", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      INITIAL_ADMIN_USERNAME: "owner",
      INITIAL_ADMIN_EMAIL: "owner@example.com",
      INITIAL_ADMIN_PASSWORD: "StrongPassword123!",
    };
    requireAdminMock.mockReturnValue({ id: "owner-id", role: "owner" });
    requireOwnerMock.mockReturnValue({ id: "owner-id", role: "owner" });
    hashPasswordMock.mockResolvedValue("hashed-password");
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns existing accounts when seeding hits duplicate conflict", async () => {
    const existingAccounts = [
      {
        id: "owner-id",
        username: "owner",
        email: "owner@example.com",
        role: "owner",
        status: "active",
        created_at: "2026-03-01T00:00:00.000Z",
        last_login_at: null,
      },
    ];

    let listQueryCount = 0;
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockImplementation(async () => {
            listQueryCount += 1;
            if (listQueryCount === 1) {
              return { data: [], error: null };
            }
            return { data: existingAccounts, error: null };
          }),
        })),
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: "23505",
              message: "duplicate key value violates unique constraint",
            },
          }),
        })),
      })),
    };

    getSupabaseServiceClientMock.mockReturnValue(supabase);
    const { default: handler } = await import("@/pages/api/admin-accounts/index");
    const req = { method: "GET" } as NextApiRequest;
    const res = createMockResponse() as unknown as NextApiResponse;

    await handler(req, res);

    expect((res as unknown as { statusCode: number }).statusCode).toBe(200);
    expect((res as unknown as { body: unknown }).body).toEqual({
      accounts: existingAccounts,
    });
    expect(listQueryCount).toBe(2);
  });
});
