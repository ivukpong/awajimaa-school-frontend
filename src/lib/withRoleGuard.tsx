import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  _allowedRoles: string[],
) {
  return function RoleGuard(props: P) {
    const { isAuthenticated, hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!hasHydrated) {
        return;
      }

      if (!isAuthenticated) {
        router.replace("/login");
      }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated) {
      return null;
    }

    if (!isAuthenticated) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}
