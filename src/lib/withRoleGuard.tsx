import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPathForRole } from "@/lib/routeAccess";

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[],
) {
  return function RoleGuard(props: P) {
    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!hasHydrated) {
        return;
      }

      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user && !allowedRoles.includes(user.role)) {
        router.replace(getDashboardPathForRole(user.role));
      }
    }, [allowedRoles, hasHydrated, isAuthenticated, router, user]);

    if (!hasHydrated) {
      return null;
    }

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}
