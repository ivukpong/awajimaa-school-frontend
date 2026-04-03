"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import type {
  PlatformAccountantSummary,
  OfflinePaymentRequest,
  SchoolSubscription,
} from "@/types";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    active: "bg-green-50 text-green-700",
    expired: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    trial: "bg-blue-50 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function PlatformAccountantPage() {
  const qc = useQueryClient();
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"offline" | "subscriptions">(
    "offline",
  );

  const { data: summary, isLoading: loadingSummary } =
    useQuery<PlatformAccountantSummary>({
      queryKey: ["platform-accountant-summary"],
      queryFn: async () => {
        const res = await api.get("/platform-accountant/summary");
        return res.data.data ?? res.data;
      },
    });

  const { data: offlineRequests = [], isLoading: loadingOffline } = useQuery<
    OfflinePaymentRequest[]
  >({
    queryKey: ["offline-payment-requests"],
    queryFn: async () => {
      const res = await api.get("/offline-payment-requests");
      return res.data.data ?? res.data;
    },
  });

  const { data: allSubscriptions = [], isLoading: loadingSubs } = useQuery<
    SchoolSubscription[]
  >({
    queryKey: ["all-subscriptions"],
    queryFn: async () => {
      const res = await api.get("/subscriptions");
      return res.data.data ?? res.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      notes,
    }: {
      id: number;
      action: "approved" | "rejected";
      notes: string;
    }) =>
      api.post(`/offline-payment-requests/${id}/review`, {
        action,
        review_notes: notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offline-payment-requests"] });
      qc.invalidateQueries({ queryKey: ["platform-accountant-summary"] });
      setReviewingId(null);
      setReviewNote("");
    },
  });

  function handleReview(id: number, action: "approved" | "rejected") {
    reviewMutation.mutate({ id, action, notes: reviewNote });
  }

  const pendingOffline = offlineRequests.filter((r) => r.status === "pending");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Platform Accounting
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Revenue overview and subscription management
        </p>
      </div>

      {/* Summary cards */}
      {loadingSummary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Subscriptions"
            value={summary.total_subscriptions}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Active Subscriptions"
            value={summary.active_subscriptions}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Monthly Revenue"
            value={`₦${Number(summary.revenue_this_month ?? 0).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Pending Offline"
            value={summary.pending_offline}
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            color="bg-yellow-50"
          />
        </div>
      ) : null}

      {/* Plans breakdown */}
      {summary?.plans_breakdown && summary.plans_breakdown.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Plans Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Active Schools
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Monthly Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Yearly Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.plans_breakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.active_count}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₦{Number(row.price_monthly).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₦{Number(row.price_yearly).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(
            [
              {
                key: "offline",
                label: `Offline Payments${pendingOffline.length ? ` (${pendingOffline.length})` : ""}`,
              },
              { key: "subscriptions", label: "All Subscriptions" },
            ] as { key: typeof activeTab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Offline payment requests */}
      {activeTab === "offline" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loadingOffline ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
          ) : offlineRequests.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                No offline payment requests
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      School
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Bank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {offlineRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {req.school?.name ?? `School #${req.school_id}`}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          ₦{Number(req.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{req.bank_name}</div>
                          <div className="text-xs text-gray-400">
                            {req.account_name}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {req.transaction_reference}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {req.transaction_date
                            ? new Date(
                                req.transaction_date,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">{statusBadge(req.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {req.proof_url && (
                              <a
                                href={req.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                              >
                                <Eye className="h-3 w-3" />
                                Proof
                              </a>
                            )}
                            {req.status === "pending" && (
                              <button
                                onClick={() =>
                                  setReviewingId(
                                    reviewingId === req.id ? null : req.id,
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {reviewingId === req.id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50">
                            <div className="max-w-xl space-y-3">
                              <textarea
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                                rows={2}
                                placeholder="Review notes (optional)"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                              />
                              <div className="flex gap-2">
                                <button
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    handleReview(req.id, "approved")
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    handleReview(req.id, "rejected")
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewingId(null);
                                    setReviewNote("");
                                  }}
                                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loadingSubs ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
          ) : allSubscriptions.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No subscriptions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      School
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Billing
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Started
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sub.school?.name ?? `School #${sub.school_id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {sub.plan?.name ?? `Plan #${sub.plan_id}`}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">
                        {sub.billing_cycle}
                      </td>
                      <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {sub.start_date
                          ? new Date(sub.start_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {sub.end_date
                          ? new Date(sub.end_date).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
