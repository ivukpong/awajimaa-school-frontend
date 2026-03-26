"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { TeacherPosting } from "@/types";

const STATUS_VARIANT: Record<
  string,
  "green" | "blue" | "yellow" | "red" | "gray"
> = {
  pending: "yellow",
  accepted: "green",
  declined: "red",
  revoked: "gray",
};

export default function TeacherPostingsPage() {
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ["teacher-postings"],
    queryFn: () =>
      get<{ data: TeacherPosting[] }>("/teacher-postings").then((r) => r.data),
  });

  const createPosting = useMutation({
    mutationFn: (data: {
      teacher_id: number;
      school_id: number;
      effective_date: string;
      posting_letter: string;
      notes?: string;
    }) => post("/teacher-postings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-postings"] });
      toast.success("Posting created and teacher notified!");
      setForm({
        teacher_id: "",
        school_id: "",
        effective_date: "",
        posting_letter: "",
        notes: "",
      });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create posting."),
  });

  const revoke = useMutation({
    mutationFn: (postingId: number) =>
      post(`/teacher-postings/${postingId}/revoke`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-postings"] });
      toast.success("Posting revoked.");
    },
    onError: () => toast.error("Failed to revoke posting."),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    teacher_id: "",
    school_id: "",
    effective_date: "",
    posting_letter: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.teacher_id ||
      !form.school_id ||
      !form.effective_date ||
      !form.posting_letter
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    createPosting.mutate({
      teacher_id: parseInt(form.teacher_id),
      school_id: parseInt(form.school_id),
      effective_date: form.effective_date,
      posting_letter: form.posting_letter,
      notes: form.notes || undefined,
    });
  }

  const postings: TeacherPosting[] = (res as unknown as TeacherPosting[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teacher Postings
        </h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Posting"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Teacher Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teacher ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="Enter teacher user ID"
                  value={form.teacher_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, teacher_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="Enter school ID"
                  value={form.school_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, school_id: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={form.effective_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, effective_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Posting Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono text-xs"
                  placeholder="Official posting letter text…"
                  value={form.posting_letter}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, posting_letter: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={createPosting.isPending}>
                  {createPosting.isPending
                    ? "Sending…"
                    : "Create & Notify Teacher"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Postings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Postings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
          )}
          {!isLoading && postings.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No postings created yet.
            </p>
          )}
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {postings.map((posting) => (
              <li key={posting.id} className="py-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {posting.teacher?.name ??
                        `Teacher #${posting.teacher_id}`}
                      {" → "}
                      {posting.school?.name ?? `School #${posting.school_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Effective: {formatDate(posting.effective_date)} · Created:{" "}
                      {formatDate(posting.created_at)}
                    </p>
                    {posting.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">
                        {posting.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={STATUS_VARIANT[posting.status] ?? "gray"}
                    size="sm"
                    className="shrink-0 capitalize"
                  >
                    {posting.status}
                  </Badge>
                </div>
                {posting.status === "pending" && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revoke.mutate(posting.id)}
                      disabled={revoke.isPending}
                    >
                      Revoke
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
