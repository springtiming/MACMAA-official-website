import { getTokenPayload, removeToken, isTokenValid } from "./tokenStorage";

export interface AdminInfo {
  id: string;
  username: string;
  role: "owner" | "admin";
}

const ADMIN_USERNAME_KEY = "vmca.admin.username";

export function setAdminUsername(username: string): void {
  if (typeof window === "undefined") return;
  const normalized = username.trim();
  if (!normalized) return;
  window.localStorage.setItem(ADMIN_USERNAME_KEY, normalized);
  window.sessionStorage.setItem("adminUsername", normalized);
}

function getStoredAdminUsername(): string {
  if (typeof window === "undefined") return "Admin";
  return (
    window.sessionStorage.getItem("adminUsername") ||
    window.localStorage.getItem(ADMIN_USERNAME_KEY) ||
    "Admin"
  );
}

/**
 * 从token解析当前管理员信息
 * @returns 管理员信息，如果token无效则返回null
 */
export function getCurrentAdmin(): AdminInfo | null {
  const payload = getTokenPayload();
  if (!payload) return null;

  return {
    id: payload.id,
    role: payload.role,
    username: getStoredAdminUsername(),
  };
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
    window.localStorage.removeItem(ADMIN_USERNAME_KEY);
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminId");
    sessionStorage.removeItem("adminRole");
    sessionStorage.removeItem("adminUsername");
  }
}




