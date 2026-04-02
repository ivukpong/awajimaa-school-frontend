"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import { Plus, Search, Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { formatRole } from "@/lib/utils";
import toast from "react-hot-toast";

const ROLES = [
  "super_admin",
  "regulator",
  "state_regulator",
  "lga_regulator",
  "school_admin",
  "branch_admin",
  "teacher",
  "freelancer_teacher",
  "student",
  "parent",
  "sponsor",
  "revenue_collector",
  "security",
];

/** Roles that require a school_id */
const SCHOOL_ROLES = new Set([
  "school_admin",
  "branch_admin",
  "teacher",
  "student",
  "parent",
  "revenue_collector",
  "security",
]);
/** Roles that also require a branch_id */
const BRANCH_ROLES = new Set(["branch_admin", "teacher", "student"]);
/** Roles that require a state_id */
const STATE_ROLES = new Set(["state_regulator", "lga_regulator"]);
/** Roles that also require an lga_id */
const LGA_ROLES = new Set(["lga_regulator"]);

const roleBadgeVariant = (
  role: string,
): "blue" | "purple" | "green" | "yellow" | "gray" | "red" => {
  if (role === "super_admin") return "purple";
  if (role.includes("regulator")) return "blue";
  if (role.includes("admin")) return "green";
  if (role === "teacher" || role === "freelancer_teacher") return "yellow";
  if (role === "security") return "red";
  return "gray";
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

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  school_id: string;
  branch_id: string;
  class_room_id: string;
  state_id: string;
  lga_id: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "teacher",
  school_id: "",
  branch_id: "",
  class_room_id: "",
  state_id: "",
  lga_id: "",
};

function userToForm(user: User): FormState {
  return {
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    password: "",
    role: String(user.role ?? "teacher"),
    school_id: String((user as any).school_id ?? ""),
    branch_id: String((user as any).branch_id ?? ""),
    class_room_id: String((user as any).current_class_id ?? ""),
    state_id: String((user as any).state_id ?? ""),
    lga_id: String((user as any).lga_id ?? ""),
  };
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Reset branch/class when school changes
  useEffect(() => {
    setForm((f) => ({ ...f, branch_id: "", class_room_id: "" }));
  }, [form.school_id]);
  // Reset class when branch changes
  useEffect(() => {
    setForm((f) => ({ ...f, class_room_id: "" }));
  }, [form.branch_id]);
  // Reset location fields when role changes
  useEffect(() => {
    setForm((f) => ({
      ...f,
      school_id: "",
      branch_id: "",
      class_room_id: "",
      state_id: "",
      lga_id: "",
    }));
  }, [form.role]);

  // ── Data fetch ────────────────────────────────────────────────────────────
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => get<any>("/users").then((r) => r.data?.data ?? r.data ?? []),
  });
  const users: User[] = Array.isArray(usersData) ? usersData : [];

  const { data: schoolsData } = useQuery({
    queryKey: ["schools-list"],
    queryFn: () =>
      get<any>("/schools?per_page=200").then((r) => r.data?.data ?? []),
    enabled: modal !== null,
  });
  const schools: { id: number; name: string }[] = Array.isArray(schoolsData)
    ? schoolsData
    : [];

  const { data: branchesData } = useQuery({
    queryKey: ["branches-list", form.school_id],
    queryFn: () =>
      get<any>(`/branches?school_id=${form.school_id}&per_page=100`).then(
        (r) => r.data?.data ?? [],
      ),
    enabled: !!form.school_id && BRANCH_ROLES.has(form.role),
  });
  const branches: { id: number; name: string }[] = Array.isArray(branchesData)
    ? branchesData
    : [];

  const { data: classesData } = useQuery({
    queryKey: ["classes-list", form.branch_id],
    queryFn: () =>
      get<any>(`/classrooms?branch_id=${form.branch_id}&per_page=100`).then(
        (r) => r.data?.data ?? [],
      ),
    enabled: !!form.branch_id && form.role === "student",
  });
  const classRooms: { id: number; name: string }[] = Array.isArray(classesData)
    ? classesData
    : [];

  const { data: statesData } = useQuery({
    queryKey: ["states-list"],
    queryFn: () =>
      get<any>("/states?per_page=50").then((r) => r.data?.data ?? []),
    enabled: !!modal && STATE_ROLES.has(form.role),
  });
  const states: { id: number; name: string }[] = Array.isArray(statesData)
    ? statesData
    : [];

  const { data: lgasData } = useQuery({
    queryKey: ["lgas-list", form.state_id],
    queryFn: () =>
      get<any>(`/lgas?state_id=${form.state_id}&per_page=100`).then(
        (r) => r.data?.data ?? [],
      ),
    enabled: !!form.state_id && LGA_ROLES.has(form.role),
  });
  const lgas: { id: number; name: string }[] = Array.isArray(lgasData)
    ? lgasData
    : [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      modal === "edit"
        ? patch(`/users/${(form as any).__id}`, payload)
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal("create");
  }
  function openEdit(row: User) {
    setForm({ ...userToForm(row), __id: row.id } as any);
    setModal("edit");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) {
      toast.error("Name, email and role are required.");
      return;
    }
    if (modal === "create" && !form.password) {
      toast.error("Password is required for new users.");
      return;
    }
    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
    };
    if (modal === "create") payload.password = form.password;
    if (form.school_id) payload.school_id = form.school_id;
    if (form.branch_id) payload.branch_id = form.branch_id;
    if (form.class_room_id) payload.class_room_id = form.class_room_id;
    if (form.state_id) payload.state_id = form.state_id;
    if (form.lga_id) payload.lga_id = form.lga_id;
    saveMutation.mutate(payload);
  }

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  // ── Columns ───────────────────────────────────────────────────────────────
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
        <Badge variant={roleBadgeVariant(row.role)}>
          {formatRole(row.role)}
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
            onClick={() => openEdit(row)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
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
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
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
              {formatRole(r)}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModal(null)}
          />
          <Card className="relative w-full max-w-lg mx-4 my-10 z-10">
            <CardHeader>
              <CardTitle>
                {modal === "edit" ? "Edit User" : "Add User"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role — always first */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...field("role")}
                    required
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {formatRole(r)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input label="Name" {...field("name")} required />
                <Input
                  label="Email"
                  type="email"
                  {...field("email")}
                  required
                />
                {modal === "create" && (
                  <Input
                    label="Password"
                    type="password"
                    {...field("password")}
                    required
                  />
                )}
                <Input label="Phone" {...field("phone")} />

                {/* School selector */}
                {SCHOOL_ROLES.has(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      School
                    </label>
                    <select
                      {...field("school_id")}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">— Select school —</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Branch selector — only if school chosen and role needs it */}
                {BRANCH_ROLES.has(form.role) && form.school_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch
                    </label>
                    <select
                      {...field("branch_id")}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">— Select branch —</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Class room — only for students with a branch chosen */}
                {form.role === "student" && form.branch_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Class Room
                    </label>
                    <select
                      {...field("class_room_id")}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">— Select class —</option>
                      {classRooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* State selector */}
                {STATE_ROLES.has(form.role) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State
                    </label>
                    <select
                      {...field("state_id")}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">— Select state —</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* LGA selector */}
                {LGA_ROLES.has(form.role) && form.state_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LGA
                    </label>
                    <select
                      {...field("lga_id")}
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">— Select LGA —</option>
                      {lgas.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
