"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { FreelancerProfile, TeacherEngagement } from "@/types";
import { useFreelancers } from "@/hooks/useFreelancer";
import { useEngagements, useCreateEngagement } from "@/hooks/useEngagements";

const STATUS_VARIANT: Record<
  string,
  "green" | "blue" | "yellow" | "red" | "gray"
> = {
  pending: "yellow",
  accepted: "green",
  ongoing: "blue",
  completed: "green",
  declined: "red",
  cancelled: "gray",
};

function TeacherCard({
  teacher,
  onRequest,
}: {
  teacher: FreelancerProfile;
  onRequest: (t: FreelancerProfile) => void;
}) {
  const initials = (teacher.user?.name ?? "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">
            {teacher.user?.name ?? "Teacher"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {teacher.state ?? ""}
            {teacher.lga ? `, ${teacher.lga}` : ""}
          </p>
        </div>
        <div className="ml-auto">
          {teacher.is_available ? (
            <Badge variant="green" size="sm">
              Available
            </Badge>
          ) : (
            <Badge variant="gray" size="sm">
              Unavailable
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {teacher.subjects.slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
          >
            {s}
          </span>
        ))}
        {teacher.subjects.length > 4 && (
          <span className="text-xs text-gray-400">
            +{teacher.subjects.length - 4} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>${teacher.hourly_rate_usd?.toLocaleString() ?? "—"}/hr USD</span>
        <span>₦{teacher.hourly_rate_ngn?.toLocaleString() ?? "—"}/hr NGN</span>
      </div>
      {teacher.average_rating > 0 && (
        <p className="text-xs text-yellow-500">
          ★ {teacher.average_rating.toFixed(1)} ({teacher.ratings_count}{" "}
          ratings)
        </p>
      )}
      <Button
        size="sm"
        className="w-full"
        onClick={() => onRequest(teacher)}
        disabled={!teacher.is_available}
      >
        Request Session
      </Button>
    </div>
  );
}

export default function ParentEngagementsPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = useState({
    subject: "",
    state: "",
    min_rate: "",
    max_rate: "",
  });
  const [activeFilters, setActiveFilters] = useState<typeof filters>({
    subject: "",
    state: "",
    min_rate: "",
    max_rate: "",
  });

  const { data: freelancersRes } = useFreelancers(
    Object.fromEntries(
      Object.entries(activeFilters).filter(([, v]) => v !== ""),
    ),
  );

  const [tab, setTab] = useState<"all" | "pending" | "ongoing" | "completed">(
    "all",
  );
  const { data: engagementsRes } = useEngagements(
    tab !== "all" ? { status: tab } : {},
  );

  const createEngagement = useCreateEngagement();

  const [selectedTeacher, setSelectedTeacher] =
    useState<FreelancerProfile | null>(null);
  const [engForm, setEngForm] = useState({
    subject: "",
    description: "",
    currency: "usd",
    duration_hours: "1",
    scheduled_at: "",
  });

  function openModal(teacher: FreelancerProfile) {
    setSelectedTeacher(teacher);
    setEngForm({
      subject: "",
      description: "",
      currency: "usd",
      duration_hours: "1",
      scheduled_at: "",
    });
  }

  async function handleEngagementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacher) return;
    if (!engForm.subject || !engForm.scheduled_at) {
      toast.error("Subject and scheduled date are required.");
      return;
    }
    const rate =
      engForm.currency === "usd"
        ? selectedTeacher.hourly_rate_usd
        : selectedTeacher.hourly_rate_ngn;

    createEngagement.mutate(
      {
        teacher_id: selectedTeacher.user_id,
        subject: engForm.subject,
        description: engForm.description || undefined,
        currency: engForm.currency as "usd" | "ngn",
        rate_per_hour: rate ?? 0,
        duration_hours: parseFloat(engForm.duration_hours) || 1,
        scheduled_at: engForm.scheduled_at,
      },
      {
        onSuccess: () => {
          toast.success("Session requested! Waiting for teacher to accept.");
          setSelectedTeacher(null);
          qc.invalidateQueries({ queryKey: ["engagements"] });
        },
        onError: () => toast.error("Failed to request session."),
      },
    );
  }

  const freelancers: FreelancerProfile[] =
    (freelancersRes as unknown as FreelancerProfile[]) ?? [];
  const engagements: TeacherEngagement[] =
    (engagementsRes as unknown as TeacherEngagement[]) ?? [];

  const TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "ongoing", label: "Ongoing" },
    { key: "completed", label: "Completed" },
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Hire a Teacher
      </h1>

      {/* Browse Section */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Freelance Teachers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <form
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveFilters({ ...filters });
            }}
          >
            <input
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters((p) => ({ ...p, subject: e.target.value }))
              }
            />
            <input
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="State"
              value={filters.state}
              onChange={(e) =>
                setFilters((p) => ({ ...p, state: e.target.value }))
              }
            />
            <input
              type="number"
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Min rate (USD)"
              value={filters.min_rate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, min_rate: e.target.value }))
              }
            />
            <input
              type="number"
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Max rate (USD)"
              value={filters.max_rate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, max_rate: e.target.value }))
              }
            />
            <div className="col-span-2 sm:col-span-4 flex gap-2">
              <Button type="submit" size="sm">
                Search
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const empty = {
                    subject: "",
                    state: "",
                    min_rate: "",
                    max_rate: "",
                  };
                  setFilters(empty);
                  setActiveFilters(empty);
                }}
              >
                Clear
              </Button>
            </div>
          </form>

          {freelancers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No teachers found.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancers.map((t) => (
              <TeacherCard key={t.id} teacher={t} onRequest={openModal} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Engagements */}
      <Card>
        <CardHeader>
          <CardTitle>My Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {engagements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No sessions found.
            </p>
          )}
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {engagements.map((eng) => (
              <li key={eng.id} className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {eng.subject} with{" "}
                      {eng.teacher?.name ?? `Teacher #${eng.teacher_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(eng.scheduled_at)} · {eng.duration_hours}h ·{" "}
                      {eng.currency === "usd" ? "$" : "₦"}
                      {eng.total_amount?.toLocaleString()}
                    </p>
                    {eng.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {eng.description}
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
                {eng.status === "completed" && eng.rating && (
                  <p className="text-xs text-yellow-500 mt-1">
                    ★ {eng.rating} / 5
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Request Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Request Session</h2>
            <p className="text-sm text-gray-500">
              With:{" "}
              <span className="font-medium">{selectedTeacher.user?.name}</span>
            </p>
            <form onSubmit={handleEngagementSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="e.g. Mathematics"
                  value={engForm.subject}
                  onChange={(e) =>
                    setEngForm((p) => ({ ...p, subject: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={engForm.currency}
                  onChange={(e) =>
                    setEngForm((p) => ({ ...p, currency: e.target.value }))
                  }
                >
                  <option value="usd">
                    USD — ${selectedTeacher.hourly_rate_usd}/hr
                  </option>
                  <option value="ngn">
                    NGN — ₦{selectedTeacher.hourly_rate_ngn}/hr
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={engForm.duration_hours}
                  onChange={(e) =>
                    setEngForm((p) => ({
                      ...p,
                      duration_hours: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scheduled At <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={engForm.scheduled_at}
                  onChange={(e) =>
                    setEngForm((p) => ({ ...p, scheduled_at: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="Optional — describe your learning needs…"
                  value={engForm.description}
                  onChange={(e) =>
                    setEngForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createEngagement.isPending}
                  className="flex-1"
                >
                  {createEngagement.isPending ? "Sending…" : "Request Session"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTeacher(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
