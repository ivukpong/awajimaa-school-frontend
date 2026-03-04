"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useSchoolApprovals } from "@/hooks/useGovernment";
import type { SchoolApprovalRequest } from "@/types/government";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "gray" | "yellow" | "green" | "red"> = {
  pending: "yellow",
  under_review: "yellow",
  approved: "green",
  rejected: "red",
};

export default function RegulatorApprovalsPage() {
  const { requests, loading, reviewRequest } = useSchoolApprovals();
  const [search, setSearch] = useState("");
  const [reviewModal, setReviewModal] = useState<{
    request: SchoolApprovalRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = (requests?.data ?? []).filter(
    (r) =>
      r.subject?.toLowerCase().includes(search.toLowerCase()) ||
      r.request_type
        ?.replace(/_/g, " ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const handleReview = async () => {
    if (!reviewModal) return;
    setSaving(true);
    try {
      await reviewRequest(reviewModal.request.id, {
        status: reviewModal.action,
        reviewer_notes: reviewNotes,
      });
      toast.success(`Request ${reviewModal.action}`);
      setReviewModal(null);
      setReviewNotes("");
    } catch {
      toast.error("Review failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<SchoolApprovalRequest>[] = [
    {
      key: "request_number",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-sm">{r.request_number}</span>
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
      key: "subject",
      header: "Subject",
      render: (r) => <span className="font-medium">{r.subject}</span>,
    },
    {
      key: "school_id" as keyof SchoolApprovalRequest,
      header: "School",
      render: (r) => (
        <span>
          {(r as SchoolApprovalRequest & { school?: { name: string } }).school
            ?.name ?? `School ${r.school_id}`}
        </span>
      ),
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
      key: "id" as keyof SchoolApprovalRequest,
      header: "Actions",
      render: (r) =>
        ["pending", "under_review"].includes(r.status) ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => {
                setReviewModal({ request: r, action: "approved" });
                setReviewNotes("");
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setReviewModal({ request: r, action: "rejected" });
                setReviewNotes("");
              }}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Approval Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and process school approval submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={
              rows as unknown as (SchoolApprovalRequest &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold capitalize">
              {reviewModal.action} Request
            </h2>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm">
              <p className="font-medium">{reviewModal.request.subject}</p>
              <p className="text-gray-500 mt-1">
                {reviewModal.request.description}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">
                Notes{" "}
                {reviewModal.action === "rejected"
                  ? "(required)"
                  : "(optional)"}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Reviewer notes…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setReviewModal(null)}>
                Cancel
              </Button>
              <Button
                variant={
                  reviewModal.action === "approved" ? "primary" : "danger"
                }
                onClick={handleReview}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : reviewModal.action === "approved"
                    ? "Approve"
                    : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
