"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Upload,
  Building2,
  Users,
  BookOpen,
  CreditCard,
  ClipboardList,
  Bell,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Loader2,
  X,
  AlertCircle,
  Info,
  Award,
  GraduationCap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { School } from "@/types/school";

// ── CAC status types ──────────────────────────────────────────────────────────

type CacStatus = "unset" | "registered" | "not_registered";

// ── Approval requirements per school type ─────────────────────────────────────

interface ApprovalRequirement {
  id: string;
  title: string;
  body: string;
  agency: string;
  request_type: string;
}

const APPROVAL_MAP: Record<string, ApprovalRequirement[]> = {
  nursery: [
    {
      id: "ubec_registration",
      title: "Early Childhood Care & Development Registration",
      body: "Register with the Universal Basic Education Commission (UBEC) and your State SUBEB for early-childhood education compliance.",
      agency: "SUBEB / UBEC",
      request_type: "new_registration",
    },
    {
      id: "health_safety",
      title: "Health & Safety Inspection Clearance",
      body: "Obtain clearance from the State Ministry of Health confirming the premises meet health and safety standards for young children.",
      agency: "Ministry of Health",
      request_type: "new_registration",
    },
  ],
  primary: [
    {
      id: "moe_primary",
      title: "State Ministry of Education Registration",
      body: "Register your primary school with the State Ministry of Education to obtain an official recognition certificate.",
      agency: "Ministry of Education",
      request_type: "new_registration",
    },
    {
      id: "subeb_accreditation",
      title: "SUBEB Accreditation",
      body: "Apply for State Universal Basic Education Board (SUBEB) accreditation, which is required before admitting pupils.",
      agency: "SUBEB",
      request_type: "new_registration",
    },
  ],
  secondary: [
    {
      id: "sseb_registration",
      title: "State Secondary Education Board Registration",
      body: "Formal registration with the State Secondary Education Board is required before admitting students.",
      agency: "SSEB",
      request_type: "new_registration",
    },
    {
      id: "waec_centre",
      title: "WAEC / NECO Examination Centre Registration",
      body: "Register as an approved examination centre so your students can write WAEC or NECO examinations.",
      agency: "WAEC / NECO",
      request_type: "new_registration",
    },
    {
      id: "moe_secondary",
      title: "Ministry of Education Operating Permit",
      body: "Obtain an operating permit from the State Ministry of Education for secondary schools.",
      agency: "Ministry of Education",
      request_type: "new_registration",
    },
  ],
  tertiary: [
    {
      id: "nuc_accreditation",
      title: "NUC / NBTE / NCCE Accreditation",
      body: "All tertiary institutions must be accredited by the relevant body: NUC (universities), NBTE (polytechnics), or NCCE (colleges of education).",
      agency: "NUC / NBTE / NCCE",
      request_type: "new_registration",
    },
    {
      id: "fme_approval",
      title: "Federal / State Commission Approval",
      body: "Obtain approval from the relevant federal or state commission for your institution to operate legally.",
      agency: "FME / State Commission",
      request_type: "new_registration",
    },
  ],
  combined: [
    {
      id: "moe_combined",
      title: "State Ministry of Education Registration",
      body: "Register your combined school with the State Ministry of Education.",
      agency: "Ministry of Education",
      request_type: "new_registration",
    },
    {
      id: "subeb_combined",
      title: "SUBEB Accreditation (Primary Section)",
      body: "Apply for SUBEB accreditation covering the primary section of your combined school.",
      agency: "SUBEB",
      request_type: "new_registration",
    },
    {
      id: "sseb_combined",
      title: "SSEB Registration (Secondary Section)",
      body: "Register the secondary section with the State Secondary Education Board.",
      agency: "SSEB",
      request_type: "new_registration",
    },
    {
      id: "waec_combined",
      title: "WAEC / NECO Centre Registration",
      body: "Register as an approved examination centre for the secondary section.",
      agency: "WAEC / NECO",
      request_type: "new_registration",
    },
  ],
};

// ── Setup checklist definition ────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  alwaysDone?: boolean;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "account",
    title: "Account Created",
    description:
      "Your school administrator account has been created successfully.",
    href: "#",
    icon: <Award className="h-5 w-5" />,
    alwaysDone: true,
  },
  {
    id: "users",
    title: "Invite Staff & Teachers",
    description:
      "Add teachers, non-teaching staff, and other admin users to your school.",
    href: "/school-admin/teachers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "departments",
    title: "Create Departments",
    description:
      "Organise your school into departments (e.g. Sciences, Arts, Languages).",
    href: "/school-admin/departments",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: "classes",
    title: "Set Up Classes",
    description: "Create your classes and assign class teachers to each.",
    href: "/school-admin/classes",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: "sessions",
    title: "Configure Academic Sessions & Terms",
    description:
      "Define your academic year, sessions, and the three school terms.",
    href: "/school-admin/settings",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "fees",
    title: "Set Up School Fees",
    description: "Configure fee schedules for each class and term.",
    href: "/school-admin/fees",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "syllabus",
    title: "Upload Syllabus & Course Outlines",
    description:
      "Add the curriculum, syllabus, and course outlines for each class.",
    href: "/school-admin/e-learning",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: "admissions",
    title: "Configure Admissions",
    description:
      "Set up your admissions process, intake forms, and requirements.",
    href: "/school-admin/admissions",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    id: "announcement",
    title: "Post First Announcement",
    description: "Welcome your school community with your first announcement.",
    href: "/school-admin/announcements",
    icon: <Bell className="h-5 w-5" />,
  },
];

// ── Confirmation dialog ───────────────────────────────────────────────────────

function ConfirmDialog({
  approval,
  schoolName,
  onConfirm,
  onClose,
  loading,
}: {
  approval: ApprovalRequirement;
  schoolName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <FileCheck className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Submit Application
              </h3>
              <p className="text-xs text-gray-500">{approval.agency}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 p-3 space-y-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {approval.title}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {approval.body}
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          We will submit an application on behalf of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {schoolName}
          </span>{" "}
          using your already-registered details. The relevant agency will
          contact you for any further documentation.
        </p>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} loading={loading}>
            Confirm & Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const user = useAuthStore((s) => s.user);

  // Fetch school details for approval personalisation
  const { data: school } = useQuery<School>({
    queryKey: ["my-school", user?.school_id],
    queryFn: () =>
      get<School>(`/schools/${user!.school_id}`).then((r: any) => r.data ?? r),
    enabled: !!user?.school_id,
  });

  // ── CAC state ───────────────────────────────────────────────────────────────
  const [cacStatus, setCacStatus] = useState<CacStatus>("unset");
  const [cacNumber, setCacNumber] = useState("");
  const [cacDocUrl, setCacDocUrl] = useState("");
  const [cacSaving, setCacSaving] = useState(false);
  const [cacSaved, setCacSaved] = useState(false);

  // ── Checklist state (localStorage) ─────────────────────────────────────────
  const storageKey = `onboarding_done_${user?.id ?? "guest"}`;
  const [done, setDone] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set(["account"]);
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set(["account"]);
    } catch {
      return new Set(["account"]);
    }
  });

  const markDone = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = new Set(prev);
        next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [storageKey],
  );

  const totalItems = CHECKLIST.length;
  const completedCount = CHECKLIST.filter(
    (c) => c.alwaysDone || done.has(c.id),
  ).length;
  const progressPct = Math.round((completedCount / totalItems) * 100);

  // ── Approval state ─────────────────────────────────────────────────────────
  const [confirmApproval, setConfirmApproval] =
    useState<ApprovalRequirement | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const schoolType = school?.school_type ?? "primary";
  const approvals = APPROVAL_MAP[schoolType] ?? APPROVAL_MAP.primary;

  // ── CAC save ────────────────────────────────────────────────────────────────

  const handleSaveCac = async () => {
    if (cacStatus === "registered" && !cacNumber.trim()) {
      toast.error("Please enter your CAC registration number");
      return;
    }
    setCacSaving(true);
    try {
      await patch(`/schools/${user?.school_id}`, {
        cac_registered: cacStatus === "registered",
        cac_number: cacStatus === "registered" ? cacNumber.trim() : null,
        cac_document_url:
          cacStatus === "registered" ? cacDocUrl.trim() || null : null,
      });
      setCacSaved(true);
      toast.success(
        cacStatus === "registered"
          ? "CAC details saved successfully."
          : "We've noted your registration status and will reach out to help.",
      );
    } catch {
      toast.error("Failed to save CAC details. Please try again.");
    } finally {
      setCacSaving(false);
    }
  };

  // ── Approval submit ─────────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!confirmApproval) return;
    setApplyingId(confirmApproval.id);
    try {
      await post("/approval-requests", {
        request_type: confirmApproval.request_type,
        title: confirmApproval.title,
        description: `${confirmApproval.body} Submitted via onboarding checklist for ${school?.name ?? "the school"}.`,
      });
      setAppliedIds((prev) => new Set([...prev, confirmApproval.id]));
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setApplyingId(null);
      setConfirmApproval(null);
    }
  };

  return (
    <>
      {confirmApproval && (
        <ConfirmDialog
          approval={confirmApproval}
          schoolName={school?.name ?? "your school"}
          onConfirm={handleApply}
          onClose={() => setConfirmApproval(null)}
          loading={applyingId === confirmApproval.id}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.name?.split(" ")[0] ?? "School Admin"} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Complete these steps to get your school fully set up on
                Awajimaa.
              </p>
            </div>
            <Link href="/school-admin">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Overall progress bar */}
          <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Setup Progress
              </span>
              <span className="text-sm font-bold text-brand">
                {completedCount} / {totalItems} completed
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2.5 rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {progressPct === 100 && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All setup steps complete — your school is ready!
              </p>
            )}
          </div>
        </div>

        {/* ── Section 1: CAC Registration ───────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-brand" />
              CAC (Corporate Affairs Commission) Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Is your school registered with the Corporate Affairs Commission
              (CAC)?
            </p>

            {!cacSaved ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCacStatus("registered")}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-all",
                      cacStatus === "registered"
                        ? "border-brand bg-brand/5 dark:bg-brand/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                          cacStatus === "registered"
                            ? "border-brand"
                            : "border-gray-300",
                        )}
                      >
                        {cacStatus === "registered" && (
                          <div className="h-2 w-2 rounded-full bg-brand" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        Yes, CAC Registered
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      I have a CAC registration number and documents.
                    </p>
                  </button>

                  <button
                    onClick={() => setCacStatus("not_registered")}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-all",
                      cacStatus === "not_registered"
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                          cacStatus === "not_registered"
                            ? "border-orange-400"
                            : "border-gray-300",
                        )}
                      >
                        {cacStatus === "not_registered" && (
                          <div className="h-2 w-2 rounded-full bg-orange-400" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        Not Yet Registered
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      I haven't registered with CAC yet.
                    </p>
                  </button>
                </div>

                {/* Registered: document upload */}
                {cacStatus === "registered" && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 mt-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CAC Registration Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g. RC 1234567"
                        value={cacNumber}
                        onChange={(e) => setCacNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CAC Certificate Document URL
                        <span className="text-xs text-gray-400 ml-1">
                          (optional — paste a link to the uploaded document)
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                          <Upload className="h-4 w-4" />
                        </div>
                        <input
                          type="url"
                          value={cacDocUrl}
                          onChange={(e) => setCacDocUrl(e.target.value)}
                          placeholder="https://docs.example.com/cac-certificate.pdf"
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Not registered: info card */}
                {cacStatus === "not_registered" && (
                  <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 flex gap-3">
                    <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        We can help you register!
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                        We'll add your school to our CAC registration assistance
                        programme. Our team will reach out with guidance and
                        step-by-step support to get your school legally
                        registered.
                      </p>
                    </div>
                  </div>
                )}

                {cacStatus !== "unset" && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveCac}
                      loading={cacSaving}
                    >
                      Save CAC Status
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {cacStatus === "registered"
                      ? "CAC details saved — thank you!"
                      : "Status saved — our team will be in touch to help with registration."}
                  </p>
                  {cacStatus === "registered" && cacNumber && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      CAC Number: <span className="font-mono">{cacNumber}</span>
                    </p>
                  )}
                </div>
                <button
                  className="ml-auto text-green-500 hover:text-green-700"
                  onClick={() => setCacSaved(false)}
                >
                  <span className="text-xs underline">Edit</span>
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 2: Setup Checklist ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-brand" />
              School Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
            {CHECKLIST.map((item) => {
              const isDone = item.alwaysDone || done.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-4 py-4 first:pt-0 last:pb-0",
                    isDone && "opacity-70",
                  )}
                >
                  {/* Status icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                      isDone
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      React.cloneElement(item.icon as React.ReactElement, {
                        className: "h-4 w-4",
                      })
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDone
                          ? "line-through text-gray-400"
                          : "text-gray-900 dark:text-white",
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Action */}
                  {!item.alwaysDone && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isDone && (
                        <button
                          onClick={() => markDone(item.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
                        >
                          Mark done
                        </button>
                      )}
                      <Link href={item.href}>
                        <Button
                          variant={isDone ? "ghost" : "outline"}
                          size="sm"
                          rightIcon={<ChevronRight className="h-3 w-3" />}
                        >
                          {isDone ? "View" : "Set up"}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {item.alwaysDone && <Badge variant="green">Done</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Section 3: Required Approvals ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-5 w-5 text-brand" />
              Required Government Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your school type
              {school?.school_type && (
                <span>
                  {" ("}
                  <span className="font-medium capitalize">
                    {school.school_type}
                  </span>
                  {")"}
                </span>
              )}
              {school?.state?.name && (
                <span>
                  {" in "}
                  <span className="font-medium">{school.state.name}</span>
                </span>
              )}
              , below are the approvals you need to apply for. We will submit
              them on your behalf using the details you already provided.
            </p>

            {approvals.length === 0 ? (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-500 text-center">
                No approval requirements found for your school type.
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((approval) => {
                  const isApplied = appliedIds.has(approval.id);
                  return (
                    <div
                      key={approval.id}
                      className={cn(
                        "rounded-xl border p-4 flex items-start gap-4",
                        isApplied
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                          : "border-gray-200 dark:border-gray-700",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                          isApplied
                            ? "bg-green-100 dark:bg-green-900/40 text-green-600"
                            : "bg-brand/10 text-brand",
                        )}
                      >
                        {isApplied ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <FileCheck className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {approval.title}
                          </p>
                          <Badge variant="blue">{approval.agency}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {approval.body}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {isApplied ? (
                          <Badge variant="green">Applied</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setConfirmApproval(approval)}
                            leftIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-gray-400 flex items-start gap-1.5 pt-1">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              You can also manage all your approval requests at any time from
              the{" "}
              <Link
                href="/school-admin/approvals"
                className="underline text-brand hover:opacity-80"
              >
                Approvals
              </Link>{" "}
              section in your sidebar.
            </p>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            You can revisit this guide at any time from the sidebar.
          </p>
          <Link href="/school-admin">
            <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
