"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Copy,
  Flag,
  X,
  Link2,
} from "lucide-react";
import { buildStudentPublicUrl } from "@/lib/utils";
import { useStudents, type Student } from "@/hooks/useStudents";
import { get, post } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface ClassRoom {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  gender: "male",
  date_of_birth: "",
  admission_date: "",
  admission_number: "",
  current_class_id: "",
};

export default function SchoolAdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showLinkModal, setShowLinkModal] = useState<number | null>(null); // student id
  const [linkUserId, setLinkUserId] = useState("");
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get<ClassRoom[]>("/classes"),
  });
  const classes: ClassRoom[] = classesData?.data ?? [];

  const { data, isLoading } = useStudents({});
  const allStudents: Student[] = data?.data?.data ?? [];

  const filtered = allStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase()),
  );

  const enroll = useMutation({
    mutationFn: async (f: typeof emptyForm) => {
      const userRes = await post<{ id: number }>("/users", {
        name: f.name,
        email: f.email,
        password: f.password,
        role: "student",
        school_id: user?.school_id,
      });
      const userId = (userRes.data as { id: number }).id;
      await post("/students", {
        user_id: userId,
        school_id: user?.school_id,
        gender: f.gender,
        date_of_birth: f.date_of_birth,
        admission_date: f.admission_date,
        admission_number: f.admission_number || undefined,
        current_class_id: f.current_class_id
          ? Number(f.current_class_id)
          : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Student enrolled successfully");
      qc.invalidateQueries({ queryKey: ["students"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to enroll student"),
  });

  const markNeedy = useMutation({
    mutationFn: (studentId: number) =>
      post(`/students/${studentId}/mark-needy`, { is_needy: true }),
    onSuccess: () => {
      toast.success("Student marked as needy");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const linkUser = useMutation({
    mutationFn: ({
      studentId,
      userId,
    }: {
      studentId: number;
      userId: number;
    }) => post(`/students/${studentId}/link-user`, { user_id: userId }),
    onSuccess: () => {
      toast.success("User linked to student successfully");
      qc.invalidateQueries({ queryKey: ["students"] });
      setShowLinkModal(null);
      setLinkUserId("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to link user");
    },
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
          {!r.user_id && (
            <button
              className="rounded p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Link User Account"
              onClick={(e) => {
                e.stopPropagation();
                setShowLinkModal(r.id);
                setLinkUserId("");
              }}
            >
              <Link2 className="h-4 w-4 text-blue-500" />
            </button>
          )}
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
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowForm(true)}
          >
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Enroll New Student</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                enroll.mutate(form);
              }}
            >
              <Input
                label="Full Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
              <Input
                label="Temporary Password"
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender *
                </label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gender: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <Input
                label="Date of Birth"
                type="date"
                required
                value={form.date_of_birth}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date_of_birth: e.target.value }))
                }
              />
              <Input
                label="Admission Date"
                type="date"
                required
                value={form.admission_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, admission_date: e.target.value }))
                }
              />
              <Input
                label="Admission Number (optional)"
                value={form.admission_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, admission_number: e.target.value }))
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class (optional)
                </label>
                <select
                  value={form.current_class_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, current_class_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={enroll.isPending}>
                  Enroll Student
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Table
        keyField="id"
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No students found."
      />

      {/* Link User Modal */}
      {showLinkModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Link User Account
              </h2>
              <button
                onClick={() => setShowLinkModal(null)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter the User ID of the account to link to this student record.
            </p>
            <Input
              label="User ID"
              type="number"
              placeholder="e.g. 42"
              value={linkUserId}
              onChange={(e) => setLinkUserId(e.target.value)}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkModal(null)}>
                Cancel
              </Button>
              <Button
                leftIcon={<Link2 className="h-4 w-4" />}
                loading={linkUser.isPending}
                disabled={!linkUserId}
                onClick={() =>
                  linkUser.mutate({
                    studentId: showLinkModal,
                    userId: Number(linkUserId),
                  })
                }
              >
                Link User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
