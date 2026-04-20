"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface School {
  id: number;
  name: string;
  lga?: string;
}

interface Posting {
  id: number;
  teacher?: Teacher;
  school?: School;
  effective_date?: string;
  posting_letter?: string;
  notes?: string;
  status: "pending" | "accepted" | "declined" | "revoked";
  created_at: string;
}

const STATUS_VARIANT: Record<string, "yellow" | "green" | "red" | "gray"> = {
  pending: "yellow",
  accepted: "green",
  declined: "red",
  revoked: "gray",
};

const EMPTY_FORM = {
  teacher_id: "",
  school_id: "",
  effective_date: "",
  posting_letter: "",
  notes: "",
};

export default function MinistryPostingsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: postingsData, isLoading } = useQuery<{ data: Posting[] }>({
    queryKey: ["ministry-postings"],
    queryFn: () =>
      get<{ data: Posting[] }>("/ministry/postings").then((r) => r.data),
  });

  const { data: teachersData } = useQuery<{ data: Teacher[] }>({
    queryKey: ["ministry-teachers"],
    queryFn: () =>
      get<{ data: Teacher[] }>("/ministry/users?role=teacher").then(
        (r) => r.data,
      ),
  });

  const { data: schoolsData } = useQuery<{ data: School[] }>({
    queryKey: ["ministry-schools"],
    queryFn: () =>
      get<{ data: School[] }>("/ministry/schools").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/postings", {
        ...payload,
        teacher_id: parseInt(payload.teacher_id),
        school_id: parseInt(payload.school_id),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-postings"] });
      toast.success("Posting created.");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to create posting."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teacher_id) {
      toast.error("Select a teacher.");
      return;
    }
    if (!form.school_id) {
      toast.error("Select a school.");
      return;
    }
    createMutation.mutate(form);
  }

  const postings = postingsData?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const schools = schoolsData?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teacher Postings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Post and transfer state teachers to schools
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Posting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Postings ({postings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : postings.length === 0 ? (
            <p className="text-sm text-gray-500">No postings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Teacher
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      School
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Effective Date
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {postings.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {p.teacher?.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.teacher?.email}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-gray-800 dark:text-gray-200">
                          {p.school?.name ?? "—"}
                        </p>
                        {p.school?.lga && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {p.school.lga}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {p.effective_date
                          ? new Date(p.effective_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[p.status] ?? "gray"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Posting Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setForm(EMPTY_FORM);
        }}
        title="New Teacher Posting"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teacher <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.teacher_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, teacher_id: e.target.value }))
              }
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.school_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, school_id: e.target.value }))
              }
            >
              <option value="">Select school...</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.lga ? ` — ${s.lga}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Effective Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.effective_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, effective_date: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Posting Letter
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.posting_letter}
              onChange={(e) =>
                setForm((f) => ({ ...f, posting_letter: e.target.value }))
              }
              placeholder="Official posting letter content..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Posting"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
