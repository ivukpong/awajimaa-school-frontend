"use client";
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Plus,
  Mail,
  Video,
  Users,
  Calendar,
  CheckSquare,
  Square,
  ClipboardList,
  Bot,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { get, post, patch } from "@/lib/api";
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
  ai_screening_enabled?: boolean;
  ai_screening_criteria?: {
    min_qualification?: string;
    min_experience_years?: number;
    required_subject_keywords?: string[];
    score_threshold?: number;
  };
}

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  subject_area?: string;
  highest_qualification?: string;
  years_experience?: number;
  stage1_status: string;
  stage2_status: string;
  interview_status: string;
  final_status: string;
  review_notes?: string;
  created_at: string;
  ai_score?: number;
  ai_screening_notes?: string;
  is_ai_selected?: boolean;
  position_selected_for?: string;
}

interface InterviewSchedule {
  id: number;
  title: string;
  mode: string;
  venue?: string;
  starts_at: string;
  ends_at: string;
  notes?: string;
  livekit_room?: string;
}

type EmailTemplate = "shortlisted" | "not_shortlisted" | "interview_invite" | "custom";

const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  stage1: [
    { value: "pending", label: "Pending" },
    { value: "qualified", label: "Qualified" },
    { value: "not_qualified", label: "Not Qualified" },
  ],
  stage2: [
    { value: "pending", label: "Pending" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "not_shortlisted", label: "Not Shortlisted" },
  ],
  interview: [
    { value: "pending", label: "Pending" },
    { value: "attended", label: "Attended" },
    { value: "not_attended", label: "Not Attended" },
  ],
  final: [
    { value: "pending", label: "Pending" },
    { value: "recruited", label: "Recruited" },
    { value: "not_recruited", label: "Not Recruited" },
  ],
};

const stageFieldMap: Record<string, keyof Application> = {
  stage1: "stage1_status",
  stage2: "stage2_status",
  interview: "interview_status",
  final: "final_status",
};

function statusBadge(status: string) {
  const map: Record<string, "green" | "red" | "yellow" | "blue" | "gray"> = {
    qualified: "green",
    shortlisted: "blue",
    attended: "green",
    recruited: "green",
    not_qualified: "red",
    not_shortlisted: "red",
    not_attended: "red",
    not_recruited: "red",
    pending: "yellow",
  };
  return (
    <Badge variant={map[status] ?? "gray"}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

const EMPTY_ADD = {
  applicant_name: "",
  applicant_email: "",
  applicant_phone: "",
  subject_area: "",
  highest_qualification: "",
  years_experience: "",
};

export default function RecruitmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"applications" | "import" | "interviews" | "ai_screening">("applications");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchQ, setSearchQ] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [singleApp, setSingleApp] = useState<Application | null>(null);

  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [stageForm, setStageForm] = useState({ stage: "stage1", status: "qualified", review_notes: "" });
  const [emailForm, setEmailForm] = useState<{ template: EmailTemplate; custom_subject: string; custom_message: string; interview_schedule_id: string }>({
    template: "shortlisted",
    custom_subject: "",
    custom_message: "",
    interview_schedule_id: "",
  });
  const [interviewForm, setInterviewForm] = useState({
    title: "",
    mode: "virtual",
    venue: "",
    starts_at: "",
    ends_at: "",
    notes: "",
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const [showBulkPersonalizedEmailModal, setShowBulkPersonalizedEmailModal] = useState(false);
  const [aiScreenResult, setAiScreenResult] = useState<{ selected: number; not_qualified: number; pending_review: number; total_screened: number } | null>(null);
  const [aiSettings, setAiSettings] = useState({
    ai_screening_enabled: false,
    min_qualification: "",
    min_experience_years: "",
    required_subject_keywords: "",
    score_threshold: "70",
  });
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [editingPositionVal, setEditingPositionVal] = useState("");
  const [bulkPersonalizedEmailForm, setBulkPersonalizedEmailForm] = useState({ subject: "", message_template: "" });

  // Queries
  const { data: campaignRes, isLoading: loadingCampaign } = useQuery({
    queryKey: ["ministry-campaign", id],
    queryFn: () => get<{ data: Campaign }>(`/ministry/campaigns/${id}`),
  });
  const campaign = (campaignRes as any)?.data?.data ?? (campaignRes as any)?.data;

  React.useEffect(() => {
    if (campaign) {
      setAiSettings({
        ai_screening_enabled: campaign.ai_screening_enabled ?? false,
        min_qualification: campaign.ai_screening_criteria?.min_qualification ?? "",
        min_experience_years: campaign.ai_screening_criteria?.min_experience_years?.toString() ?? "",
        required_subject_keywords: (campaign.ai_screening_criteria?.required_subject_keywords ?? []).join(", "),
        score_threshold: campaign.ai_screening_criteria?.score_threshold?.toString() ?? "70",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id]);

  const appsParams = new URLSearchParams({
    ...(searchQ && { search: searchQ }),
    ...(stageFilter === "ai_selected"
      ? { is_ai_selected: "1" }
      : stageFilter
        ? { [stageFilter.split(":")[0]]: stageFilter.split(":")[1] }
        : {}),
  });
  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ["ministry-apps", id, searchQ, stageFilter],
    queryFn: () => get<any>(`/ministry/campaigns/${id}/applications?${appsParams}`),
  });
  const applications: Application[] = (appsRes as any)?.data?.data ?? (appsRes as any)?.data ?? [];

  const { data: interviewsRes } = useQuery({
    queryKey: ["ministry-interviews", id],
    queryFn: () => get<any>(`/ministry/campaigns/${id}/interviews`),
  });
  const interviews: InterviewSchedule[] = (interviewsRes as any)?.data ?? [];

  // Mutations
  const addApp = useMutation({
    mutationFn: (p: typeof addForm) =>
      post(`/ministry/campaigns/${id}/applications`, {
        ...p,
        years_experience: parseInt(p.years_experience) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      setShowAddModal(false);
      setAddForm(EMPTY_ADD);
      toast.success("Application added");
    },
    onError: () => toast.error("Failed to add application"),
  });

  const bulkStage = useMutation({
    mutationFn: () =>
      post(`/ministry/applications/bulk-stage`, {
        application_ids: [...selected],
        stage: stageForm.stage,
        status: stageForm.status,
        review_notes: stageForm.review_notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      setSelected(new Set());
      setShowStageModal(false);
      toast.success("Stages updated");
    },
    onError: () => toast.error("Failed to update stages"),
  });

  const singleStage = useMutation({
    mutationFn: () =>
      patch(`/ministry/applications/${singleApp!.id}/stage`, {
        stage: stageForm.stage,
        [stageFieldMap[stageForm.stage]]: stageForm.status,
        review_notes: stageForm.review_notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      setShowStageModal(false);
      setSingleApp(null);
      toast.success("Stage updated");
    },
    onError: () => toast.error("Failed to update stage"),
  });

  const sendEmails = useMutation({
    mutationFn: () =>
      post(`/ministry/applications/email`, {
        application_ids: [...selected],
        ...emailForm,
        ...(emailForm.interview_schedule_id
          ? { interview_schedule_id: parseInt(emailForm.interview_schedule_id) }
          : {}),
      }),
    onSuccess: () => {
      setShowEmailModal(false);
      toast.success("Emails sent");
    },
    onError: () => toast.error("Failed to send emails"),
  });

  const createInterview = useMutation({
    mutationFn: () => post(`/ministry/campaigns/${id}/interviews`, interviewForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-interviews", id] });
      setShowInterviewModal(false);
      setInterviewForm({ title: "", mode: "virtual", venue: "", starts_at: "", ends_at: "", notes: "" });
      toast.success("Interview scheduled");
    },
    onError: () => toast.error("Failed to schedule interview"),
  });

  const sendInvites = useMutation({
    mutationFn: (scheduleId: number) =>
      post(`/ministry/interviews/${scheduleId}/invites`, {
        application_ids: [...selected],
      }),
    onSuccess: () => toast.success("Invites sent"),
    onError: () => toast.error("Failed to send invites"),
  });

  const aiScreen = useMutation({
    mutationFn: () => post(`/ministry/campaigns/${id}/ai-screen`, {}),
    onSuccess: (res: any) => {
      const result = res?.data?.data ?? res?.data;
      setAiScreenResult(result);
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      toast.success(`AI screening complete — ${result?.selected ?? 0} selected`);
    },
    onError: () => toast.error("AI screening failed"),
  });

  const updateCampaignAiSettings = useMutation({
    mutationFn: () =>
      patch(`/ministry/campaigns/${id}`, {
        ai_screening_enabled: aiSettings.ai_screening_enabled,
        ai_screening_criteria: {
          ...(aiSettings.min_qualification && { min_qualification: aiSettings.min_qualification }),
          ...(aiSettings.min_experience_years && { min_experience_years: parseInt(aiSettings.min_experience_years) }),
          ...(aiSettings.required_subject_keywords && {
            required_subject_keywords: aiSettings.required_subject_keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
          }),
          ...(aiSettings.score_threshold && { score_threshold: parseInt(aiSettings.score_threshold) }),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-campaign", id] });
      toast.success("AI settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const bulkPersonalizedEmail = useMutation({
    mutationFn: () =>
      post(`/ministry/applications/bulk-email-selected`, {
        application_ids: [...selected],
        subject: bulkPersonalizedEmailForm.subject,
        message_template: bulkPersonalizedEmailForm.message_template,
      }),
    onSuccess: () => {
      setShowBulkPersonalizedEmailModal(false);
      setBulkPersonalizedEmailForm({ subject: "", message_template: "" });
      toast.success("Personalized emails sent");
    },
    onError: () => toast.error("Failed to send emails"),
  });

  const updatePosition = useMutation({
    mutationFn: ({ appId, position }: { appId: number; position: string }) =>
      patch(`/ministry/applications/${appId}/position`, { position_selected_for: position }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      setEditingPositionId(null);
      toast.success("Position updated");
    },
    onError: () => toast.error("Failed to update position"),
  });

  const toggleSelected = useMutation({
    mutationFn: ({ appId, value }: { appId: number; value: boolean }) =>
      patch(`/ministry/applications/${appId}/toggle-selected`, { is_ai_selected: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
    },
    onError: () => toast.error("Failed to update selection"),
  });

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    try {
      const token = Cookies.get("auth_token");
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ministry/campaigns/${id}/applications/import`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd },
      );
      const json = await res.json();
      setImportResult({ imported: json.imported ?? 0, errors: json.errors ?? [] });
      qc.invalidateQueries({ queryKey: ["ministry-apps", id] });
      toast.success(`Imported ${json.imported ?? 0} applications`);
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  }

  function toggleSelect(appId: number) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(appId) ? s.delete(appId) : s.add(appId);
      return s;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === applications.length
        ? new Set()
        : new Set(applications.map((a) => a.id)),
    );
  }

  function openStageModal(app?: Application) {
    setSingleApp(app ?? null);
    setStageForm({ stage: "stage1", status: "qualified", review_notes: "" });
    setShowStageModal(true);
  }

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaign?.title ?? "Campaign"}
          </h1>
          <p className="text-sm text-gray-500">{campaign?.academic_year}</p>
        </div>
        <Badge variant={campaign?.status === "open" ? "green" : "gray"}>
          {campaign?.status}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500">Total Applications</p>
          <p className="font-semibold text-2xl text-gray-900 dark:text-white">{applications.length}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500">Qualified (Stage 1)</p>
          <p className="font-semibold text-2xl text-green-600">
            {applications.filter((a) => a.stage1_status === "qualified").length}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500">Shortlisted</p>
          <p className="font-semibold text-2xl text-blue-600">
            {applications.filter((a) => a.stage2_status === "shortlisted").length}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500">Target Slots</p>
          <p className="font-semibold text-2xl text-gray-900 dark:text-white">{campaign?.target_slots ?? "—"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        {(["applications", "ai_screening", "import", "interviews"] as const).map((t) => (
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
              : t === "import"
                ? "Import from Google Forms"
                : t === "ai_screening"
                  ? "AI Screening"
                  : `Interviews (${interviews.length})`}
          </button>
        ))}
      </div>

      {/* Applications Tab */}
      {tab === "applications" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <CardTitle>Applicants</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm w-48"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
                <select
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="">All stages</option>
                  <option value="ai_selected">AI Selected</option>
                  <option value="stage1_status:qualified">Stage 1: Qualified</option>
                  <option value="stage1_status:not_qualified">Stage 1: Not Qualified</option>
                  <option value="stage2_status:shortlisted">Stage 2: Shortlisted</option>
                  <option value="interview_status:attended">Interview: Attended</option>
                  <option value="final_status:recruited">Final: Recruited</option>
                </select>
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="mx-6 mb-3 flex items-center gap-2 bg-brand/10 rounded-lg px-4 py-2 text-sm">
              <span className="font-medium text-brand">{selected.size} selected</span>
              <div className="flex-1" />
              <Button size="sm" variant="ghost" onClick={() => openStageModal()}>
                <ClipboardList className="h-4 w-4 mr-1" /> Update Stage
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowEmailModal(true)}>
                <Mail className="h-4 w-4 mr-1" /> Send Email
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          )}

          <CardContent>
            {appsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No applications yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-3">
                        <button onClick={toggleAll}>
                          {selected.size === applications.length && applications.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-brand" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Applicant</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">AI Score</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Stage 1</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Stage 2</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Interview</th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Final</th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-3">
                          <button onClick={() => toggleSelect(app.id)}>
                            {selected.has(app.id) ? (
                              <CheckSquare className="h-4 w-4 text-brand" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 dark:text-white">{app.applicant_name}</p>
                          <p className="text-xs text-gray-500">{app.applicant_email}</p>
                          {app.applicant_phone && (
                            <p className="text-xs text-gray-400">{app.applicant_phone}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {app.subject_area ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {app.ai_score !== undefined && app.ai_score !== null ? (
                            <span className="inline-flex items-center gap-1">
                              {app.is_ai_selected && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                              <Badge variant={app.ai_score >= 70 ? "green" : app.ai_score >= 50 ? "yellow" : "red"}>
                                {app.ai_score.toFixed(0)}
                              </Badge>
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-3 pr-4">{statusBadge(app.stage1_status)}</td>
                        <td className="py-3 pr-4">{statusBadge(app.stage2_status)}</td>
                        <td className="py-3 pr-4">{statusBadge(app.interview_status)}</td>
                        <td className="py-3 pr-4">{statusBadge(app.final_status)}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openStageModal(app)}
                            >
                              Update
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title={app.is_ai_selected ? "Remove from selected list" : "Add to selected list"}
                              onClick={() => toggleSelected.mutate({ appId: app.id, value: !app.is_ai_selected })}
                              disabled={toggleSelected.isPending}
                            >
                              <Sparkles className={`h-4 w-4 ${app.is_ai_selected ? "text-amber-500" : "text-gray-400"}`} />
                            </Button>
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

      {/* Import Tab */}
      {tab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Import Applications from Google Forms CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export your Google Form responses as CSV and upload here. The following columns are mapped automatically:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Google Form Column</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Maps To</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  {[
                    ["Full Name / Applicant Name", "applicant_name"],
                    ["Email Address", "applicant_email"],
                    ["Phone Number", "applicant_phone"],
                    ["Subject Area", "subject_area"],
                    ["Highest Qualification", "highest_qualification"],
                    ["Years of Experience", "years_experience"],
                    ["LGA", "lga_id (matched by name)"],
                    ["Address", "address"],
                    ["Gender", "gender"],
                    ["Date of Birth", "date_of_birth"],
                    ["NIN", "nin"],
                  ].map(([col, field]) => (
                    <tr key={col} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-1.5 font-mono">{col}</td>
                      <td className="px-3 py-1.5 text-brand">{field}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv,.xlsx"
                ref={fileRef}
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              <Button variant="ghost" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {importFile ? importFile.name : "Choose CSV / XLSX file"}
              </Button>
              {importFile && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? "Importing..." : "Import"}
                </Button>
              )}
            </div>

            {importResult && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
                <p className="font-medium text-green-700 dark:text-green-400">
                  ✓ Imported {importResult.imported} application(s)
                </p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Errors:</p>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {importResult.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interviews Tab */}
      {tab === "interviews" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Schedules</h2>
            <Button onClick={() => setShowInterviewModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Schedule Interview
            </Button>
          </div>

          {interviews.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No interviews scheduled yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {interviews.map((iv) => (
                <Card key={iv.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">{iv.title}</p>
                        <p className="text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 inline mr-1" />
                          {new Date(iv.starts_at).toLocaleString()} — {new Date(iv.ends_at).toLocaleString()}
                        </p>
                        <div className="flex gap-2 items-center text-sm">
                          <Badge variant={iv.mode === "virtual" ? "blue" : "gray"}>{iv.mode}</Badge>
                          {iv.venue && <span className="text-gray-500">{iv.venue}</span>}
                        </div>
                        {iv.notes && <p className="text-xs text-gray-400">{iv.notes}</p>}
                        {iv.livekit_room && (
                          <p className="text-xs text-brand font-mono">Room: {iv.livekit_room}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          size="sm"
                          disabled={selected.size === 0}
                          onClick={() => sendInvites.mutate(iv.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          {selected.size > 0
                            ? `Send Invites (${selected.size})`
                            : "Select applicants first"}
                        </Button>
                        {iv.mode === "virtual" && iv.livekit_room && (
                          <Button size="sm" variant="ghost">
                            <Video className="h-4 w-4 mr-1" /> Join Room
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Screening Tab */}
      {tab === "ai_screening" && (
        <div className="space-y-6">
          {/* AI Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-brand" />
                AI Screening Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ai_enabled"
                  className="h-4 w-4 accent-brand"
                  checked={aiSettings.ai_screening_enabled}
                  onChange={(e) => setAiSettings((f) => ({ ...f, ai_screening_enabled: e.target.checked }))}
                />
                <label htmlFor="ai_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable AI Screening for this campaign
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Qualification
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={aiSettings.min_qualification}
                    onChange={(e) => setAiSettings((f) => ({ ...f, min_qualification: e.target.value }))}
                  >
                    <option value="">No minimum</option>
                    <option value="SSCE">SSCE / WAEC</option>
                    <option value="OND">OND</option>
                    <option value="NCE">NCE</option>
                    <option value="HND">HND</option>
                    <option value="B.Sc">B.Sc / B.Ed</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={aiSettings.min_experience_years}
                    onChange={(e) => setAiSettings((f) => ({ ...f, min_experience_years: e.target.value }))}
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Required Subject Keywords
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={aiSettings.required_subject_keywords}
                    onChange={(e) => setAiSettings((f) => ({ ...f, required_subject_keywords: e.target.value }))}
                    placeholder="Math, Physics, Chemistry (comma-separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Score Threshold (0–100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={aiSettings.score_threshold}
                    onChange={(e) => setAiSettings((f) => ({ ...f, score_threshold: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => updateCampaignAiSettings.mutate()} disabled={updateCampaignAiSettings.isPending}>
                  {updateCampaignAiSettings.isPending ? "Saving..." : "Save AI Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Run Screening Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Run AI Screening
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The AI will score all pending Stage 1 applications based on the criteria above and automatically move qualified applicants to the Selected List.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => aiScreen.mutate()}
                  disabled={aiScreen.isPending || !campaign?.ai_screening_enabled}
                  className="gap-2"
                >
                  <Bot className="h-4 w-4" />
                  {aiScreen.isPending ? "Screening..." : "Run AI Screening"}
                </Button>
                {!campaign?.ai_screening_enabled && (
                  <p className="text-xs text-amber-600">Enable AI Screening in settings above and save before running.</p>
                )}
              </div>
              {aiScreenResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{aiScreenResult.selected}</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">AI Selected</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{aiScreenResult.not_qualified}</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">Not Qualified</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{aiScreenResult.pending_review}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Pending Manual Review</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{aiScreenResult.total_screened}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Screened</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Applicants List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <CardTitle>Selected Applicants</CardTitle>
                {selected.size > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => setShowBulkPersonalizedEmailModal(true)}>
                      <Mail className="h-4 w-4 mr-1" /> Personalized Email
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openStageModal()}>
                      <ClipboardList className="h-4 w-4 mr-1" /> Move to Stage 2
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowInterviewModal(true)}>
                      <Calendar className="h-4 w-4 mr-1" /> Schedule Interview
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedApps = applications.filter((a) => a.is_ai_selected);
                if (selectedApps.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 py-4">
                      No selected applicants yet. Run AI Screening above, or use the <Sparkles className="h-3.5 w-3.5 inline text-gray-400" /> button in the Applications tab to manually add applicants.
                    </p>
                  );
                }
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                          <th className="py-2 pr-3">
                            <button onClick={() => {
                              const ids = selectedApps.map((a) => a.id);
                              setSelected((prev) => {
                                const s = new Set(prev);
                                const allSel = ids.every((i) => s.has(i));
                                if (allSel) ids.forEach((i) => s.delete(i));
                                else ids.forEach((i) => s.add(i));
                                return s;
                              });
                            }}>
                              {selectedApps.every((a) => selected.has(a.id)) && selectedApps.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-brand" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </th>
                          <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Applicant</th>
                          <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Qualification</th>
                          <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Exp.</th>
                          <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">AI Score</th>
                          <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Position</th>
                          <th className="py-2 font-medium text-gray-600 dark:text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApps.map((app) => (
                          <tr
                            key={app.id}
                            className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-3 pr-3">
                              <button onClick={() => toggleSelect(app.id)}>
                                {selected.has(app.id) ? (
                                  <CheckSquare className="h-4 w-4 text-brand" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 pr-4">
                              <p className="font-medium text-gray-900 dark:text-white">{app.applicant_name}</p>
                              <p className="text-xs text-gray-500">{app.applicant_email}</p>
                            </td>
                            <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-400">
                              {app.highest_qualification ?? "—"}
                            </td>
                            <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-400">
                              {app.years_experience !== undefined ? `${app.years_experience}yr` : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              {app.ai_score !== undefined && app.ai_score !== null ? (
                                <Badge variant={app.ai_score >= 70 ? "green" : app.ai_score >= 50 ? "yellow" : "red"}>
                                  {app.ai_score.toFixed(0)}
                                </Badge>
                              ) : "—"}
                            </td>
                            <td className="py-3 pr-4">
                              {editingPositionId === app.id ? (
                                <div className="flex gap-1 items-center">
                                  <input
                                    className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs w-32"
                                    value={editingPositionVal}
                                    onChange={(e) => setEditingPositionVal(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") updatePosition.mutate({ appId: app.id, position: editingPositionVal });
                                      if (e.key === "Escape") setEditingPositionId(null);
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => updatePosition.mutate({ appId: app.id, position: editingPositionVal })}
                                    disabled={updatePosition.isPending}
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-brand underline-offset-2 hover:underline"
                                  onClick={() => { setEditingPositionId(app.id); setEditingPositionVal(app.position_selected_for ?? ""); }}
                                >
                                  {app.position_selected_for ?? "— click to set —"}
                                </button>
                              )}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Remove from selected list"
                                onClick={() => toggleSelected.mutate({ appId: app.id, value: false })}
                                disabled={toggleSelected.isPending}
                              >
                                ✕
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Application Modal */}}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setAddForm(EMPTY_ADD); }} title="Add Application">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!addForm.applicant_name || !addForm.applicant_email) {
              toast.error("Name and email are required");
              return;
            }
            addApp.mutate(addForm);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={addForm.applicant_name}
                onChange={(e) => setAddForm((f) => ({ ...f, applicant_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={addForm.applicant_email}
                onChange={(e) => setAddForm((f) => ({ ...f, applicant_email: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={addForm.applicant_phone}
                onChange={(e) => setAddForm((f) => ({ ...f, applicant_phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Area</label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={addForm.subject_area}
                onChange={(e) => setAddForm((f) => ({ ...f, subject_area: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                placeholder="B.Ed, PGDE, NCE..."
                value={addForm.highest_qualification}
                onChange={(e) => setAddForm((f) => ({ ...f, highest_qualification: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years Experience</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={addForm.years_experience}
                onChange={(e) => setAddForm((f) => ({ ...f, years_experience: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowAddModal(false); setAddForm(EMPTY_ADD); }}>Cancel</Button>
            <Button type="submit" disabled={addApp.isPending}>{addApp.isPending ? "Saving..." : "Add Application"}</Button>
          </div>
        </form>
      </Modal>

      {/* Stage Update Modal */}
      <Modal
        open={showStageModal}
        onClose={() => { setShowStageModal(false); setSingleApp(null); }}
        title={singleApp ? `Update Stage — ${singleApp.applicant_name}` : `Bulk Update Stage (${selected.size} selected)`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={stageForm.stage}
              onChange={(e) => setStageForm((f) => ({ ...f, stage: e.target.value, status: STATUS_OPTIONS[e.target.value]?.[1]?.value ?? "pending" }))}
            >
              <option value="stage1">Stage 1 (Qualification Review)</option>
              <option value="stage2">Stage 2 (Shortlisting)</option>
              <option value="interview">Interview</option>
              <option value="final">Final Decision</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={stageForm.status}
              onChange={(e) => setStageForm((f) => ({ ...f, status: e.target.value }))}
            >
              {(STATUS_OPTIONS[stageForm.stage] ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Notes</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={stageForm.review_notes}
              onChange={(e) => setStageForm((f) => ({ ...f, review_notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setShowStageModal(false); setSingleApp(null); }}>Cancel</Button>
            <Button
              onClick={() => (singleApp ? singleStage.mutate() : bulkStage.mutate())}
              disabled={singleStage.isPending || bulkStage.isPending}
            >
              {singleStage.isPending || bulkStage.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Modal */}
      <Modal open={showEmailModal} onClose={() => setShowEmailModal(false)} title={`Send Email to ${selected.size} applicant(s)`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={emailForm.template}
              onChange={(e) => setEmailForm((f) => ({ ...f, template: e.target.value as EmailTemplate }))}
            >
              <option value="shortlisted">Shortlisted Notification</option>
              <option value="not_shortlisted">Not Shortlisted</option>
              <option value="interview_invite">Interview Invitation</option>
              <option value="custom">Custom Message</option>
            </select>
          </div>
          {emailForm.template === "interview_invite" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Schedule</label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={emailForm.interview_schedule_id}
                onChange={(e) => setEmailForm((f) => ({ ...f, interview_schedule_id: e.target.value }))}
              >
                <option value="">— Select schedule —</option>
                {interviews.map((iv) => (
                  <option key={iv.id} value={String(iv.id)}>{iv.title} ({new Date(iv.starts_at).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          )}
          {emailForm.template === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={emailForm.custom_subject}
                  onChange={(e) => setEmailForm((f) => ({ ...f, custom_subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={emailForm.custom_message}
                  onChange={(e) => setEmailForm((f) => ({ ...f, custom_message: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button onClick={() => sendEmails.mutate()} disabled={sendEmails.isPending}>
              {sendEmails.isPending ? "Sending..." : "Send Emails"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interview Schedule Modal */}
      <Modal open={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Interview">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={interviewForm.title}
              onChange={(e) => setInterviewForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Stage 2 Interview — Mathematics"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={interviewForm.mode}
                onChange={(e) => setInterviewForm((f) => ({ ...f, mode: e.target.value }))}
              >
                <option value="virtual">Virtual (LiveKit)</option>
                <option value="physical">Physical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue / Link</label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={interviewForm.venue}
                onChange={(e) => setInterviewForm((f) => ({ ...f, venue: e.target.value }))}
                placeholder={interviewForm.mode === "virtual" ? "Auto-generated" : "Room / Address"}
                disabled={interviewForm.mode === "virtual"}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start *</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={interviewForm.starts_at}
                onChange={(e) => setInterviewForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End *</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={interviewForm.ends_at}
                onChange={(e) => setInterviewForm((f) => ({ ...f, ends_at: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowInterviewModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!interviewForm.title || !interviewForm.starts_at || !interviewForm.ends_at) {
                  toast.error("Title, start and end time are required");
                  return;
                }
                createInterview.mutate();
              }}
              disabled={createInterview.isPending}
            >
              {createInterview.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Personalized Email Modal */}
      <Modal
        open={showBulkPersonalizedEmailModal}
        onClose={() => setShowBulkPersonalizedEmailModal(false)}
        title={`Send Personalized Email to ${selected.size} applicant(s)`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{`{name}`}</code> for the applicant's name and{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{`{position}`}</code> for their selected position.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={bulkPersonalizedEmailForm.subject}
              onChange={(e) => setBulkPersonalizedEmailForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Congratulations, {name} — Teacher Recruitment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
            <textarea
              rows={7}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono"
              value={bulkPersonalizedEmailForm.message_template}
              onChange={(e) => setBulkPersonalizedEmailForm((f) => ({ ...f, message_template: e.target.value }))}
              placeholder={`Dear {name},\n\nWe are pleased to inform you that you have been selected for the position of {position}...`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowBulkPersonalizedEmailModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!bulkPersonalizedEmailForm.subject || !bulkPersonalizedEmailForm.message_template) {
                  toast.error("Subject and message are required");
                  return;
                }
                bulkPersonalizedEmail.mutate();
              }}
              disabled={bulkPersonalizedEmail.isPending}
            >
              {bulkPersonalizedEmail.isPending ? "Sending..." : "Send Emails"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
