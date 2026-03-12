import { describe, expect, it } from "vitest";
import {
  LOCKOUT_DURATION_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  isLoginLocked,
  nextFailedLoginState,
} from "../loginSecurity.ts";

describe("loginSecurity", () => {
  it("increments failed attempts before lock threshold", () => {
    const next = nextFailedLoginState(0, null, 1_700_000_000_000);

    expect(next.isLocked).toBe(false);
    expect(next.failedAttempts).toBe(1);
    expect(next.lockedUntil).toBeNull();
    expect(next.remainingAttempts).toBe(MAX_FAILED_LOGIN_ATTEMPTS - 1);
  });

  it("locks account for one hour on the fifth failed attempt", () => {
    const nowMs = 1_700_000_000_000;
    const next = nextFailedLoginState(4, null, nowMs);

    expect(next.isLocked).toBe(true);
    expect(next.failedAttempts).toBe(0);
    expect(next.remainingAttempts).toBe(0);
    expect(next.lockedUntil).toBe(new Date(nowMs + LOCKOUT_DURATION_MS).toISOString());
  });

  it("resets stale attempts once lock has expired", () => {
    const nowMs = 1_700_000_000_000;
    const expiredLock = new Date(nowMs - 1).toISOString();
    const next = nextFailedLoginState(4, expiredLock, nowMs);

    expect(next.isLocked).toBe(false);
    expect(next.failedAttempts).toBe(1);
    expect(next.remainingAttempts).toBe(MAX_FAILED_LOGIN_ATTEMPTS - 1);
  });

  it("detects active lock windows", () => {
    const nowMs = 1_700_000_000_000;
    const activeLock = new Date(nowMs + 5_000).toISOString();
    const expiredLock = new Date(nowMs - 5_000).toISOString();

    expect(isLoginLocked(activeLock, nowMs)).toBe(true);
    expect(isLoginLocked(expiredLock, nowMs)).toBe(false);
    expect(isLoginLocked(null, nowMs)).toBe(false);
  });
});
