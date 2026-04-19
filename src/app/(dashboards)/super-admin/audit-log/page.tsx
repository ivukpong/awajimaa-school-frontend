"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ClipboardList, Download, Search } from "lucide-react";

interface AuditEntry {
  id: number;
  action: string;
  user_name: string;
  user_role: string;
  resource: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

const roleVariant: Record<
  string,
  "blue" | "purple" | "green" | "yellow" | "red" | "gray"
> = {
  super_admin: "purple",
  school_admin: "blue",
  branch_admin: "blue",
  teacher: "green",
  student: "gray",
  parent: "yellow",
  sponsor: "green",
  revenue_collector: "yellow",
  security: "red",
};

const demoEntries: AuditEntry[] = [
  {
    id: 1,
    action: "USER_CREATED",
    user_name: "Emeka Okafor",
    user_role: "super_admin",
    resource: "User #1042",
    description: "Created new school admin account",
    ip_address: "102.89.44.12",
    created_at: "2025-01-15T09:12:00Z",
  },
  {
    id: 2,
    action: "ROLE_UPDATED",
    user_name: "Ngozi Eze",
    user_role: "school_admin",
    resource: "User #1039",
    description: "Changed role from teacher to branch_admin",
    ip_address: "197.210.5.88",
    created_at: "2025-01-15T10:30:00Z",
  },
  {
    id: 3,
    action: "SCHOOL_CREATED",
    user_name: "Emeka Okafor",
    user_role: "super_admin",
    resource: "School #47",
    description: "Added Greenfield Academy, Uyo",
    ip_address: "102.89.44.12",
    created_at: "2025-01-14T14:00:00Z",
  },
  {
    id: 4,
    action: "SUBSCRIPTION_UPGRADED",
    user_name: "Akinwale Bello",
    user_role: "school_admin",
    resource: "Subscription #28",
    description: "Upgraded plan from Basic to Premium",
    ip_address: "41.184.6.100",
    created_at: "2025-01-14T08:45:00Z",
  },
  {
    id: 5,
    action: "USER_DEACTIVATED",
    user_name: "Emeka Okafor",
    user_role: "super_admin",
    resource: "User #988",
    description: "Deactivated freelancer account",
    ip_address: "102.89.44.12",
    created_at: "2025-01-13T16:22:00Z",
  },
  {
    id: 6,
    action: "FEE_CREATED",
    user_name: "Blessing Nnaji",
    user_role: "revenue_collector",
    resource: "Invoice #5321",
    description: "Created Third Term fees for JSS 2B",
    ip_address: "105.112.9.44",
    created_at: "2025-01-12T11:00:00Z",
  },
  {
    id: 7,
    action: "SETTINGS_CHANGED",
    user_name: "Emeka Okafor",
    user_role: "super_admin",
    resource: "Platform Settings",
    description: "Updated default SMS provider",
    ip_address: "102.89.44.12",
    created_at: "2025-01-11T15:09:00Z",
  },
];

function actionColor(
  action: string,
): "green" | "red" | "yellow" | "blue" | "gray" | "purple" {
  if (action.includes("CREATED") || action.includes("UPGRADED")) return "green";
  if (action.includes("DEACTIVATED") || action.includes("DELETED"))
    return "red";
  if (action.includes("UPDATED") || action.includes("CHANGED")) return "yellow";
  if (action.includes("SUBSCRIPTION")) return "purple";
  return "blue";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const res = await get<{ data: AuditEntry[] }>("/admin/audit-log");
      return res.data ?? [];
    },
  });

  const entries = (data ?? demoEntries).filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.action.toLowerCase().includes(q) ||
      e.user_name.toLowerCase().includes(q) ||
      e.resource.toLowerCase().includes(q) ||
      (e.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Audit Log
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform-wide activity and change history
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base flex-1">Activity Log</CardTitle>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand w-48"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading audit log…
            </div>
          ) : entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No matching entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      Action
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      User
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">
                      Resource
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">
                      Description
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">
                      IP Address
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Badge variant={actionColor(e.action)}>
                          {e.action.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {e.user_name}
                        </p>
                        <Badge variant={roleVariant[e.user_role] ?? "gray"}>
                          {e.user_role.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-gray-600 dark:text-gray-400">
                        {e.resource}
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell text-gray-500 max-w-xs truncate">
                        {e.description ?? "—"}
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell font-mono text-xs text-gray-400">
                        {e.ip_address ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(e.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
