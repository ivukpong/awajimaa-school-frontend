"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import { Plus, Search, Pencil, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";

const ROLES = [
  "super_admin",
  "regulator",
  "school_admin",
  "branch_admin",
  "teacher",
  "student",
  "parent",
  "sponsor",
  "revenue_collector",
];

const roleBadge: Record<
  string,
  "blue" | "purple" | "green" | "yellow" | "gray"
> = {
  super_admin: "purple",
  regulator: "blue",
  school_admin: "green",
  branch_admin: "green",
  teacher: "yellow",
  student: "gray",
  parent: "gray",
  sponsor: "blue",
  revenue_collector: "yellow",
};

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  school?: { name: string };
}

const EMPTY_USER = {
  id: 0,
  name: "",
  email: "",
  phone: "",
  role: "teacher",
  is_active: true,
  created_at: "",
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [selected, setSelected] = useState<User>(EMPTY_USER as any);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => get<any>("/users").then((r) => r.data?.data ?? r.data ?? []),
  });

  const users: User[] = Array.isArray(data) ? data : [];

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      modal === "edit"
        ? patch(`/users/${selected.id}`, payload)
        : post("/users", payload),
    onSuccess: () => {
      toast.success(modal === "edit" ? "User updated" : "User created");
      qc.invalidateQueries({ queryKey: ["users"] });
      setModal(null);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (user: User) =>
      patch(`/users/${user.id}`, { is_active: !user.is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.name}
          </p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Badge variant={roleBadge[row.role] ?? "gray"}>
          {row.role.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "school",
      header: "School",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.school?.name ?? <span className="text-gray-400 italic">—</span>}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <button onClick={() => toggleActiveMutation.mutate(row)}>
          <Badge variant={row.is_active ? "green" : "red"}>
            {row.is_active ? "Active" : "Inactive"}
          </Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setSelected(row);
              setModal("edit");
            }}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} on the platform
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(EMPTY_USER as any);
            setModal("create");
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search users…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="max-w-xs"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card padding={false}>
        <Table
          keyField="id"
          columns={columns}
          data={filtered as any}
          loading={isLoading}
          emptyMessage="No users found."
        />
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModal(null)}
          />
          <Card className="relative w-full max-w-md mx-4 z-10">
            <CardHeader>
              <CardTitle>
                {modal === "edit" ? "Edit User" : "Add User"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  // Ensure all required fields are present
                  if (
                    !fd.get("name") ||
                    !fd.get("email") ||
                    !fd.get("role") ||
                    (modal === "create" && !fd.get("password"))
                  ) {
                    toast.error("Please fill all required fields.");
                    return;
                  }
                  saveMutation.mutate(Object.fromEntries(fd));
                }}
                className="space-y-4"
              >
                <Input
                  label="Name"
                  name="name"
                  defaultValue={selected.name}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={selected.email}
                  required
                />
                {modal === "create" && (
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    required
                  />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={selected.role}
                    required
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Phone"
                  name="phone"
                  defaultValue={selected.phone}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={saveMutation.isPending}>
                    {modal === "edit" ? "Save Changes" : "Create User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
