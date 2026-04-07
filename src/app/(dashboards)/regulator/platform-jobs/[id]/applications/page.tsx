"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";
import type {
  JobPosting,
  JobApplication,
  Stage1Status,
  Stage2Status,
  InterviewStatus,
  FinalStatus,
} from "@/types/hr";

// ─── helpers ────────────────────────────────────────────────────────────────

const STAGE_LABELS = ["Stage 1", "Stage 2", "Interview", "Final", "Posting"];

function stageBadge(
  status: string | undefined | null,
  positiveLabel: string,
  negativeLabel: string,
) {
  if (!status || status === "pending") {
    return <Badge variant="yellow">Pending</Badge>;
  }
  if (
    status === "qualified" ||
    status === "shortlisted" ||
    status === "attended" ||
    status === "recruited"
  ) {
    return <Badge variant="green">{positiveLabel}</Badge>;
  }
  return <Badge variant="red">{negativeLabel}</Badge>;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white";
const labelCls =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

// ─── main component ──────────────────────────────────────────────────────────

export default function ApplicationsPipelinePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const jobId = params.id;

  const [activeTab, setActiveTab] = useState<number>(0); // 0-4 maps to stages
  const [expanded, setExpanded] = useState<number | null>(null);

  // Fetch job details
  const { data: jobData } = useQuery({
    queryKey: ["platform-job", jobId],
    queryFn: () => get<JobPosting>(`/platform-jobs/${jobId}`),
  });

  // Fetch applicants
  const { data: appsData, isLoading } = useQuery({
    queryKey: ["platform-job-applications", jobId],
    queryFn: () =>
      get<{ data: JobApplication[] }>(`/platform-jobs/${jobId}/applications`),
  });

  const job = jobData?.data as unknown as JobPosting | undefined;
  const applications: JobApplication[] =
    (appsData?.data as unknown as JobApplication[]) ?? [];

  const stageMutation = useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: number;
      payload: Record<string, unknown>;
    }) => patch(`/platform-jobs/${jobId}/applications/${appId}/stage`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-job-applications", jobId] });
      toast.success("Application updated!");
    },
    onError: () => toast.error("Failed to update application."),
  });

  // ─── per-applicant stage panels ──────────────────────────────────────────

  function Stage1Panel({ app }: { app: JobApplication }) {
    const [status, setStatus] = useState<Stage1Status>(
      app.stage1_status ?? "pending",
    );
    const [designation, setDesignation] = useState(
      app.stage1_reviewer_designation ?? "",
    );
    return (
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Stage 1 Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Stage1Status)}
            className={inputCls}
          >
            <option value="pending">Pending</option>
            <option value="qualified">Qualified</option>
            <option value="not_qualified">Not Qualified</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Reviewer Designation</label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Director of Education"
            className={inputCls}
          />
        </div>
        <Button
          size="sm"
          onClick={() =>
            stageMutation.mutate({
              appId: app.id,
              payload: {
                stage: "stage1",
                stage1_status: status,
                stage1_reviewer_designation: designation || undefined,
              },
            })
          }
          disabled={stageMutation.isPending}
        >
          Save Stage 1
        </Button>
      </div>
    );
  }

  function Stage2Panel({ app }: { app: JobApplication }) {
    const [status, setStatus] = useState<Stage2Status>(
      app.stage2_status ?? "pending",
    );
    const [designation, setDesignation] = useState(
      app.stage2_reviewer_designation ?? "",
    );
    return (
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Stage 2 Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Stage2Status)}
            className={inputCls}
          >
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="not_shortlisted">Not Shortlisted</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Reviewer Designation</label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. HR Manager"
            className={inputCls}
          />
        </div>
        <Button
          size="sm"
          onClick={() =>
            stageMutation.mutate({
              appId: app.id,
              payload: {
                stage: "stage2",
                stage2_status: status,
                stage2_reviewer_designation: designation || undefined,
              },
            })
          }
          disabled={stageMutation.isPending}
        >
          Save Stage 2
        </Button>
      </div>
    );
  }

  function InterviewPanel({ app }: { app: JobApplication }) {
    const [status, setStatus] = useState<InterviewStatus>(
      app.interview_status ?? "pending",
    );
    const [date, setDate] = useState(app.interview_date ?? "");
    const [mode, setMode] = useState(app.interview_mode ?? "in_person");
    const [venue, setVenue] = useState(app.interview_venue ?? "");
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Interview Date</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={inputCls}
            >
              <option value="in_person">In Person</option>
              <option value="virtual">Virtual</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Venue / Link</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Physical address or meeting URL"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Attendance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InterviewStatus)}
              className={inputCls}
            >
              <option value="pending">Pending / Scheduled</option>
              <option value="attended">Attended</option>
              <option value="not_attended">Did Not Attend</option>
            </select>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            stageMutation.mutate({
              appId: app.id,
              payload: {
                stage: "interview",
                interview_status: status,
                interview_date: date || undefined,
                interview_mode: mode,
                interview_venue: venue || undefined,
              },
            })
          }
          disabled={stageMutation.isPending}
        >
          Save Interview
        </Button>
      </div>
    );
  }

  function FinalPanel({ app }: { app: JobApplication }) {
    const [status, setStatus] = useState<FinalStatus>(
      app.final_status ?? "pending",
    );
    return (
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Final Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FinalStatus)}
            className={inputCls}
          >
            <option value="pending">Pending</option>
            <option value="recruited">Recruited</option>
            <option value="not_recruited">Not Recruited</option>
          </select>
        </div>
        <Button
          size="sm"
          onClick={() =>
            stageMutation.mutate({
              appId: app.id,
              payload: { stage: "final", final_status: status },
            })
          }
          disabled={stageMutation.isPending}
        >
          Save Decision
        </Button>
      </div>
    );
  }

  function PostingPanel({ app }: { app: JobApplication }) {
    const [appointmentDate, setAppointmentDate] = useState(
      app.appointment_date ?? "",
    );
    const [postingSchoolId, setPostingSchoolId] = useState(
      String(app.posting_school_id ?? ""),
    );
    const [postingDate, setPostingDate] = useState(app.posting_date ?? "");
    const [resumptionDate, setResumptionDate] = useState(
      app.resumption_date ?? "",
    );
    const [salary, setSalary] = useState(String(app.salary ?? ""));
    const [otherBenefits, setOtherBenefits] = useState(
      app.other_benefits ?? "",
    );
    const [nhis, setNhis] = useState(app.nhis ?? false);
    const [bankName, setBankName] = useState(app.salary_bank_name ?? "");
    const [accountNumber, setAccountNumber] = useState(
      app.salary_account_number ?? "",
    );
    const [accountName, setAccountName] = useState(
      app.salary_account_name ?? "",
    );

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Appointment Date</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Posting School ID</label>
            <input
              type="number"
              value={postingSchoolId}
              onChange={(e) => setPostingSchoolId(e.target.value)}
              placeholder="School ID"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Posting Date</label>
            <input
              type="date"
              value={postingDate}
              onChange={(e) => setPostingDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Resumption Date</label>
            <input
              type="date"
              value={resumptionDate}
              onChange={(e) => setResumptionDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Salary (NGN)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. 150000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Other Benefits</label>
            <input
              type="text"
              value={otherBenefits}
              onChange={(e) => setOtherBenefits(e.target.value)}
              placeholder="e.g. Housing, Transport allowance"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Salary Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Access Bank"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit account number"
              className={inputCls}
              maxLength={10}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Name on account"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id={`nhis-${app.id}`}
              type="checkbox"
              checked={nhis}
              onChange={(e) => setNhis(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <label
              htmlFor={`nhis-${app.id}`}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Enrolled in NHIS
            </label>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            stageMutation.mutate({
              appId: app.id,
              payload: {
                stage: "posting",
                appointment_date: appointmentDate || undefined,
                posting_school_id: postingSchoolId
                  ? Number(postingSchoolId)
                  : undefined,
                posting_date: postingDate || undefined,
                resumption_date: resumptionDate || undefined,
                salary: salary ? Number(salary) : undefined,
                other_benefits: otherBenefits || undefined,
                nhis,
                salary_bank_name: bankName || undefined,
                salary_account_number: accountNumber || undefined,
                salary_account_name: accountName || undefined,
              },
            })
          }
          disabled={stageMutation.isPending}
        >
          Save Posting &amp; Appointment
        </Button>
      </div>
    );
  }

  // ─── stage status summary for each applicant card ────────────────────────

  function ApplicantCard({ app }: { app: JobApplication }) {
    const isOpen = expanded === app.id;
    return (
      <Card className="overflow-hidden">
        <button
          className="w-full text-left"
          onClick={() => setExpanded(isOpen ? null : app.id)}
        >
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {app.user?.name ?? `Applicant #${app.id}`}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {app.user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {stageBadge(app.stage1_status, "S1 Qualified", "S1 Rejected")}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Stage tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
              {STAGE_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === i
                      ? "border-brand text-brand"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stage summary row */}
            <div className="flex gap-3 px-4 py-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                Stage 1:{" "}
                {stageBadge(app.stage1_status, "Qualified", "Not Qualified")}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                Stage 2:{" "}
                {stageBadge(
                  app.stage2_status,
                  "Shortlisted",
                  "Not Shortlisted",
                )}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                Interview:{" "}
                {stageBadge(app.interview_status, "Attended", "No-Show")}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                Final:{" "}
                {stageBadge(app.final_status, "Recruited", "Not Recruited")}
              </span>
            </div>

            {/* Active panel */}
            <div className="px-4 pb-5">
              {activeTab === 0 && <Stage1Panel app={app} />}
              {activeTab === 1 && <Stage2Panel app={app} />}
              {activeTab === 2 && <InterviewPanel app={app} />}
              {activeTab === 3 && <FinalPanel app={app} />}
              {activeTab === 4 && <PostingPanel app={app} />}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // ─── page render ─────────────────────────────────────────────────────────

  // Filter tabs at page level
  const tabs = [
    { label: "All", filter: (a: JobApplication) => !!a },
    {
      label: "Stage 1",
      filter: (a: JobApplication) =>
        !a.stage1_status || a.stage1_status === "pending",
    },
    {
      label: "Stage 2",
      filter: (a: JobApplication) =>
        a.stage1_status === "qualified" &&
        (!a.stage2_status || a.stage2_status === "pending"),
    },
    {
      label: "Interview",
      filter: (a: JobApplication) =>
        a.stage2_status === "shortlisted" &&
        (!a.interview_status || a.interview_status === "pending"),
    },
    {
      label: "Final",
      filter: (a: JobApplication) =>
        a.interview_status === "attended" &&
        (!a.final_status || a.final_status === "pending"),
    },
    {
      label: "Recruited",
      filter: (a: JobApplication) => a.final_status === "recruited",
    },
    {
      label: "Rejected",
      filter: (a: JobApplication) =>
        a.stage1_status === "not_qualified" ||
        a.stage2_status === "not_shortlisted" ||
        a.final_status === "not_recruited",
    },
  ];

  const [pageTabIndex, setPageTabIndex] = useState(0);
  const visibleApps = applications.filter(tabs[pageTabIndex].filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.back()}
          className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recruitment Pipeline
          </h1>
          {job && (
            <div className="flex items-center gap-2 mt-1">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">{job.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total",
              count: applications.length,
              icon: <User className="h-4 w-4" />,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Qualified",
              count: applications.filter((a) => a.stage1_status === "qualified")
                .length,
              icon: <CheckCircle className="h-4 w-4" />,
              color: "text-green-600 bg-green-50",
            },
            {
              label: "Shortlisted",
              count: applications.filter(
                (a) => a.stage2_status === "shortlisted",
              ).length,
              icon: <Clock className="h-4 w-4" />,
              color: "text-yellow-600 bg-yellow-50",
            },
            {
              label: "Recruited",
              count: applications.filter((a) => a.final_status === "recruited")
                .length,
              icon: <CheckCircle className="h-4 w-4" />,
              color: "text-brand bg-brand/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2 ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.count}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page-level filter tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setPageTabIndex(i)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              pageTabIndex === i
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {tab.label}
            {i === 0 ? ` (${applications.length})` : ""}
          </button>
        ))}
      </div>

      {/* Applicants list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading applicants…
        </div>
      ) : visibleApps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <User className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No applicants here yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              They will appear once people apply for this posting.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleApps.map((app) => (
            <ApplicantCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
