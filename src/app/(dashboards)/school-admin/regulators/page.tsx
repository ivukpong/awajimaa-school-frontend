"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import type { User } from "@/types/index";
import type { VerificationForm, FormSubmission } from "@/types/finance";

export default function RegulatorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["school-admin", "regulators-dashboard"],
    queryFn: async () => {
      const [regulatorsRes, formsRes, submissionsRes] = await Promise.all([
        get<{ data?: User[] } | User[]>("/users?role=regulator"),
        get<{ data?: VerificationForm[] } | VerificationForm[]>(
          "/verification-forms",
        ),
        get<{ data?: FormSubmission[] } | FormSubmission[]>(
          "/form-submissions",
        ),
      ]);
      return {
        regulators: Array.isArray(regulatorsRes.data)
          ? regulatorsRes.data
          : (regulatorsRes.data?.data ?? []),
        forms: Array.isArray(formsRes.data)
          ? formsRes.data
          : (formsRes.data?.data ?? []),
        submissions: Array.isArray(submissionsRes.data)
          ? submissionsRes.data
          : (submissionsRes.data?.data ?? []),
      };
    },
  });
  const regulators = data?.regulators ?? [];
  const forms = data?.forms ?? [];
  const submissions = data?.submissions ?? [];

  const regColumns: Column<User>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
  ];
  const formColumns: Column<VerificationForm>[] = [
    { key: "title", header: "Form Title", sortable: true },
    {
      key: "is_active",
      header: "Active",
      render: (r) => (r.is_active ? "Yes" : "No"),
    },
    {
      key: "created_at",
      header: "Created",
      render: (r) => r.created_at?.slice(0, 10) || "—",
    },
  ];
  const subColumns: Column<FormSubmission>[] = [
    { key: "id", header: "ID" },
    { key: "status", header: "Status" },
    {
      key: "submitted_at",
      header: "Submitted",
      render: (r) => r.submitted_at?.slice(0, 10) || "—",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Regulators</h1>
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={regColumns}
            data={regulators}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Verification Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={formColumns}
            data={forms}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={subColumns}
            data={submissions}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
