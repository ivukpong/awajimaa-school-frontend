"use client";
import React, { useState } from "react";
import {
  useInsuranceClaims,
  useReviewInsuranceClaim,
} from "@/hooks/useInsurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import type { InsuranceClaim } from "@/types";

const STATUS_VARIANTS: Record<
  string,
  "blue" | "yellow" | "green" | "red" | "gray"
> = {
  pending: "yellow",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  paid: "green",
};

export default function InsuranceClaimsPage() {
  const { data, isLoading } = useInsuranceClaims();
  const review = useReviewInsuranceClaim();

  const claims = (data?.data as InsuranceClaim[] | undefined) ?? [];

  const [selected, setSelected] = useState<InsuranceClaim | null>(null);
  const [form, setForm] = useState({
    status: "under_review" as InsuranceClaim["status"],
    review_notes: "",
    amount_approved: "",
  });

  function openReview(claim: InsuranceClaim) {
    setSelected(claim);
    setForm({
      status: claim.status === "pending" ? "under_review" : claim.status,
      review_notes: claim.review_notes ?? "",
      amount_approved: claim.amount_approved
        ? String(claim.amount_approved)
        : "",
    });
  }

  function handleSubmit() {
    if (!selected) return;
    review.mutate(
      {
        id: selected.id,
        status: form.status as any,
        review_notes: form.review_notes || undefined,
        amount_approved: form.amount_approved
          ? Number(form.amount_approved)
          : undefined,
      },
      { onSuccess: () => setSelected(null) },
    );
  }

  const columns: Column<InsuranceClaim>[] = [
    {
      key: "school_id",
      header: "School",
      render: (r) => r.school?.name ?? "—",
    },
    { key: "claim_type", header: "Claim Type", sortable: true },
    {
      key: "scheme",
      header: "Package",
      render: (r) => r.scheme?.name ?? "—",
    },
    {
      key: "amount_claimed",
      header: "Claimed",
      render: (r) => formatCurrency(r.amount_claimed),
    },
    {
      key: "amount_approved",
      header: "Approved",
      render: (r) =>
        r.amount_approved != null ? formatCurrency(r.amount_approved) : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={STATUS_VARIANTS[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Submitted",
      render: (r) => r.created_at.slice(0, 10),
    },
    {
      key: "id",
      header: "Action",
      render: (r) =>
        r.status !== "paid" ? (
          <Button size="sm" variant="outline" onClick={() => openReview(r)}>
            Review
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Insurance Claims</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Submitted Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={claims}
            keyField="id"
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Review Claim"
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-1 text-sm">
              <p>
                <span className="font-medium">School:</span>{" "}
                {selected.school?.name}
              </p>
              <p>
                <span className="font-medium">Type:</span> {selected.claim_type}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {selected.description}
              </p>
              <p>
                <span className="font-medium">Amount Claimed:</span>{" "}
                {formatCurrency(selected.amount_claimed)}
              </p>
              {selected.evidence_urls && selected.evidence_urls.length > 0 && (
                <div>
                  <span className="font-medium">Evidence:</span>{" "}
                  {selected.evidence_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline ml-1"
                    >
                      Doc {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Status
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
              >
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid Out</option>
              </select>
            </div>

            {(form.status === "approved" || form.status === "paid") && (
              <Input
                label="Approved Amount (₦)"
                type="number"
                value={form.amount_approved}
                onChange={(e) =>
                  setForm({ ...form, amount_approved: e.target.value })
                }
              />
            )}

            <Textarea
              label="Review Notes"
              value={form.review_notes}
              onChange={(e) =>
                setForm({ ...form, review_notes: e.target.value })
              }
              rows={3}
              placeholder="Add notes for the school…"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={review.isPending}>
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
