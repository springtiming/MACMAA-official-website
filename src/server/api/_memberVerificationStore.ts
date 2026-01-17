import { createHash } from "crypto";

export const CODE_TTL_MS = 5 * 60 * 1000;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function hashVerificationCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
}
