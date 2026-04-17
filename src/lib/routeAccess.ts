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
  security: "/security",
  insurance_operator: "/insurance-operator",
  platform_accountant: "/platform-accountant",
  school_accountant: "/school-accountant",
  state_ministry: "/ministry",
};

const roleAllowedPrefixes: Record<UserRole, string[]> = {
  super_admin: [
    "/super-admin",
    "/super-admin/regulators",
    "/super-admin/sponsors",
    "/super-admin/scholarships",
  ],
  regulator: [
    "/regulator",
  ],
  state_regulator: [
    "/regulator",
  ],
  lga_regulator: [
    "/regulator",
  ],
  school_admin: [
    "/school-admin",
    "/school-admin/regulators",
    "/school-admin/sponsors",
    "/school-admin/scholarships",
    "/school-admin/insurance",
  ],
  branch_admin: [
    "/school-admin",
  ],
  teacher: [
    "/teacher",
  ],
  freelancer_teacher: [
    "/freelancer-teacher",
  ],
  student: [
    "/student",
  ],
  parent: [
    "/parent",
  ],
  sponsor: [
    "/sponsor",
    "/super-admin/regulators",
    "/super-admin/sponsors",
    "/super-admin/scholarships",
    "/school-admin/regulators",
    "/school-admin/sponsors",
    "/school-admin/scholarships",
  ],
  revenue_collector: [
    "/revenue",
  ],
  affiliate: [
    "/affiliate",
  ],
  security: [
    "/security",
  ],
  insurance_operator: [
    "/insurance-operator",
  ],
  platform_accountant: [
    "/platform-accountant",
  ],
  school_accountant: [
    "/school-accountant",
  ],
  state_ministry: [
    "/ministry",
  ],
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
