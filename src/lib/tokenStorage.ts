const TOKEN_KEY = "vmca.admin.token";

export type AdminTokenPayload = {
  id: string;
  role: "owner" | "admin";
  iat?: number;
  exp?: number;
};

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  return atob(padded);
}

export function getTokenPayload(): AdminTokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson) as AdminTokenPayload;
    if (!payload?.id || !payload?.role) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * 存储token
 * @param token JWT token字符串
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 获取token
 * @returns token字符串，如果不存在则返回null
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 删除token
 */
export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 检查token是否存在且未过期（前端检查）
 * 注意：这只是前端检查，真正的验证在服务器端
 * @returns 如果token存在且未过期返回true，否则返回false
 */
export function isTokenValid(): boolean {
  const payload = getTokenPayload();
  if (!payload?.exp) return false;

  // 检查是否过期（留5分钟缓冲时间）
  const now = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // 5分钟
  return payload.exp > now + bufferTime;
}
