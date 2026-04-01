"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import type { User } from "@/types/index";

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

export default function SponsorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => get<{ data: User[] }>("/users?role=sponsor"),
  });
  const sponsors = toArray<User>(data?.data);

  const columns: Column<User>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "created_at",
      header: "Joined",
      render: (r) => r.created_at?.slice(0, 10) || "—",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Sponsors</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sponsor List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={sponsors}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
