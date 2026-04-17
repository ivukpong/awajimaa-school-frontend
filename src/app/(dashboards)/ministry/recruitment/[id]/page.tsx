"use client";
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, postForm } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Campaign {
  id: number;
  title: string;
  academic_year: string;
  subject_areas?: string;
  target_slots: number;
  application_deadline?: string;
  status: string;
  description?: string;
}

interface Application {
  id: number;
  applicant_name: string;
  email: string;
  phone?: string;
  subject_area?: string;
  stage: string;
  created_at: string;
}

const STAGE_VARIANT: Record<
  string,
  "yellow" | "green" | "blue" | "red" | "gray"
> = {
  applied: "yellow",
  shortlisted: "blue",
  interview_scheduled: "blue",
  interview_done: "blue",
  offered: "green",
  employed: "green",
  rejected: "red",
  withdrawn: "gray",
};

const STAGES = [
  "applied",
  "shortlisted",
  "interview_scheduled",
  "interview_done",
  "offered",
  "employed",
  "rejected",
  "withdrawn",
];

const EMPTY_APP = {
  applicant_name: "",
  email: "",
  phone: "",
  subject_area: "",
  qualification: "",
  experience_years: "",
  address: "",
};

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "import">("applications");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_APP);
  const [stageChanges, setStageChanges] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: campaign, isLoading: loadingCampaign } = useQuery<Campaign>({
    queryKey: ["ministry-campaign", id],
    queryFn: () =>
      get<{ data: Campaign }>(`/ministry/campaigns/${id}`).then(
        (r) => r.data.data,
      ),
  });

  const { data: applicationsData, isLoading: loadingApps } = useQuery<{
    data: Application[];
  }>({
    queryKey: ["ministry-applications", id],
    queryFn: () =>
      get<{ data: Application[] }>(
        `/ministry/campaigns/${id}/applications`,
      ).then((r) => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_APP) =>
      post(`/ministry/campaigns/${id}/applications`, {
        ...payload,
        experience_years: parseInt(payload.experience_years) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-applications", id] });
      toast.success("Application added.");
      setShowAddModal(false);
      setForm(EMPTY_APP);
    },
    onError: () => toast.error("Failed to add application."),
  });

  const stageMutation = useMutation({
    mutationFn: ({ appId, stage }: { appId: number; stage: string }) =>
      patch(`/ministry/applications/${appId}/stage`, { stage }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ministry-applications", id] });
      setStageChanges((prev) => {
        const next = { ...prev };
        delete next[variables.appId];
        return next;
      });
      toast.success("Stage updated.");
    },
    onError: () => toast.error("Failed to update stage."),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return postForm(`/ministry/campaigns/${id}/applications/import`, fd);
    },
    onSuccess: (res: unknown) => {
      qc.invalidateQueries({ queryKey: ["ministry-applications", id] });
      const r = res as { data?: { imported?: number } };
      toast.success(`Imported ${r?.data?.imported ?? "??"} applications.`);
    },
    onError: () => toast.error("Import failed."),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importMutation.mutate(file);
    e.target.value = "";
  }

  const applications = applicationsData?.data ?? [];

  if (loadingCampaign) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaign?.title}
          </h1>
          <p className="text-sm text-gray-500">{campaign?.academic_year}</p>
        </div>
      </div>

      {/* Campaign summary */}
      {campaign && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500">Target Slots</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {campaign.target_slots}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500">Deadline</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {campaign.application_deadline
                ? new Date(campaign.application_deadline).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500">Subjects</p>
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {campaign.subject_areas ?? "All"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500">Status</p>
            <Badge variant={campaign.status === "open" ? "green" : "gray"}>
              {campaign.status}
            </Badge>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["applications", "import"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t === "applications"
              ? `Applications (${applications.length})`
              : "Import CSV"}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab === "applications" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applicants</CardTitle>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {loadingApps ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-gray-500">No applications yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Name
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Subject
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Phone
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Stage
                      </th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                        Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {app.applicant_name}
                          </p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {app.subject_area ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {app.phone ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={STAGE_VARIANT[app.stage] ?? "gray"}>
                            {app.stage}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 items-center">
                            <select
                              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
                              value={stageChanges[app.id] ?? app.stage}
                              onChange={(e) =>
                                setStageChanges((prev) => ({
                                  ...prev,
                                  [app.id]: e.target.value,
                                }))
                              }
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            {stageChanges[app.id] &&
                              stageChanges[app.id] !== app.stage && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    stageMutation.mutate({
                                      appId: app.id,
                                      stage: stageChanges[app.id],
                                    })
                                  }
                                  disabled={stageMutation.isPending}
                                >
                                  Save
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import tab */}
      {tab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Import Applications from CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a CSV file with applicant data. The file should have the
              following columns:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono text-gray-700 dark:text-gray-300">
              applicant_name, email, phone, subject_area, qualification,
              experience_years, address
            </div>
            <p className="text-sm text-gray-500">
              You can also export data from a Google Form and upload the CSV
              directly.
            </p>
            <input
              type="file"
              accept=".csv"
              ref={fileRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importMutation.isPending ? "Importing..." : "Upload CSV"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Application Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setForm(EMPTY_APP);
        }}
        title="Add Application"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.applicant_name || !form.email) {
              toast.error("Name and email are required.");
              return;
            }
            addMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.applicant_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, applicant_name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Area
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.subject_area}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject_area: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Qualification
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.qualification}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qualification: e.target.value }))
                }
                placeholder="B.Ed, PGDE, NCE..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.experience_years}
                onChange={(e) =>
                  setForm((f) => ({ ...f, experience_years: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setForm(EMPTY_APP);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Add Application"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
