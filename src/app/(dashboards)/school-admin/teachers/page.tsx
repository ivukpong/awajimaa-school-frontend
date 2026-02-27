"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api";
import { PlusCircle, Search, UserCheck, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  branch?: { name: string };
  is_active: boolean;
  created_at: string;
}

export default function TeachersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["teachers", search],
    queryFn: () =>
      get<{ data: Teacher[] }>("/users", { role: "teacher", search }),
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

  const teachers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teachers
        </h1>
        <Button leftIcon={<PlusCircle size={16} />}>Add Teacher</Button>
      </div>

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
          <Table columns={columns} data={teachers} loading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
