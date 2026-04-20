"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Users } from "lucide-react";

interface RoleSummary {
  role: string;
  description: string;
  user_count: number;
  permissions: string[];
}

const demoRoles: RoleSummary[] = [
  {
    role: "super_admin",
    description: "Full platform access — manages schools, users, subscriptions",
    user_count: 2,
    permissions: [
      "manage_schools",
      "manage_users",
      "manage_subscriptions",
      "view_audit_log",
      "manage_settings",
    ],
  },
  {
    role: "school_admin",
    description: "Manages a single school's staff, classes, and finances",
    user_count: 14,
    permissions: [
      "manage_staff",
      "manage_classes",
      "view_reports",
      "manage_fees",
    ],
  },
  {
    role: "branch_admin",
    description: "Manages a school branch under a school admin",
    user_count: 7,
    permissions: ["manage_branch_staff", "view_branch_reports"],
  },
  {
    role: "teacher",
    description: "Records attendance, grades, and communicates with parents",
    user_count: 98,
    permissions: ["record_attendance", "enter_scores", "message_parents"],
  },
  {
    role: "freelancer_teacher",
    description: "External teacher who posts and accepts teaching gigs",
    user_count: 43,
    permissions: ["post_gigs", "accept_engagements", "view_profile"],
  },
  {
    role: "student",
    description: "Accesses timetable, e-learning, and personal results",
    user_count: 1240,
    permissions: ["view_timetable", "access_elearning", "view_results"],
  },
  {
    role: "parent",
    description: "Monitors children, pays fees, and requests pickups",
    user_count: 860,
    permissions: [
      "view_children",
      "pay_fees",
      "generate_pickup_code",
      "send_messages",
    ],
  },
  {
    role: "sponsor",
    description: "Funds needy students and tracks scholarship progress",
    user_count: 22,
    permissions: ["sponsor_students", "top_up_wallet", "view_ledger"],
  },
  {
    role: "revenue_collector",
    description: "Creates and tracks fee invoices and payments",
    user_count: 11,
    permissions: ["create_invoices", "record_payments", "view_finance_reports"],
  },
  {
    role: "security",
    description: "Monitors campus alerts, help requests, and visitor logs",
    user_count: 18,
    permissions: ["view_help_messages", "acknowledge_alerts", "resolve_alerts"],
  },
  {
    role: "regulator",
    description: "National-level oversight of all schools on the platform",
    user_count: 3,
    permissions: ["view_all_schools", "view_audit_log", "generate_reports"],
  },
  {
    role: "state_regulator",
    description: "State-level oversight for schools in their jurisdiction",
    user_count: 9,
    permissions: ["view_state_schools", "view_state_reports"],
  },
  {
    role: "lga_regulator",
    description: "LGA-level oversight for schools in their local area",
    user_count: 21,
    permissions: ["view_lga_schools", "view_lga_reports"],
  },
];

const roleColor: Record<
  string,
  "green" | "red" | "yellow" | "blue" | "gray" | "purple"
> = {
  super_admin: "purple",
  regulator: "red",
  state_regulator: "red",
  lga_regulator: "yellow",
  school_admin: "blue",
  branch_admin: "blue",
  teacher: "green",
  freelancer_teacher: "green",
  student: "gray",
  parent: "yellow",
  sponsor: "purple",
  revenue_collector: "yellow",
  security: "red",
};

export default function SecurityRolesPage() {
  const { data, isLoading } = useQuery<RoleSummary[]>({
    queryKey: ["roles-summary"],
    queryFn: async () => {
      const res = await get<RoleSummary[]>("/admin/roles");
      return res.data ?? [];
    },
  });

  const roles = data && data.length > 0 ? data : demoRoles;
  const totalUsers = roles.reduce((sum, r) => sum + r.user_count, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Roles &amp; Permissions
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Overview of all platform roles and their capabilities
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-600">
              {roles.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Roles</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-green-600">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-0 col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-purple-600">
              {roles.reduce((s, r) => s + r.permissions.length, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Permission Entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-500" />
            All Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading…
            </div>
          ) : (
            <ul className="divide-y dark:divide-gray-800">
              {roles.map((r) => (
                <li key={r.role} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleColor[r.role] ?? "gray"}>
                            {r.role.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 max-w-md">
                          {r.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      {r.user_count.toLocaleString()}
                    </div>
                  </div>

                  {r.permissions.length > 0 && (
                    <div className="mt-3 ml-12 flex flex-wrap gap-1.5">
                      {r.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-block rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-mono text-gray-600 dark:text-gray-400"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
