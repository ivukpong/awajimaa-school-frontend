"use client";
import React, { useState } from "react";
import {
  useMyInsurancePackages,
  useCreateInsurancePackage,
  useUpdateInsurancePackage,
  useDeleteInsurancePackage,
} from "@/hooks/useInsurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import type { InsurancePackage } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const EMPTY_FORM: {
  name: string;
  description: string;
  media_url: string;
  premium: string;
  subscription_type: "one_time" | "recurring";
  duration_months: string;
  coverage_type: "school" | "student" | "both";
  benefits: string;
  is_active: boolean;
} = {
  name: "",
  description: "",
  media_url: "",
  premium: "",
  subscription_type: "one_time",
  duration_months: "",
  coverage_type: "school",
  benefits: "",
  is_active: true,
};

export default function InsurancePackagesPage() {
  const { data, isLoading } = useMyInsurancePackages();
  const create = useCreateInsurancePackage();
  const update = useUpdateInsurancePackage();
  const remove = useDeleteInsurancePackage();

  const packages = (data?.data as InsurancePackage[] | undefined) ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InsurancePackage | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(pkg: InsurancePackage) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description ?? "",
      media_url: pkg.media_url ?? "",
      premium: String(pkg.premium),
      subscription_type: pkg.subscription_type,
      duration_months: pkg.duration_months ? String(pkg.duration_months) : "",
      coverage_type: pkg.coverage_type,
      benefits: (pkg.benefits ?? []).join("\n"),
      is_active: pkg.is_active,
    });
    setShowModal(true);
  }

  function handleSave() {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      media_url: form.media_url || undefined,
      premium: Number(form.premium),
      subscription_type: form.subscription_type,
      duration_months: form.duration_months
        ? Number(form.duration_months)
        : undefined,
      coverage_type: form.coverage_type,
      benefits: form.benefits
        ? form.benefits
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean)
        : undefined,
      is_active: form.is_active,
    };

    if (editing) {
      update.mutate(
        { id: editing.id, ...payload },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      create.mutate(payload, { onSuccess: () => setShowModal(false) });
    }
  }

  const columns: Column<InsurancePackage>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "premium",
      header: "Premium",
      render: (r) => formatCurrency(r.premium),
    },
    {
      key: "subscription_type",
      header: "Type",
      render: (r) => (
        <Badge variant={r.subscription_type === "recurring" ? "blue" : "gray"}>
          {r.subscription_type === "recurring" ? "Recurring" : "One-Time"}
        </Badge>
      ),
    },
    {
      key: "duration_months",
      header: "Duration",
      render: (r) =>
        r.duration_months ? `${r.duration_months} months` : "Unlimited",
    },
    {
      key: "coverage_type",
      header: "Coverage",
      render: (r) => <Badge variant="gray">{r.coverage_type}</Badge>,
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
      key: "id",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => remove.mutate(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insurance Packages</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={packages}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Package" : "New Insurance Package"}
      >
        <div className="space-y-4">
          <Input
            label="Package Title"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. School Fire & Flood Protection"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Describe what this insurance covers…"
          />
          <Input
            label="Media Banner / Video URL"
            value={form.media_url}
            onChange={(e) => setForm({ ...form, media_url: e.target.value })}
            placeholder="https://…"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Premium Amount (₦)"
              type="number"
              value={form.premium}
              onChange={(e) => setForm({ ...form, premium: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subscription Type
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={form.subscription_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subscription_type: e.target.value as
                      | "one_time"
                      | "recurring",
                  })
                }
              >
                <option value="one_time">One-Time Premium</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (months)"
              type="number"
              value={form.duration_months}
              onChange={(e) =>
                setForm({ ...form, duration_months: e.target.value })
              }
              placeholder="Leave blank for unlimited"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coverage Type
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={form.coverage_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    coverage_type: e.target.value as
                      | "school"
                      | "student"
                      | "both",
                  })
                }
              >
                <option value="school">School</option>
                <option value="student">Student</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <Textarea
            label="Benefits (one per line)"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            rows={4}
            placeholder={
              "Covers fire damage up to ₦10M\nFlood protection\nTheft coverage"
            }
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            <label
              htmlFor="is_active"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Active (visible to schools)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={create.isPending || update.isPending}
            >
              {editing ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
