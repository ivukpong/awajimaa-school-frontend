"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  X,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import type { JobPosting } from "@/types/hr";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
};

const BLANK_FORM = {
  title: "",
  description: "",
  employment_type: "full_time",
  application_deadline: "",
  slots: "1",
  min_age: "",
  max_age: "",
  required_gender: "any",
  required_state_id: "",
  required_lga_id: "",
  min_years_experience: "",
};

export default function PlatformJobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  const { data, isLoading } = useQuery({
    queryKey: ["platform-jobs-regulator"],
    queryFn: () => get<{ data: JobPosting[] }>("/platform-jobs"),
  });

  const buildPayload = (payload: typeof BLANK_FORM) => ({
    ...payload,
    slots: Number(payload.slots) || 1,
    min_age: payload.min_age ? Number(payload.min_age) : undefined,
    max_age: payload.max_age ? Number(payload.max_age) : undefined,
    required_state_id: payload.required_state_id || undefined,
    required_lga_id: payload.required_lga_id || undefined,
    min_years_experience: payload.min_years_experience
      ? Number(payload.min_years_experience)
      : undefined,
    required_gender:
      payload.required_gender === "any" ? undefined : payload.required_gender,
  });

  const create = useMutation({
    mutationFn: (payload: typeof BLANK_FORM) =>
      post("/platform-jobs", buildPayload(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-jobs-regulator"] });
      toast.success("Platform job posting created!");
      setForm({ ...BLANK_FORM });
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create posting."),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: typeof BLANK_FORM }) =>
      patch(`/platform-jobs/${id}`, buildPayload(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-jobs-regulator"] });
      toast.success("Posting updated!");
      setForm({ ...BLANK_FORM });
      setShowForm(false);
      setEditId(null);
    },
    onError: () => toast.error("Failed to update posting."),
  });

  const postings: JobPosting[] = (data?.data as unknown as JobPosting[]) ?? [];

  function openEdit(p: JobPosting) {
    setForm({
      title: p.title,
      description: p.description,
      employment_type: p.employment_type,
      application_deadline: p.application_deadline ?? "",
      slots: String(p.slots),
      min_age: String(p.min_age ?? ""),
      max_age: String(p.max_age ?? ""),
      required_gender: p.required_gender ?? "any",
      required_state_id: String(p.required_state_id ?? ""),
      required_lga_id: String(p.required_lga_id ?? ""),
      min_years_experience: String(p.min_years_experience ?? ""),
    });
    setEditId(p.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required.");
      return;
    }
    if (editId) {
      update.mutate({ id: editId, payload: form });
    } else {
      create.mutate(form);
    }
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
        <Button
          onClick={() => {
            setForm({ ...BLANK_FORM });
            setEditId(null);
            setShowForm(true);
          }}
        >
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
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {posting.description}
                </p>

                {/* Screening criteria pills */}
                <div className="flex flex-wrap gap-1.5">
                  {posting.min_age && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                      Age &ge; {posting.min_age}
                    </span>
                  )}
                  {posting.max_age && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                      Age &le; {posting.max_age}
                    </span>
                  )}
                  {posting.required_gender &&
                    posting.required_gender !== "any" && (
                      <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 capitalize">
                        {posting.required_gender}
                      </span>
                    )}
                  {posting.min_years_experience != null && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                      &ge; {posting.min_years_experience} yr exp
                    </span>
                  )}
                </div>

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

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(posting)}
                    className="flex-1 text-xs"
                  >
                    Edit
                  </Button>
                  <Link
                    href={`/regulator/platform-jobs/${posting.id}/applications`}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full text-xs">
                      Applicants
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
