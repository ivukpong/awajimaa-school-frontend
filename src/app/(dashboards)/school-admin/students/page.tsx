"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Search, Download, Eye, Edit, QrCode, Copy } from "lucide-react";
import { buildStudentPublicUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface StudentRow {
  id: number;
  reg_number: string;
  full_name: string;
  class_name: string;
  gender: string;
  dob: string;
  status: string;
  unique_link_token: string;
  guardian: string;
}

const mockStudents: StudentRow[] = [
  {
    id: 1,
    reg_number: "GS/2023/001",
    full_name: "Amara Nkemdirim",
    class_name: "SS 2A",
    gender: "female",
    dob: "2008-03-14",
    status: "active",
    unique_link_token: "amr-nkm-001",
    guardian: "Mr. Nkemdirim",
  },
  {
    id: 2,
    reg_number: "GS/2023/002",
    full_name: "Chukwuemeka Okafor",
    class_name: "JSS 3B",
    gender: "male",
    dob: "2010-07-22",
    status: "active",
    unique_link_token: "chk-okf-002",
    guardian: "Mrs. Okafor",
  },
  {
    id: 3,
    reg_number: "GS/2022/088",
    full_name: "Favour Etim",
    class_name: "SS 1A",
    gender: "female",
    dob: "2009-11-05",
    status: "active",
    unique_link_token: "fvr-etm-088",
    guardian: "Mr. Etim",
  },
  {
    id: 4,
    reg_number: "GS/2021/145",
    full_name: "Obinna Dike",
    class_name: "SS 3C",
    gender: "male",
    dob: "2007-01-18",
    status: "active",
    unique_link_token: "obn-dke-145",
    guardian: "Mr & Mrs. Dike",
  },
  {
    id: 5,
    reg_number: "GS/2024/012",
    full_name: "Ifeoma Adeyemi",
    class_name: "JSS 1B",
    gender: "female",
    dob: "2012-09-09",
    status: "active",
    unique_link_token: "ife-ady-012",
    guardian: "Dr. Adeyemi",
  },
];

export default function SchoolAdminStudentsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.reg_number.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<StudentRow>[] = [
    { key: "reg_number", header: "Reg. No.", sortable: true },
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
    { key: "class_name", header: "Class", sortable: true },
    {
      key: "gender",
      header: "Gender",
      render: (r) => (
        <Badge variant={r.gender === "female" ? "purple" : "blue"}>
          {r.gender}
        </Badge>
      ),
    },
    { key: "guardian", header: "Guardian" },
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
      key: "unique_link_token",
      header: "Profile Link",
      render: (r) => (
        <button
          className="flex items-center gap-1 text-xs text-brand hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(
              buildStudentPublicUrl(r.unique_link_token),
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
      render: () => (
        <div className="flex items-center gap-1">
          <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
          <button className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Edit className="h-4 w-4 text-gray-500" />
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
            {mockStudents.length.toLocaleString()} enrolled students
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
          <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="">All Classes</option>
            <option>JSS 1</option>
            <option>JSS 2</option>
            <option>JSS 3</option>
            <option>SS 1</option>
            <option>SS 2</option>
            <option>SS 3</option>
          </select>
          <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Graduated</option>
            <option>Withdrawn</option>
          </select>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        emptyMessage="No students found."
      />
    </div>
  );
}
