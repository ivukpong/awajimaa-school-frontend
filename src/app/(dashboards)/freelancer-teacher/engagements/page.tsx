"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import {
  useEngagements,
  useAcceptEngagement,
  useDeclineEngagement,
  useCompleteEngagement,
  useRateEngagement,
} from "@/hooks/useEngagements";
import { formatDate } from "@/lib/utils";
import type { TeacherEngagement } from "@/types";

const STATUS_VARIANT: Record<
  string,
  "green" | "blue" | "yellow" | "red" | "gray"
> = {
  pending: "yellow",
  accepted: "blue",
  ongoing: "blue",
  completed: "green",
  declined: "red",
  cancelled: "gray",
};

const STATUS_FILTERS = [
  "all",
  "pending",
  "accepted",
  "ongoing",
  "completed",
  "declined",
];

export default function FreelancerEngagementsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingModal, setRatingModal] = useState<{
    engagementId: number;
    rating: number;
    review: string;
  } | null>(null);

  const { data: res, isLoading } = useEngagements(
    statusFilter !== "all" ? { status: statusFilter } : {},
  );
  const accept = useAcceptEngagement();
  const decline = useDeclineEngagement();
  const complete = useCompleteEngagement();
  const rateEngagement = useRateEngagement();

  const engagements: TeacherEngagement[] = res?.data?.data ?? [];

  async function handleAction(
    action: () => Promise<unknown>,
    successMsg: string,
  ) {
    try {
      await action();
      toast.success(successMsg);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  async function submitRating() {
    if (!ratingModal) return;
    try {
      await rateEngagement.mutateAsync({
        id: ratingModal.engagementId,
        rating: ratingModal.rating,
        review: ratingModal.review,
      });
      toast.success("Rating submitted!");
      setRatingModal(null);
    } catch {
      toast.error("Failed to submit rating.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Engagements
      </h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
          )}
          {!isLoading && engagements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No engagements found.
            </p>
          )}
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {engagements.map((eng) => (
              <li key={eng.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{eng.subject}</p>
                    <p className="text-xs text-gray-500">
                      {eng.parent?.name} · {formatDate(eng.scheduled_at)} ·{" "}
                      {eng.duration_hours}h
                    </p>
                    <p className="text-xs text-gray-500">
                      Rate: {eng.currency.toUpperCase()} {eng.rate_per_hour}/hr
                      · Total: {eng.currency.toUpperCase()} {eng.total_amount} ·
                      Your payout: {eng.currency.toUpperCase()}{" "}
                      {eng.teacher_payout}
                    </p>
                    {eng.description && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        &ldquo;{eng.description}&rdquo;
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={STATUS_VARIANT[eng.status] ?? "gray"}
                    size="sm"
                    className="shrink-0 capitalize"
                  >
                    {eng.status}
                  </Badge>
                </div>
                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {eng.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAction(
                            () => accept.mutateAsync(eng.id),
                            "Engagement accepted!",
                          )
                        }
                        disabled={accept.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleAction(
                            () => decline.mutateAsync(eng.id),
                            "Engagement declined.",
                          )
                        }
                        disabled={decline.isPending}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {(eng.status === "accepted" || eng.status === "ongoing") && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          () => complete.mutateAsync(eng.id),
                          "Marked as completed!",
                        )
                      }
                      disabled={complete.isPending}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {eng.status === "completed" && eng.rating !== undefined && (
                    <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                      ★ {eng.rating}/5
                      {eng.review && (
                        <span className="text-gray-400 italic">
                          &ldquo;{eng.review}&rdquo;
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Rate This Session</h2>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setRatingModal((r) => (r ? { ...r, rating: n } : r))
                  }
                  className={`text-2xl ${ratingModal.rating >= n ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Leave a review (optional)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
              value={ratingModal.review}
              onChange={(e) =>
                setRatingModal((r) =>
                  r ? { ...r, review: e.target.value } : r,
                )
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRatingModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={submitRating}
                disabled={rateEngagement.isPending}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
