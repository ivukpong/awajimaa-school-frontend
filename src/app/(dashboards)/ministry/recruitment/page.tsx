"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";

interface Campaign {
  id: number;
  title: string;
  academic_year: string;
  subject_areas?: string;
  target_slots: number;
  application_deadline?: string;
  status: "draft" | "open" | "closed" | "completed";
  description?: string;
  applications_count?: number;
  created_at: string;
}

interface CampaignStats {
  total: number;
  open: number;
  total_applications: number;
}

const STATUS_VARIANT: Record<string, "yellow" | "green" | "gray" | "blue"> = {
  draft: "gray",
  open: "green",
  closed: "yellow",
  completed: "blue",
};

const EMPTY_FORM = {
  title: "",
  academic_year: new Date().getFullYear().toString(),
  subject_areas: "",
  target_slots: "",
  application_deadline: "",
  description: "",
};

export default function MinistryRecruitmentPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery<{
    data: Campaign[];
    stats: CampaignStats;
  }>({
    queryKey: ["ministry-campaigns"],
    queryFn: () =>
      get<{ data: Campaign[]; stats: CampaignStats }>(
        "/ministry/campaigns",
      ).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/campaigns", {
        ...payload,
        target_slots: parseInt(payload.target_slots) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-campaigns"] });
      toast.success("Campaign created.");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to create campaign."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      toast.error("Campaign title is required.");
      return;
    }
    if (!form.academic_year) {
      toast.error("Academic year is required.");
      return;
    }
    createMutation.mutate(form);
  }

  const campaigns = data?.data ?? [];
  const stats = data?.stats;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recruitment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage state teacher recruitment campaigns
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Campaigns"
            value={stats.total}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            title="Open Campaigns"
            value={stats.open}
            icon={Briefcase}
            color="green"
          />
          <StatCard
            title="Total Applications"
            value={stats.total_applications}
            icon={Briefcase}
            color="purple"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
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
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-gray-500">
              No campaigns yet. Create your first recruitment campaign.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Title
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Year
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Target
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Deadline
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Applications
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/ministry/recruitment/${c.id}`)
                      }
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {c.title}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {c.academic_year}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {c.target_slots}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {c.application_deadline
                          ? new Date(
                              c.application_deadline,
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {c.applications_count ?? 0}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[c.status] ?? "gray"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-400">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setForm(EMPTY_FORM);
        }}
        title="New Recruitment Campaign"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. 2025 Science Teacher Recruitment"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.academic_year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, academic_year: e.target.value }))
                }
                placeholder="2024/2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Slots
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.target_slots}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target_slots: e.target.value }))
                }
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject Areas
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              rows={2}
              value={form.subject_areas}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject_areas: e.target.value }))
              }
              placeholder="Mathematics, English, Biology..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.application_deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, application_deadline: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description of this campaign..."
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
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
