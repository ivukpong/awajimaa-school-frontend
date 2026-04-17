"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, put } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface MinistryUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface UsersResponse {
  data: MinistryUser[];
}

const ROLE_OPTIONS = [
  { value: "state_ministry", label: "Ministry Staff" },
  { value: "state_regulator", label: "State Regulator" },
  { value: "lga_regulator", label: "LGA Regulator" },
];

const ROLE_LABELS: Record<string, string> = {
  state_ministry: "Ministry Staff",
  state_regulator: "State Regulator",
  lga_regulator: "LGA Regulator",
};

const ROLE_VARIANT: Record<string, "blue" | "green" | "yellow"> = {
  state_ministry: "blue",
  state_regulator: "green",
  lga_regulator: "yellow",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "state_regulator",
};

export default function MinistryUsersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<MinistryUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: res, isLoading } = useQuery<UsersResponse>({
    queryKey: ["ministry-users"],
    queryFn: () => get<UsersResponse>("/ministry/users").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => post("/ministry/users", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-users"] });
      toast.success("User created successfully.");
      closeModal();
    },
    onError: () => toast.error("Failed to create user."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<typeof EMPTY_FORM>;
    }) => put(`/ministry/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-users"] });
      toast.success("User updated.");
      closeModal();
    },
    onError: () => toast.error("Failed to update user."),
  });

  function openCreate() {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(user: MinistryUser) {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      role: user.role,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditUser(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) {
      toast.error("Name, email, and role are required.");
      return;
    }
    if (editUser) {
      const payload: Partial<typeof EMPTY_FORM> = {
        name: form.name,
        phone: form.phone,
        role: form.role,
      };
      if (form.password) payload.password = form.password;
      updateMutation.mutate({ id: editUser.id, data: payload });
    } else {
      if (!form.password) {
        toast.error("Password is required.");
        return;
      }
      createMutation.mutate(form);
    }
  }

  const users = res?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff & Roles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage ministry staff, state and LGA regulators
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Phone
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Role
                    </th>
                    <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {user.phone ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ROLE_VARIANT[user.role] ?? "gray"}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editUser ? "Edit User" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@example.com"
              disabled={!!editUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="08012345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password {!editUser && <span className="text-red-500">*</span>}
              {editUser && (
                <span className="text-gray-400 text-xs ml-1">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : editUser
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
