import { getToken, removeToken, isTokenValid } from "./tokenStorage";

export interface AdminInfo {
  id: string;
  username: string;
  role: "owner" | "admin";
}

/**
 * 从token解析当前管理员信息
 * @returns 管理员信息，如果token无效则返回null
 */
export function getCurrentAdmin(): AdminInfo | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    // 解析JWT payload（不验证签名，仅用于前端显示）
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.id || !payload.role) {
      return null;
    }

    // 注意：这里不包含username，需要从登录响应中存储
    // 为了兼容，我们从sessionStorage获取username（如果存在）
    const username =
      typeof window !== "undefined"
        ? sessionStorage.getItem("adminUsername") || "Admin"
        : "Admin";

    return {
      id: payload.id,
      username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 * @returns 如果已登录返回true，否则返回false
 */
export function isAuthenticated(): boolean {
  return isTokenValid();
}

/**
 * 检查是否有特定角色
 * @param role 要检查的角色
 * @returns 如果当前用户有该角色返回true，否则返回false
 */
export function hasRole(role: "owner" | "admin"): boolean {
  const admin = getCurrentAdmin();
  if (!admin) {
    return false;
  }

  // owner拥有所有权限
  if (admin.role === "owner") {
    return true;
  }

  return admin.role === role;
}

/**
 * 检查是否有admin或owner权限
 * @returns 如果有admin或owner权限返回true，否则返回false
 */
export function isAdmin(): boolean {
  const admin = getCurrentAdmin();
  if (!admin) {
    return false;
  }
  return admin.role === "admin" || admin.role === "owner";
}

/**
 * 检查是否是owner
 * @returns 如果是owner返回true，否则返回false
 */
export function isOwner(): boolean {
  const admin = getCurrentAdmin();
  if (!admin) {
    return false;
  }
  return admin.role === "owner";
}

/**
 * 登出并清除token
 */
export function logout(): void {
  removeToken();
  // 清除旧的sessionStorage数据（向后兼容）
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminId");
    sessionStorage.removeItem("adminRole");
    sessionStorage.removeItem("adminUsername");
  }
}

