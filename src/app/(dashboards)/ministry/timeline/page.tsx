"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Search } from "lucide-react";
import { get } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TimelineEntry {
  id: number;
  action: string;
  actor_name: string;
  actor_role: string;
  resource: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

const ROLE_BADGE: Record<
  string,
  "blue" | "purple" | "green" | "yellow" | "red" | "gray"
> = {
  state_ministry: "purple",
  school_admin: "blue",
  teacher: "green",
  student: "gray",
  sponsor: "yellow",
};

const ACTION_BADGE: Record<
  string,
  "blue" | "purple" | "green" | "yellow" | "red" | "gray"
> = {
  APPROVED: "green",
  REJECTED: "red",
  UPDATED: "yellow",
  CREATED: "blue",
};

const DEMO_ENTRIES: TimelineEntry[] = [
  {
    id: 1,
    action: "APPROVED",
    actor_name: "Adaora Nnaji",
    actor_role: "state_ministry",
    resource: "School Approval #332",
    description: "Approved Greenfield Academy compliance request.",
    ip_address: "102.88.12.9",
    created_at: "2026-04-22T04:05:00Z",
  },
  {
    id: 2,
    action: "UPDATED",
    actor_name: "Isaac Bello",
    actor_role: "state_ministry",
    resource: "Recruitment Campaign #15",
    description: "Updated campaign deadline to 30th May.",
    ip_address: "102.88.12.10",
    created_at: "2026-04-22T03:41:00Z",
  },
  {
    id: 3,
    action: "CREATED",
    actor_name: "Martha John",
    actor_role: "state_ministry",
    resource: "Interview Schedule #53",
    description: "Created virtual interview block for shortlisted teachers.",
    ip_address: "102.88.14.2",
    created_at: "2026-04-21T17:12:00Z",
  },
  {
    id: 4,
    action: "REJECTED",
    actor_name: "Ifeanyi Ogu",
    actor_role: "state_ministry",
    resource: "School Approval #329",
    description: "Rejected due to incomplete compliance documents.",
    ip_address: "102.88.12.22",
    created_at: "2026-04-21T15:05:00Z",
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MinistryTimelinePage() {
  const [search, setSearch] = useState("");
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery<TimelineEntry[]>({
    queryKey: ["ministry-audit-log"],
    queryFn: async () => {
      const response = await get<TimelineEntry[]>("/ministry/audit-log");
      return response.data;
    },
  });

  const entries = useMemo(() => {
    const source = data && data.length > 0 ? data : DEMO_ENTRIES;
    const query = search.trim().toLowerCase();

    return source.filter((entry) => {
      if (!query) return true;
      return (
        entry.action.toLowerCase().includes(query) ||
        entry.actor_name.toLowerCase().includes(query) ||
        entry.resource.toLowerCase().includes(query) ||
        (entry.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [data, search]);

  if (user?.role !== "state_ministry") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Timeline access is restricted to Ministry Admin only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ministry Timeline
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Immutable activity feed showing who performed approvals and key
          workflow actions.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base">Activity Feed</CardTitle>
            <div className="relative ml-auto w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search timeline..."
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading timeline...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-500">
              No activity entries match your search.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={ACTION_BADGE[entry.action] ?? "blue"}>
                    {entry.action}
                  </Badge>
                  <Badge variant={ROLE_BADGE[entry.actor_role] ?? "gray"}>
                    {entry.actor_role.replace(/_/g, " ")}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {entry.actor_name}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {entry.resource}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {entry.description ?? "No description provided."}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                  <span>{formatDate(entry.created_at)}</span>
                  <span>IP: {entry.ip_address ?? "n/a"}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
