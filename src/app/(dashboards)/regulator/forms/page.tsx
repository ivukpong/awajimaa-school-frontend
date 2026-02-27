"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FormRow extends Record<string, unknown> {
  id: number;
  title: string;
  target: string;
  deadline: string;
  submitted: number;
  total: number;
  status: string;
}

const mockForms: FormRow[] = [
  {
    id: 1,
    title: "Annual Safety Compliance Form",
    target: "All schools",
    deadline: "2026-03-15",
    submitted: 180,
    total: 248,
    status: "active",
  },
  {
    id: 2,
    title: "Teacher Qualification Verification",
    target: "Secondary",
    deadline: "2026-02-28",
    submitted: 88,
    total: 120,
    status: "active",
  },
  {
    id: 3,
    title: "Infrastructure Assessment 2024",
    target: "All schools",
    deadline: "2024-11-30",
    submitted: 248,
    total: 248,
    status: "closed",
  },
  {
    id: 4,
    title: "COVID Safety Protocol Audit",
    target: "All schools",
    deadline: "2023-09-01",
    submitted: 235,
    total: 248,
    status: "closed",
  },
];

const columns: Column<FormRow>[] = [
  {
    key: "title",
    header: "Form Title",
    sortable: true,
    render: (r) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {r.title}
      </span>
    ),
  },
  { key: "target", header: "Target" },
  {
    key: "deadline",
    header: "Deadline",
    render: (r) => formatDate(r.deadline),
  },
  {
    key: "submitted",
    header: "Submissions",
    render: (r) => {
      const pct = Math.round((r.submitted / r.total) * 100);
      return (
        <div className="space-y-1 min-w-[120px]">
          <div className="flex justify-between text-xs">
            <span>
              {r.submitted}/{r.total}
            </span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-brand"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "active" ? "green" : "gray"}>
        {r.status}
      </Badge>
    ),
  },
  {
    key: "id",
    header: "Actions",
    render: () => (
      <div className="flex items-center gap-1">
        <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Eye className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    ),
  },
];

export default function RegulatorFormsPage() {
  const [tab, setTab] = useState<"forms" | "submissions">("forms");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forms & Verification
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create compliance forms, track school submissions, and manage
            approvals
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create Form</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit dark:border-gray-700 dark:bg-gray-800">
        {(["forms", "submissions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "forms" ? (
        <Table
          columns={columns}
          data={mockForms}
          keyField="id"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  school: "Greenfield Academy",
                  form: "Annual Safety Compliance Form",
                  status: "under_review",
                  date: "2026-02-25",
                },
                {
                  school: "St. Patrick's College",
                  form: "Teacher Qualification Verification",
                  status: "approved",
                  date: "2026-02-24",
                },
                {
                  school: "Sunrise Nursery",
                  form: "Annual Safety Compliance Form",
                  status: "submitted",
                  date: "2026-02-23",
                },
                {
                  school: "Govt. Secondary School",
                  form: "Teacher Qualification Verification",
                  status: "needs_revision",
                  date: "2026-02-22",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {s.school}
                    </p>
                    <p className="text-xs text-gray-500">{s.form}</p>
                  </div>
                  <Badge
                    variant={
                      s.status === "approved"
                        ? "green"
                        : s.status === "needs_revision"
                          ? "red"
                          : s.status === "under_review"
                            ? "yellow"
                            : "blue"
                    }
                  >
                    {s.status.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(s.date)}
                  </span>
                  <div className="flex gap-1">
                    <button className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
