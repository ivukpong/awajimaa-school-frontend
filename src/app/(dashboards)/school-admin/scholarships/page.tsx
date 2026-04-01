"use client";
import React from "react";
import { useScholarships } from "@/hooks/useScholarships";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  return [];
}

export default function ScholarshipsPage() {
  const { data, isLoading } = useScholarships();
  const scholarships = toArray<any>(data?.data);

  const columns: Column<any>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "description",
      header: "Description",
      render: (r) => r.description || "—",
    },
    {
      key: "total_budget",
      header: "Budget",
      render: (r) => (r.total_budget ? formatCurrency(r.total_budget) : "—"),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (r) => r.start_date?.slice(0, 10) || "—",
    },
    {
      key: "end_date",
      header: "End Date",
      render: (r) => r.end_date?.slice(0, 10) || "—",
    },
    {
      key: "is_active",
      header: "Status",
      render: (r) => (
        <Badge variant={r.is_active ? "green" : "gray"}>
          {r.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "students_count",
      header: "Students",
      render: (r) => r.students_count ?? "—",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Scholarships</h1>
      <Card>
        <CardHeader>
          <CardTitle>Scholarship Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={scholarships}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
