import { verifyToken, extractTokenFromHeader } from "./jwt.ts";

export interface AdminAuthInfo {
  id: string;
  role: "owner" | "admin";
}

/**
 * 验证管理员身份
 * @param req Request对象
 * @returns 如果验证成功返回管理员信息，否则返回null
 */
export async function verifyAdminToken(
  req: Request
): Promise<AdminAuthInfo | null> {
  const authHeader = req.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    role: payload.role,
  };
}

/**
 * 要求管理员权限（admin或owner）
 * @param req Request对象
 * @returns 如果验证成功返回管理员信息，否则返回null
 */
export async function requireAdminRole(
  req: Request
): Promise<AdminAuthInfo | null> {
  const admin = await verifyAdminToken(req);
  if (!admin) {
    return null;
  }

  // admin和owner都可以访问
  if (admin.role === "admin" || admin.role === "owner") {
    return admin;
  }

  return null;
}

/**
 * 要求owner权限
 * @param req Request对象
 * @returns 如果验证成功返回管理员信息，否则返回null
 */
export async function requireOwnerRole(
  req: Request
): Promise<AdminAuthInfo | null> {
  const admin = await verifyAdminToken(req);
  if (!admin) {
    return null;
  }

  if (admin.role !== "owner") {
    return null;
  }

  return admin;
}

/**
 * 创建未授权响应
 */
export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized", code: "INVALID_TOKEN" }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

/**
 * 创建权限不足响应
 */
export function createForbiddenResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Forbidden", code: "INSUFFICIENT_PERMISSIONS" }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

