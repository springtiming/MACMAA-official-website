export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 60 * 60 * 1000;

function parseLockUntil(lockedUntil: string | null | undefined): number | null {
  if (!lockedUntil) return null;
  const millis = Date.parse(lockedUntil);
  return Number.isFinite(millis) ? millis : null;
}

export function isLoginLocked(
  lockedUntil: string | null | undefined,
  nowMs = Date.now()
): boolean {
  const lockUntilMs = parseLockUntil(lockedUntil);
  return lockUntilMs !== null && lockUntilMs > nowMs;
}

export function nextFailedLoginState(
  failedAttempts: number | null | undefined,
  lockedUntil: string | null | undefined,
  nowMs = Date.now()
) {
  const lockUntilMs = parseLockUntil(lockedUntil);
  const lockExpired = lockUntilMs !== null && lockUntilMs <= nowMs;
  const safeAttempts = Math.max(0, Math.trunc(failedAttempts ?? 0));
  const attemptsBeforeFailure = lockExpired ? 0 : safeAttempts;
  const attemptsAfterFailure = attemptsBeforeFailure + 1;

  if (attemptsAfterFailure >= MAX_FAILED_LOGIN_ATTEMPTS) {
    return {
      failedAttempts: 0,
      lockedUntil: new Date(nowMs + LOCKOUT_DURATION_MS).toISOString(),
      isLocked: true,
      remainingAttempts: 0,
    };
  }

  return {
    failedAttempts: attemptsAfterFailure,
    lockedUntil: null,
    isLocked: false,
    remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS - attemptsAfterFailure,
  };
}
