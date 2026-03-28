import type { UserRole } from "@/types";

export const roleDashboardPath: Record<UserRole, string> = {
  super_admin: "/super-admin",
  regulator: "/regulator",
  state_regulator: "/regulator",
  lga_regulator: "/regulator",
  school_admin: "/school-admin",
  branch_admin: "/school-admin",
  teacher: "/teacher",
  freelancer_teacher: "/freelancer-teacher",
  student: "/student",
  parent: "/parent",
  sponsor: "/sponsor",
  revenue_collector: "/revenue",
  affiliate: "/affiliate",
};

const roleAllowedPrefixes: Record<UserRole, string[]> = {
  super_admin: ["/super-admin"],
  regulator: ["/regulator"],
  state_regulator: ["/regulator"],
  lga_regulator: ["/regulator"],
  school_admin: ["/school-admin"],
  branch_admin: ["/school-admin"],
  teacher: ["/teacher"],
  freelancer_teacher: ["/freelancer-teacher"],
  student: ["/student"],
  parent: ["/parent"],
  sponsor: ["/sponsor"],
  revenue_collector: ["/revenue"],
  affiliate: ["/affiliate"],
};

export function getDashboardPathForRole(role?: UserRole | null): string {
  if (!role) {
    return "/";
  }

  return roleDashboardPath[role] ?? "/";
}

export function canRoleAccessPath(
  role?: UserRole | null,
  pathname?: string | null,
): boolean {
  if (!role || !pathname) {
    return false;
  }

  const allowedPrefixes = roleAllowedPrefixes[role] ?? [];

  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
