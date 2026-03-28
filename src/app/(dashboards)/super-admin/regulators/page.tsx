"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { withRoleGuard } from "@/lib/withRoleGuard";
import type { User } from "@/types";
import type { FormSubmission, VerificationForm } from "@/types/finance";

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  return [];
}

function SuperAdminRegulatorsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["super-admin", "regulators-dashboard"],
    queryFn: async () => {
      const [regulatorsRes, formsRes, submissionsRes] = await Promise.all([
        get<{ data?: User[] } | User[]>("/users?role=regulator"),
        get<{ data?: VerificationForm[] } | VerificationForm[]>("/verification-forms"),
        get<{ data?: FormSubmission[] } | FormSubmission[]>("/form-submissions"),
      ]);

      return {
        regulators: toArray<User>(regulatorsRes.data),
        forms: toArray<VerificationForm>(formsRes.data),
        submissions: toArray<FormSubmission>(submissionsRes.data),
      };
    },
  });

  const regulators = data?.regulators ?? [];
  const forms = data?.forms ?? [];
  const submissions = data?.submissions ?? [];
  const activeForms = forms.filter((form) => form.is_active);
  const approvedSubmissions = submissions.filter(
    (submission) => submission.status === "approved",
  ).length;
  const pendingReviews = submissions.filter((submission) =>
    ["submitted", "under_review"].includes(submission.status),
  ).length;
  const recentForms = [...forms]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);
  const activeRate =
    forms.length > 0 ? Math.round((activeForms.length / forms.length) * 100) : 0;
  const reviewLoad =
    submissions.length > 0
      ? Math.round((pendingReviews / submissions.length) * 100)
      : 0;

  const statusSummary = [
    {
      label: "Approved",
      value: submissions.filter((item) => item.status === "approved").length,
      variant: "green" as const,
    },
    {
      label: "Under Review",
      value: submissions.filter((item) => item.status === "under_review").length,
      variant: "yellow" as const,
    },
    {
      label: "Submitted",
      value: submissions.filter((item) => item.status === "submitted").length,
      variant: "blue" as const,
    },
    {
      label: "Needs Revision",
      value: submissions.filter((item) => item.status === "needs_revision").length,
      variant: "red" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Regulators
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review regulator accounts, form activity, and submission health.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Regulators"
          value={regulators.length}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Active Verification Forms"
          value={activeForms.length}
          icon={<FileText className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Approved Submissions"
          value={approvedSubmissions}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="bg-gradient-to-r from-[#1B4F72] via-[#24638f] to-[#2d77a7] text-white">
          <CardContent className="grid gap-6 pt-0 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                Regulatory Oversight
              </div>
              <h2 className="mt-4 text-2xl font-semibold">
                Platform-wide visibility into regulator performance
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                Monitor account coverage, active verification workflows, and the
                submissions currently waiting on action.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Shield className="h-4 w-4" />
                  Form activation rate
                </div>
                <p className="mt-2 text-2xl font-semibold">{activeRate}%</p>
                <p className="mt-1 text-xs text-white/70">
                  {activeForms.length} of {forms.length} forms are live
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <AlertTriangle className="h-4 w-4" />
                  Pending review load
                </div>
                <p className="mt-2 text-2xl font-semibold">{reviewLoad}%</p>
                <p className="mt-1 text-xs text-white/70">
                  {pendingReviews} of {submissions.length} submissions need attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Verification Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading forms...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load regulators dashboard."}
              </p>
            ) : recentForms.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No verification forms created yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentForms.map((form) => {
                  const responses = submissions.filter(
                    (submission) => submission.form_id === form.id,
                  );

                  return (
                    <li
                      key={form.id}
                      className="flex items-start justify-between gap-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {form.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Created {formatDate(form.created_at)} · {responses.length}{" "}
                          submission{responses.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Badge variant={form.is_active ? "green" : "gray"}>
                        {form.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">
                Loading submission summary...
              </p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load submission summary."}
              </p>
            ) : submissions.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No form submissions have been received yet.
              </p>
            ) : (
              <div className="space-y-3">
                {statusSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={item.variant}>{item.label}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulator Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading regulators...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load regulators."}
              </p>
            ) : regulators.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No regulator accounts found yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {regulators.slice(0, 5).map((regulator) => (
                  <li
                    key={regulator.id}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {regulator.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {regulator.email}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Joined {formatDate(regulator.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withRoleGuard(SuperAdminRegulatorsPage, ["super_admin"]);
