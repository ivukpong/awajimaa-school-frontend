"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import api from "@/lib/api";
import type { SubscriptionPlan } from "@/types";

interface PlanForm {
  name: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  max_branches: string;
  max_students: string;
  max_teachers: string;
  features: string;
  is_active: boolean;
  create_paystack_plans: boolean;
}

const emptyForm: PlanForm = {
  name: "",
  description: "",
  price_monthly: "",
  price_yearly: "",
  max_branches: "",
  max_students: "",
  max_teachers: "",
  features: "",
  is_active: true,
  create_paystack_plans: false,
};

export default function SuperAdminSubscriptionsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans", "all"],
    queryFn: async () => {
      const res = await api.get("/subscription-plans/all");
      return res.data.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post("/subscription-plans", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription-plans"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/subscription-plans/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription-plans"] });
      closeModal();
    },
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      price_monthly: String(plan.price_monthly),
      price_yearly: String(plan.price_yearly),
      max_branches: String(plan.max_branches ?? ""),
      max_students: String(plan.max_students ?? ""),
      max_teachers: String(plan.max_teachers ?? ""),
      features: Array.isArray(plan.features)
        ? plan.features.join(", ")
        : (plan.features ?? ""),
      is_active: plan.is_active,
      create_paystack_plans: false,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name: form.name,
      description: form.description || undefined,
      price_monthly: parseFloat(form.price_monthly),
      price_yearly: parseFloat(form.price_yearly),
      max_branches: form.max_branches ? parseInt(form.max_branches) : undefined,
      max_students: form.max_students ? parseInt(form.max_students) : undefined,
      max_teachers: form.max_teachers ? parseInt(form.max_teachers) : undefined,
      features: form.features
        ? form.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
      is_active: form.is_active,
      create_paystack_plans: form.create_paystack_plans,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  function toggleActive(plan: SubscriptionPlan) {
    updateMutation.mutate({
      id: plan.id,
      body: { is_active: !plan.is_active },
    });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage platform subscription tiers for schools
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </button>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading plans…</p>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No plans yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create the first subscription plan to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {plan.description}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    plan.is_active
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {plan.is_active ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {plan.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly</span>
                  <span className="font-medium">
                    ₦{Number(plan.price_monthly).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Yearly</span>
                  <span className="font-medium">
                    ₦{Number(plan.price_yearly).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-gray-800">
                    {plan.max_branches ?? "∞"}
                  </p>
                  <p>Branches</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {plan.max_students ?? "∞"}
                  </p>
                  <p>Students</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {plan.max_teachers ?? "∞"}
                  </p>
                  <p>Teachers</p>
                </div>
              </div>

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className="mb-4 space-y-0.5">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-gray-600"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-gray-400">
                      +{plan.features.length - 4} more
                    </li>
                  )}
                </ul>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(plan)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {plan.is_active ? (
                    <>
                      <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Plan" : "New Subscription Plan"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="e.g. Starter, Professional, Enterprise"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Short description of what this plan includes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price (₦) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_monthly}
                    onChange={(e) =>
                      setForm({ ...form, price_monthly: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yearly Price (₦) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_yearly}
                    onChange={(e) =>
                      setForm({ ...form, price_yearly: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Branches
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_branches}
                    onChange={(e) =>
                      setForm({ ...form, max_branches: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_students}
                    onChange={(e) =>
                      setForm({ ...form, max_students: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Teachers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_teachers}
                    onChange={(e) =>
                      setForm({ ...form, max_teachers: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features
                    <span className="text-gray-400 font-normal ml-1">
                      (comma-separated)
                    </span>
                  </label>
                  <textarea
                    value={form.features}
                    onChange={(e) =>
                      setForm({ ...form, features: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    placeholder="SMS alerts, E-Learning, Payroll, Inventory"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active (visible to schools)
                    </span>
                  </label>

                  {!editing && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.create_paystack_plans}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            create_paystack_plans: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-brand focus:ring-brand"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Create on Paystack
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving…"
                    : editing
                      ? "Save Changes"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
