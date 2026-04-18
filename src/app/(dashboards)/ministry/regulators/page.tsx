"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, del } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Regulator {
  id: number;
  name: string;
  code?: string;
  level?: string;
  school_types?: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
}

const SCHOOL_TYPES = ["nursery", "primary", "secondary", "tertiary"];
const LEVEL_OPTIONS = [
  { value: "state", label: "State" },
  { value: "lga", label: "LGA" },
  { value: "federal", label: "Federal" },
];
const LEVEL_VARIANT: Record<string, "blue" | "green" | "yellow"> = {
  state: "blue",
  lga: "green",
  federal: "yellow",
};

const EMPTY_FORM = {
  name: "",
  code: "",
  level: "state",
  school_types: [] as string[],
  description: "",
  is_active: true,
};

export default function MinistryRegulatorsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Regulator | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Regulator[] }>({
    queryKey: ["ministry-regulators"],
    queryFn: () =>
      get<{ data: Regulator[] }>("/ministry/regulators").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/regulators", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-regulators"] });
      toast.success("Regulator created.");
      closeModal();
    },
    onError: () => toast.error("Failed to create regulator."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<typeof EMPTY_FORM>;
    }) => patch(`/ministry/regulators/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-regulators"] });
      toast.success("Regulator updated.");
      closeModal();
    },
    onError: () => toast.error("Failed to update regulator."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/ministry/regulators/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-regulators"] });
      toast.success("Regulator deleted.");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete regulator."),
  });

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(r: Regulator) {
    setEditItem(r);
    setForm({
      name: r.name,
      code: r.code ?? "",
      level: r.level ?? "state",
      school_types: r.school_types ?? [],
      description: r.description ?? "",
      is_active: r.is_active,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  }

  function toggleSchoolType(type: string) {
    setForm((prev) => ({
      ...prev,
      school_types: prev.school_types.includes(type)
        ? prev.school_types.filter((t) => t !== type)
        : [...prev.school_types, type],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required.");
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const regulators = data?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Regulator Organizations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bodies that regulate schools in your state
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Regulator
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulators ({regulators.length})</CardTitle>
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
          ) : regulators.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Building2 className="h-10 w-10 mb-3" />
              <p className="text-sm">No regulators added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Code
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Level
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      School Types
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regulators.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {r.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {r.code ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {r.level ? (
                          <Badge variant={LEVEL_VARIANT[r.level] ?? "gray"}>
                            {r.level.toUpperCase()}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {r.school_types?.join(", ") || "All"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={r.is_active ? "green" : "gray"}>
                          {r.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Regulator" : "Add Regulator"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. State Education Quality Assurance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. SEQA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              School Types
            </label>
            <div className="flex flex-wrap gap-3">
              {SCHOOL_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.school_types.includes(type)}
                    onChange={() => toggleSchoolType(type)}
                    className="rounded"
                  />
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description of this regulator..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : editItem ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Regulator"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this regulator? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
