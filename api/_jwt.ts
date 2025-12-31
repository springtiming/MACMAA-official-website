import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "8h"; // 8小时过期

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const jwtSecret: string = JWT_SECRET;

export interface AdminTokenPayload {
  id: string;
  role: "owner" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * 生成JWT token
 * @param adminId 管理员ID
 * @param role 管理员角色
 * @returns JWT token字符串
 */
export function generateToken(adminId: string, role: "owner" | "admin"): string {
  const payload: Omit<AdminTokenPayload, "iat" | "exp"> = {
    id: adminId,
    role,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 验证JWT token
 * @param token JWT token字符串
 * @returns 解析后的token payload，如果无效则返回null
 */
export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret) as unknown;
    return decoded as AdminTokenPayload;
  } catch (error) {
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




