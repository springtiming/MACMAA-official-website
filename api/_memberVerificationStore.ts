type VerificationEntry = {
  code: string;
  expiresAt: number;
};

const CODE_TTL_MS = 5 * 60 * 1000;
const store = new Map<string, VerificationEntry>();

function cleanupExpired() {
  const now = Date.now();
  for (const [email, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(email);
    }
  }
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function setVerificationCode(email: string, code: string) {
  cleanupExpired();
  store.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS });
}

export function verifyCode(email: string, code: string) {
  cleanupExpired();
  const entry = store.get(email);
  if (!entry) return { ok: false, reason: "missing" as const };
  if (entry.expiresAt <= Date.now()) {
    store.delete(email);
    return { ok: false, reason: "expired" as const };
  }
  if (entry.code !== code) {
    return { ok: false, reason: "invalid" as const };
  }
  store.delete(email);
  return { ok: true };
}

export function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
}
