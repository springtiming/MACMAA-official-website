const JWT_SECRET = Deno.env.get("JWT_SECRET");
const JWT_EXPIRES_IN_SECONDS = 8 * 60 * 60; // 8小时

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface AdminTokenPayload {
  id: string;
  role: "owner" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * Base64 URL编码
 */
function base64UrlEncode(str: string): string {
  return str
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Base64 URL解码
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

/**
 * 生成JWT token
 * @param adminId 管理员ID
 * @param role 管理员角色
 * @returns JWT token字符串
 */
export async function generateToken(
  adminId: string,
  role: "owner" | "admin"
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: AdminTokenPayload = {
    id: adminId,
    role,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  };

  const encodedHeader = base64UrlEncode(
    btoa(JSON.stringify(header)).replace(/=+$/, "")
  );
  const encodedPayload = base64UrlEncode(
    btoa(JSON.stringify(payload)).replace(/=+$/, "")
  );

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64UrlEncode(
    btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "")
  );

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * 验证JWT token
 * @param token JWT token字符串
 * @returns 解析后的token payload，如果无效则返回null
 */
export async function verifyToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // 验证签名
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(
      atob(base64UrlDecode(encodedSignature)),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(signatureInput)
    );

    if (!isValid) {
      return null;
    }

    // 解析payload
    const payloadJson = atob(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson) as AdminTokenPayload;

    // 检查过期时间
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[jwt] verify error:", error);
    return null;
  }
}

/**
 * 从Authorization头中提取token
 * @param authHeader Authorization头的值，格式: "Bearer <token>"
 * @returns token字符串，如果格式不正确则返回null
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}




