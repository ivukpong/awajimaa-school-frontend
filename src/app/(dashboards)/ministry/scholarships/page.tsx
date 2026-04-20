"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, del } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Scholarship {
  id: number;
  name: string;
  type: string;
  description?: string;
  amount?: number;
  total_budget?: number;
  max_beneficiaries?: number;
  academic_year?: string;
  target_school_types?: string[];
  eligibility_criteria?: string;
  application_deadline?: string;
  status: string;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "scholarship", label: "Scholarship" },
  { value: "bursary", label: "Bursary" },
  { value: "grant", label: "Grant" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "awarded", label: "Awarded" },
];

const SCHOOL_TYPES = ["nursery", "primary", "secondary", "tertiary"];

const TYPE_VARIANT: Record<string, "blue" | "green" | "purple"> = {
  scholarship: "blue",
  bursary: "green",
  grant: "purple",
};

const STATUS_VARIANT: Record<string, "gray" | "green" | "yellow" | "blue"> = {
  draft: "gray",
  open: "green",
  closed: "yellow",
  awarded: "blue",
};

const EMPTY_FORM = {
  name: "",
  type: "scholarship",
  description: "",
  amount: "",
  total_budget: "",
  max_beneficiaries: "",
  academic_year: "",
  target_school_types: [] as string[],
  eligibility_criteria: "",
  application_deadline: "",
  status: "draft",
};

export default function MinistryScholarshipsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Scholarship | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Scholarship[] }>({
    queryKey: ["ministry-scholarships"],
    queryFn: () =>
      get<{ data: Scholarship[] }>("/ministry/scholarships").then(
        (r) => r.data,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      post("/ministry/scholarships", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-scholarships"] });
      toast.success("Scholarship created.");
      closeModal();
    },
    onError: () => toast.error("Failed to create scholarship."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => patch(`/ministry/scholarships/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-scholarships"] });
      toast.success("Scholarship updated.");
      closeModal();
    },
    onError: () => toast.error("Failed to update scholarship."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/ministry/scholarships/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-scholarships"] });
      toast.success("Scholarship deleted.");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete scholarship."),
  });

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(s: Scholarship) {
    setEditItem(s);
    setForm({
      name: s.name,
      type: s.type,
      description: s.description ?? "",
      amount: s.amount != null ? String(s.amount) : "",
      total_budget: s.total_budget != null ? String(s.total_budget) : "",
      max_beneficiaries:
        s.max_beneficiaries != null ? String(s.max_beneficiaries) : "",
      academic_year: s.academic_year ?? "",
      target_school_types: s.target_school_types ?? [],
      eligibility_criteria: s.eligibility_criteria ?? "",
      application_deadline: s.application_deadline ?? "",
      status: s.status,
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
      target_school_types: prev.target_school_types.includes(type)
        ? prev.target_school_types.filter((t) => t !== type)
        : [...prev.target_school_types, type],
    }));
  }

  function buildPayload() {
    return {
      name: form.name,
      type: form.type,
      description: form.description || undefined,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      total_budget: form.total_budget
        ? parseFloat(form.total_budget)
        : undefined,
      max_beneficiaries: form.max_beneficiaries
        ? parseInt(form.max_beneficiaries)
        : undefined,
      academic_year: form.academic_year || undefined,
      target_school_types: form.target_school_types.length
        ? form.target_school_types
        : undefined,
      eligibility_criteria: form.eligibility_criteria || undefined,
      application_deadline: form.application_deadline || undefined,
      status: form.status,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required.");
    const payload = buildPayload();
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const scholarships = data?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scholarships & Bursaries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage state scholarships, bursaries and grants for
            students
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Scholarship
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scholarships ({scholarships.length})</CardTitle>
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
          ) : scholarships.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <GraduationCap className="h-10 w-10 mb-3" />
              <p className="text-sm">No scholarships created yet.</p>
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
                      Type
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Amount (₦)
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Deadline
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
                  {scholarships.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={TYPE_VARIANT[s.type] ?? "gray"}>
                          {TYPE_OPTIONS.find((o) => o.value === s.type)
                            ?.label ?? s.type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {s.amount != null
                          ? `₦${Number(s.amount).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {s.application_deadline ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[s.status] ?? "gray"}>
                          {STATUS_OPTIONS.find((o) => o.value === s.status)
                            ?.label ?? s.status}
                        </Badge>
                      </td>
                      <td className="py-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(s.id)}
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
        title={editItem ? "Edit Scholarship" : "New Scholarship"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Governor's Merit Scholarship"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount per Beneficiary (₦)
              </label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Budget (₦)
              </label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.total_budget}
                onChange={(e) =>
                  setForm({ ...form, total_budget: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Beneficiaries
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.max_beneficiaries}
                onChange={(e) =>
                  setForm({ ...form, max_beneficiaries: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Year
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
                placeholder="e.g. 2024/2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target School Types
            </label>
            <div className="flex flex-wrap gap-3">
              {SCHOOL_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.target_school_types.includes(type)}
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
              Eligibility Criteria
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={2}
              value={form.eligibility_criteria}
              onChange={(e) =>
                setForm({ ...form, eligibility_criteria: e.target.value })
              }
              placeholder="e.g. Students with CGPA 4.5 and above..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.application_deadline}
              onChange={(e) =>
                setForm({ ...form, application_deadline: e.target.value })
              }
            />
          </div>

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
        title="Delete Scholarship"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this scholarship?
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
