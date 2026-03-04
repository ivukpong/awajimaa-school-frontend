"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useSchoolApprovals } from "@/hooks/useGovernment";
import type { SchoolApprovalRequest } from "@/types/government";
import { Plus, FileCheck } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "gray" | "yellow" | "green" | "red"> = {
  submitted: "yellow",
  under_review: "yellow",
  additional_info_required: "yellow",
  approved: "green",
  rejected: "red",
  withdrawn: "gray",
};

const requestTypes = [
  "new_registration",
  "renewal",
  "upgrade",
  "branch_addition",
  "curriculum_change",
  "ownership_change",
  "closure",
] as const;

export default function SchoolApprovalsPage() {
  const { requests, loading, createRequest } = useSchoolApprovals();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    request_type: "new_registration",
    title: "",
    description: "",
    supporting_documents: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) return toast.error("Subject required");
    setSaving(true);
    try {
      await createRequest(form);
      toast.success("Request submitted");
      setShowModal(false);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<SchoolApprovalRequest>[] = [
    {
      key: "id",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-sm">#{String(r.id).padStart(6, "0")}</span>
      ),
    },
    {
      key: "request_type",
      header: "Type",
      render: (r) => (
        <Badge variant="gray">{r.request_type.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "title",
      header: "Subject",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Submitted",
      render: (r) =>
        r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
    },
    {
      key: "review_notes",
      header: "Notes",
      render: (r) => (
        <span className="text-sm text-gray-500">{r.review_notes ?? "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Approval Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit and track regulatory approval requests
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            columns={columns}
            data={
              (requests?.data ?? []) as unknown as (SchoolApprovalRequest &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">New Approval Request</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Request Type *</label>
                <select
                  value={form.request_type}
                  onChange={(e) =>
                    setForm({ ...form, request_type: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {requestTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Brief subject line"
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
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Detailed description…"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
