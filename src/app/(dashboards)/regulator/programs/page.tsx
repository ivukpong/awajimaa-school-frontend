"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useGovernmentPrograms } from "@/hooks/useGovernment";
import type {
  GovernmentProgram,
  ProgramApplication,
  ProgramCategory,
} from "@/types/government";
import { Plus, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  draft: "gray",
  open: "blue",
  closed: "gray",
  ongoing: "green",
  completed: "green",
  cancelled: "red",
};
const appStatusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  submitted: "yellow",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  disbursed: "green",
};

const categories = [
  "scholarship",
  "grant",
  "infrastructure",
  "training",
  "equipment",
  "other",
] as const;

export default function RegulatorProgramsPage() {
  const {
    programs,
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
    reviewApplication,
    disburseApplication,
  } = useGovernmentPrograms();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "grant",
    description: "",
    budget: "",
    application_deadline: "",
    eligibility_criteria: "",
  });
  const [applications, setApplications] = useState<ProgramApplication[]>([]);
  const [viewingApps, setViewingApps] = useState<GovernmentProgram | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title) return toast.error("Name required");
    setSaving(true);
    try {
      const { eligibility_criteria: ec, ...rest } = form;
      await createProgram({
        ...rest,
        category: form.category as ProgramCategory,
        budget: form.budget ? Number(form.budget) : undefined,
        eligibility_criteria: ec ? ec.split("\n").filter(Boolean) : undefined,
      });
      toast.success("Program created");
      setShowModal(false);
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (
    appId: number,
    status: "approved" | "rejected",
    reviewer_notes?: string,
  ) => {
    try {
      await reviewApplication(appId, { status, reviewer_notes });
      toast.success("Application reviewed");
    } catch {
      toast.error("Failed to review");
    }
  };

  const handleDisburse = async (appId: number, amount: number) => {
    try {
      await disburseApplication(appId, amount);
      toast.success("Disbursed");
    } catch {
      toast.error("Disbursement failed");
    }
  };

  const programColumns: Column<GovernmentProgram>[] = [
    {
      key: "title",
      header: "Program",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <Badge variant="blue">{r.category}</Badge>,
    },
    {
      key: "budget",
      header: "Amount",
      render: (r) =>
        r.budget ? `₦${Number(r.budget).toLocaleString()}` : "Open",
    },
    { key: "application_deadline", header: "Deadline" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "id" as keyof GovernmentProgram,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          {r.status === "draft" && (
            <Button
              size="sm"
              onClick={() =>
                updateProgram(r.id, { status: "open" })
                  .then(() => toast.success("Published"))
                  .catch(() => toast.error("Failed"))
              }
            >
              Publish
            </Button>
          )}
          {r.status === "open" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                updateProgram(r.id, { status: "closed" })
                  .then(() => toast.success("Closed"))
                  .catch(() => toast.error("Failed"))
              }
            >
              Close
            </Button>
          )}
        </div>
      ),
    },
  ];

  const appColumns: Column<ProgramApplication>[] = [
    {
      key: "school_id",
      header: "School",
      render: (r) => (
        <span>
          {(r as ProgramApplication & { school?: { name: string } }).school
            ?.name ?? `School ${r.school_id}`}
        </span>
      ),
    },
    {
      key: "requested_amount",
      header: "Requested",
      render: (r) =>
        r.requested_amount
          ? `₦${Number(r.requested_amount).toLocaleString()}`
          : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={appStatusColors[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "id" as keyof ProgramApplication,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.status === "submitted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleReview(r.id, "approved")}
            >
              Approve
            </Button>
          )}
          {r.status === "submitted" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleReview(r.id, "rejected")}
            >
              Reject
            </Button>
          )}
          {r.status === "approved" && r.requested_amount && (
            <Button
              size="sm"
              onClick={() => handleDisburse(r.id, Number(r.requested_amount))}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Disburse
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Government Programs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage grants, scholarships, and programs
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            keyField="id"
            columns={programColumns}
            data={
              (programs?.data ?? []) as unknown as (GovernmentProgram &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">New Government Program</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Total Budget (₦)</label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={form.application_deadline}
                  onChange={(e) =>
                    setForm({ ...form, application_deadline: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
