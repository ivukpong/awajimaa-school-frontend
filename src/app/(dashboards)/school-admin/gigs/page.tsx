"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Gig {
  id: number;
  title?: string;
  subject: string;
  duration_value?: string | number;
  duration_unit?: string;
  start_date?: string;
  end_date?: string;
  proposed_budget?: number;
  currency?: string;
  status: string;
  matched_teacher?: { name: string };
  assigned_student?: { user?: { name: string } };
}

interface Engagement {
  id: number;
  subject: string;
  duration_hours: number;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  currency: string;
  status: string;
  teacher?: { name: string };
  parent?: { name: string };
}

function statusVariant(
  status: string,
): "green" | "yellow" | "red" | "blue" | "gray" {
  if (["completed", "paid"].includes(status)) return "green";
  if (["ongoing", "accepted", "pending"].includes(status)) return "blue";
  if (["open", "awaiting_payment"].includes(status)) return "yellow";
  if (["cancelled", "refunded", "expired"].includes(status)) return "red";
  return "gray";
}

const gigColumns: Column<Gig>[] = [
  {
    key: "subject",
    header: "Subject",
    render: (row) => (
      <div>
        <p className="font-medium text-sm text-gray-900 dark:text-white">
          {row.subject}
        </p>
        {row.title && <p className="text-xs text-gray-500">{row.title}</p>}
      </div>
    ),
  },
  {
    key: "matched_teacher",
    header: "Teacher",
    render: (row) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.matched_teacher?.name ?? (
          <span className="italic text-gray-400">Unmatched</span>
        )}
      </span>
    ),
  },
  {
    key: "assigned_student",
    header: "Student",
    render: (row) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.assigned_student?.user?.name ?? (
          <span className="italic text-gray-400">—</span>
        )}
      </span>
    ),
  },
  {
    key: "duration_value",
    header: "Duration",
    render: (row) =>
      row.duration_value ? (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.duration_value} {row.duration_unit ?? ""}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    key: "start_date",
    header: "Start / End",
    render: (row) => (
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {row.start_date ? formatDate(row.start_date) : "—"}
        {row.end_date ? ` → ${formatDate(row.end_date)}` : ""}
      </span>
    ),
  },
  {
    key: "proposed_budget",
    header: "Budget",
    render: (row) => (
      <span className="text-sm font-medium">
        {row.proposed_budget
          ? formatCurrency(
              row.proposed_budget,
              (row.currency ?? "NGN").toUpperCase(),
            )
          : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant={statusVariant(row.status)}>
        {row.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
];

const engColumns: Column<Engagement>[] = [
  {
    key: "subject",
    header: "Subject",
    render: (row) => (
      <p className="font-medium text-sm text-gray-900 dark:text-white">
        {row.subject}
      </p>
    ),
  },
  {
    key: "teacher",
    header: "Teacher",
    render: (row) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.teacher?.name ?? "—"}
      </span>
    ),
  },
  {
    key: "parent",
    header: "Hired By",
    render: (row) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.parent?.name ?? "—"}
      </span>
    ),
  },
  {
    key: "duration_hours",
    header: "Duration (hrs)",
    render: (row) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {row.duration_hours}
      </span>
    ),
  },
  {
    key: "start_date",
    header: "Start / End",
    render: (row) => (
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {row.start_date ? formatDate(row.start_date) : "—"}
        {row.end_date ? ` → ${formatDate(row.end_date)}` : ""}
      </span>
    ),
  },
  {
    key: "total_amount",
    header: "Amount",
    render: (row) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.total_amount, row.currency.toUpperCase())}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant={statusVariant(row.status)}>
        {row.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
];

export default function SchoolAdminGigsPage() {
  const [tab, setTab] = useState<"gigs" | "engagements">("gigs");

  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ["teaching-gigs-school"],
    queryFn: () =>
      get<any>("/teaching-gigs?per_page=100").then((r) => r.data?.data ?? []),
  });

  const { data: engData, isLoading: engLoading } = useQuery({
    queryKey: ["engagements-school"],
    queryFn: () =>
      get<any>("/engagements?per_page=100").then((r) => r.data?.data ?? []),
  });

  const gigs: Gig[] = Array.isArray(gigsData) ? gigsData : [];
  const engagements: Engagement[] = Array.isArray(engData) ? engData : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teaching Gigs &amp; Engagements
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All freelance gigs and parent-hired teaching sessions for your school
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["gigs", "engagements"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "gigs"
              ? `Freelance Gigs (${gigs.length})`
              : `Hired Engagements (${engagements.length})`}
          </button>
        ))}
      </div>

      <Card padding={false}>
        {tab === "gigs" ? (
          <Table
            keyField="id"
            columns={gigColumns}
            data={gigs}
            loading={gigsLoading}
            emptyMessage="No teaching gigs found."
          />
        ) : (
          <Table
            keyField="id"
            columns={engColumns}
            data={engagements}
            loading={engLoading}
            emptyMessage="No engagements found."
          />
        )}
      </Card>
    </div>
  );
}
