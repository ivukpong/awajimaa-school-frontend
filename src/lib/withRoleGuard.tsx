import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPathForRole } from "@/lib/routeAccess";

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[],
) {
  return function RoleGuard(props: P) {
    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDemoView = searchParams.get("demoView") === "1";
    const canBypassRoleGuard = isDemoView && user?.role === "state_ministry";

    useEffect(() => {
      if (!hasHydrated) {
        return;
      }

      if (!isAuthenticated) {
        router.replace("/login");
      } else if (
        user &&
        !allowedRoles.includes(user.role) &&
        !canBypassRoleGuard
      ) {
        router.replace(getDashboardPathForRole(user.role));
      }
    }, [
      allowedRoles,
      canBypassRoleGuard,
      hasHydrated,
      isAuthenticated,
      router,
      user,
    ]);

    if (!hasHydrated) {
      return null;
    }

    if (
      !isAuthenticated ||
      !user ||
      (!allowedRoles.includes(user.role) && !canBypassRoleGuard)
    ) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}
