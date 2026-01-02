import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAuthenticated, getCurrentAdmin, hasRole } from "@/lib/auth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * 可选的角色要求
   * 如果指定，只有拥有该角色的用户才能访问
   */
  requiredRole?: "owner" | "admin";
  /**
   * 如果指定为true，只有owner可以访问
   */
  ownerOnly?: boolean;
}

/**
 * 路由保护组件
 * 检查用户是否已登录，以及是否有足够的权限
 */
export function ProtectedRoute({
  children,
  requiredRole,
  ownerOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 检查是否已登录
      if (!isAuthenticated()) {
        router.replace("/admin");
        return;
      }

      const admin = getCurrentAdmin();
      if (!admin) {
        router.replace("/admin");
        return;
      }

      // 检查角色权限
      if (ownerOnly) {
        if (admin.role !== "owner") {
          router.replace("/admin");
          return;
        }
      } else if (requiredRole) {
        if (!hasRole(requiredRole)) {
          router.replace("/admin");
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [requiredRole, ownerOnly, router]);

  if (isChecking) {
    // 显示加载状态
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">验证中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}





