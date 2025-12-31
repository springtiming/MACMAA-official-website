const TOKEN_KEY = "vmca.admin.token";

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
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    // 解析JWT payload（不验证签名，仅检查过期时间）
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return false;
    }

    // 检查是否过期（留5分钟缓冲时间）
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 5 * 60; // 5分钟
    return payload.exp > now + bufferTime;
  } catch {
    return false;
  }
}

