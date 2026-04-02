"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Briefcase, Plus, Users, Calendar, X } from "lucide-react";
import type { JobPosting } from "@/types/hr";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
};

export default function PlatformJobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    employment_type: "full_time",
    application_deadline: "",
    slots: "1",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["platform-jobs"],
    queryFn: () => get<{ data: JobPosting[] }>("/platform-jobs"),
  });

  const create = useMutation({
    mutationFn: (payload: typeof form) =>
      post("/platform-jobs", {
        ...payload,
        slots: Number(payload.slots),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-jobs"] });
      toast.success("Platform job posting created!");
      setForm({
        title: "",
        description: "",
        employment_type: "full_time",
        application_deadline: "",
        slots: "1",
      });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create posting."),
  });

  const postings: JobPosting[] = data?.data.data ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required.");
      return;
    }
    create.mutate(form);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Platform Recruitment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish platform-wide job openings visible to all registered
            teachers.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Posting
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New Platform Job Posting</CardTitle>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Secondary School Mathematics Teacher"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the role, responsibilities, and expectations..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type *
                </label>
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({ ...form, employment_type: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Slots
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.slots}
                  onChange={(e) => setForm({ ...form, slots: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={form.application_deadline}
                  onChange={(e) =>
                    setForm({ ...form, application_deadline: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Publishing…" : "Publish Posting"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Listings */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading postings…</div>
      ) : postings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No platform job postings yet.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Publish your first posting to start receiving applications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postings.map((posting) => (
            <Card key={posting.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {posting.title}
                  </CardTitle>
                  <Badge variant="green">Open</Badge>
                </div>
                <Badge variant="blue" className="w-fit mt-1">
                  {EMPLOYMENT_LABELS[posting.employment_type] ??
                    posting.employment_type}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {posting.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {posting.applications_count ?? 0} applicant
                    {posting.applications_count !== 1 ? "s" : ""}
                  </span>
                  {posting.slots > 0 && (
                    <span>
                      {posting.slots} slot{posting.slots !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {posting.application_deadline && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Deadline: {formatDate(posting.application_deadline)}
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Posted {formatDate(posting.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
