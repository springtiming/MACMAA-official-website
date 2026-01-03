import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken, extractTokenFromHeader } from "./_jwt.js";

export interface AdminAuthInfo {
  id: string;
  role: "owner" | "admin";
}

/**
 * 验证管理员身份
 * @param req Vercel请求对象
 * @param res Vercel响应对象
 * @returns 如果验证成功返回管理员信息，否则返回null并设置响应状态
 */
export function verifyAdminAuth(
  req: VercelRequest,
  res: VercelResponse
): AdminAuthInfo | null {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ error: "Unauthorized", code: "MISSING_TOKEN" });
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized", code: "INVALID_TOKEN" });
    return null;
  }

  return {
    id: payload.id,
    role: payload.role,
  };
}

/**
 * 要求管理员权限（admin或owner）
 * @param req Vercel请求对象
 * @param res Vercel响应对象
 * @returns 如果验证成功返回管理员信息，否则返回null并设置响应状态
 */
export function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): AdminAuthInfo | null {
  const admin = verifyAdminAuth(req, res);
  if (!admin) {
    return null;
  }

  // admin和owner都可以访问
  if (admin.role === "admin" || admin.role === "owner") {
    return admin;
  }

  res.status(403).json({ error: "Forbidden", code: "INSUFFICIENT_PERMISSIONS" });
  return null;
}

/**
 * 要求owner权限
 * @param req Vercel请求对象
 * @param res Vercel响应对象
 * @returns 如果验证成功返回管理员信息，否则返回null并设置响应状态
 */
export function requireOwner(
  req: VercelRequest,
  res: VercelResponse
): AdminAuthInfo | null {
  const admin = verifyAdminAuth(req, res);
  if (!admin) {
    return null;
  }

  if (admin.role !== "owner") {
    res.status(403).json({ error: "Forbidden", code: "OWNER_REQUIRED" });
    return null;
  }

  return admin;
}






