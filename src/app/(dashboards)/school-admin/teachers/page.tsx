"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api";
import {
  PlusCircle,
  Search,
  UserCheck,
  BookOpen,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Teacher extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  branch?: { name: string };
  is_active: boolean;
  created_at: string;
}

const emptyForm = { name: "", email: "", password: "", phone: "" };

export default function TeachersPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["teachers", search],
    queryFn: () =>
      get<{ data: Teacher[] }>("/users", {
        params: { role: "teacher", search },
      }),
  });

  const addTeacher = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      post("/users", { ...f, role: "teacher", school_id: user?.school_id }),
    onSuccess: () => {
      toast.success("Teacher added successfully");
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to add teacher"),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) =>
      post(`/users/${id}/toggle-active`, { is_active: val }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
  });

  const columns: Column<Teacher>[] = [
    {
      key: "name",
      header: "Name",
      render: (t) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold">
            {t.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{t.name}</p>
            <p className="text-xs text-gray-500">{t.email}</p>
          </div>
        </div>
      ),
    },
    { key: "branch", header: "Branch", render: (t) => t.branch?.name ?? "—" },
    { key: "phone", header: "Phone", render: (t) => t.phone ?? "—" },
    {
      key: "is_active",
      header: "Status",
      render: (t) => (
        <Badge variant={t.is_active ? "green" : "red"}>
          {t.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (t) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toggleActive.mutate({ id: t.id, val: !t.is_active })}
        >
          {t.is_active ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  const teachers = data?.data.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teachers
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Add Teacher
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Teacher</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addTeacher.mutate(form);
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
                label="Phone (optional)"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
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
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={addTeacher.isPending}>
                  Add Teacher
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <UserCheck className="text-brand" size={28} />
            <div>
              <p className="text-xs text-gray-500">Total Teachers</p>
              <p className="text-xl font-bold">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BookOpen className="text-green-500" size={28} />
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold">
                {teachers.filter((t) => t.is_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="text-yellow-500" size={28} />
            <div>
              <p className="text-xs text-gray-500">Inactive</p>
              <p className="text-xl font-bold">
                {teachers.filter((t) => !t.is_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <Input
            placeholder="Search by name or email…"
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={teachers}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
