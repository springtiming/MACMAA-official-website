import crypto from "crypto";

// Server-only JWT helpers for API routes.

const JWT_SECRET = process.env.JWT_SECRET;
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
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Base64 URL解码
 */
function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64");
}

/**
 * 生成JWT token（使用与Supabase相同的方式）
 * @param adminId 管理员ID
 * @param role 管理员角色
 * @returns JWT token字符串
 */
export function generateToken(adminId: string, role: "owner" | "admin"): string {
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

  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET!)
    .update(signatureInput)
    .digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * 验证JWT token（使用与Supabase相同的方式）
 * @param token JWT token字符串
 * @returns 解析后的token payload，如果无效则返回null
 */
export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // 验证签名
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET!)
      .update(signatureInput)
      .digest();

    const actualSignature = base64UrlDecode(encodedSignature);

    // 使用 timingSafeEqual 防止时序攻击
    if (expectedSignature.length !== actualSignature.length) {
      return null;
    }
    if (!crypto.timingSafeEqual(expectedSignature, actualSignature)) {
      return null;
    }

    // 解析payload
    const payloadJson = base64UrlDecode(encodedPayload).toString("utf-8");
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
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
