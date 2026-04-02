"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Search, Download, Eye, Edit, Copy, Flag } from "lucide-react";
import { buildStudentPublicUrl } from "@/lib/utils";
import { useStudents, type Student } from "@/hooks/useStudents";
import { post } from "@/lib/api";
import toast from "react-hot-toast";

export default function SchoolAdminStudentsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useStudents({});
  const allStudents: Student[] = data?.data?.data ?? [];

  const filtered = allStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase()),
  );

  const markNeedy = useMutation({
    mutationFn: (studentId: number) =>
      post(`/students/${studentId}/mark-needy`, { is_needy: true }),
    onSuccess: () => {
      toast.success("Student marked as needy");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const columns: Column<Student>[] = [
    { key: "admission_number", header: "Reg. No.", sortable: true },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {r.full_name}
        </span>
      ),
    },
    {
      key: "class_room",
      header: "Class",
      render: (r) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {r.class_room?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "gender",
      header: "Gender",
      render: (r) => (
        <Badge variant={r.gender === "female" ? "purple" : "blue"}>
          {r.gender}
        </Badge>
      ),
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
      key: "public_token",
      header: "Profile Link",
      render: (r) => (
        <button
          className="flex items-center gap-1 text-xs text-brand hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(
              buildStudentPublicUrl(r.public_token),
            );
            toast.success("Link copied!");
          }}
        >
          <Copy className="h-3 w-3" /> Copy Link
        </button>
      ),
    },
    {
      key: "id",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
          <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Edit className="h-4 w-4 text-gray-500" />
          </button>
          <button
            className="rounded p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            title="Mark as Needy"
            onClick={(e) => {
              e.stopPropagation();
              markNeedy.mutate(r.id);
            }}
          >
            <Flag className="h-4 w-4 text-yellow-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {allStudents.length.toLocaleString()} enrolled students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Enroll Student
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name or reg. number..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="flex-1"
          />
        </div>
      </Card>

      <Table
        keyField="id"
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No students found."
      />
    </div>
  );
}
