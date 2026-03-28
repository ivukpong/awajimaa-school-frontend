"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { get } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { withRoleGuard } from "@/lib/withRoleGuard";
import type { User } from "@/types";
import type { Scholarship, SponsorStudent } from "@/types/finance";

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

function SuperAdminScholarshipsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["super-admin", "scholarships-dashboard"],
    queryFn: async () => {
      const [scholarshipsRes, sponsorsRes, sponsoredRes] = await Promise.all([
        get<{ data?: Scholarship[] } | Scholarship[]>("/scholarships"),
        get<{ data?: User[] } | User[]>("/users?role=sponsor"),
        get<{ data?: SponsorStudent[] } | SponsorStudent[]>("/sponsor-students"),
      ]);

      return {
        scholarships: toArray<Scholarship>(scholarshipsRes.data),
        sponsors: toArray<User>(sponsorsRes.data),
        sponsoredStudents: toArray<SponsorStudent>(sponsoredRes.data),
      };
    },
  });

  const scholarships = data?.scholarships ?? [];
  const sponsors = data?.sponsors ?? [];
  const sponsoredStudents = data?.sponsoredStudents ?? [];
  const activeScholarships = scholarships.filter((item) => item.is_active);
  const approvedStudents = sponsoredStudents.filter(
    (item) => item.status === "active" || item.status === "completed",
  ).length;
  const recentScholarships = [...scholarships]
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    )
    .slice(0, 6);
  const averageStudentsPerScholarship =
    scholarships.length > 0
      ? Math.round((approvedStudents / scholarships.length) * 10) / 10
      : 0;
  const activeCoverage =
    scholarships.length > 0
      ? Math.round((activeScholarships.length / scholarships.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scholarships
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor active scholarship programs, sponsors, and funded students.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Scholarships"
          value={scholarships.length}
          icon={<HeartHandshake className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Active Scholarships"
          value={activeScholarships.length}
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Sponsors"
          value={sponsors.length}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Funded Students"
          value={approvedStudents}
          icon={<CheckCircle className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700 text-white">
          <CardContent className="grid gap-6 pt-0 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                Scholarship Portfolio
              </div>
              <h2 className="mt-4 text-2xl font-semibold">
                Track program reach, active funding, and sponsor-backed student support
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                Review which scholarships are live, how many students are already
                funded, and where additional budget attention may be needed.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <TrendingUp className="h-4 w-4" />
                  Active coverage
                </div>
                <p className="mt-2 text-2xl font-semibold">{activeCoverage}%</p>
                <p className="mt-1 text-xs text-white/70">
                  {activeScholarships.length} of {scholarships.length} scholarships active
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Users className="h-4 w-4" />
                  Average reach
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {averageStudentsPerScholarship}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  funded students per scholarship
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Scholarships</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading scholarships...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load scholarships dashboard."}
              </p>
            ) : recentScholarships.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No scholarships available yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-4">Scholarship</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Students</th>
                      <th className="py-2">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentScholarships.map((scholarship) => {
                      const matchedStudents = sponsoredStudents.filter(
                        (student) => student.scholarship_id === scholarship.id,
                      );

                      return (
                        <tr key={scholarship.id}>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {scholarship.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Starts {formatDate(scholarship.start_date)}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={scholarship.is_active ? "green" : "gray"}
                            >
                              {scholarship.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                            {matchedStudents.length}
                          </td>
                          <td className="py-3 text-gray-600 dark:text-gray-300">
                            {scholarship.total_budget
                              ? formatCurrency(scholarship.total_budget)
                              : "Not set"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading funding data...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load funding snapshot."}
              </p>
            ) : activeScholarships.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No active scholarships to summarize.
              </p>
            ) : (
              <div className="space-y-4">
                {activeScholarships.slice(0, 5).map((scholarship) => {
                  const matchedStudents = sponsoredStudents.filter(
                    (student) => student.scholarship_id === scholarship.id,
                  );
                  const due = matchedStudents.reduce(
                    (sum, student) => sum + Number(student.amount_due ?? 0),
                    0,
                  );
                  const paid = matchedStudents.reduce(
                    (sum, student) => sum + Number(student.amount_paid ?? 0),
                    0,
                  );
                  const progress =
                    due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 0;

                  return (
                    <div key={scholarship.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {scholarship.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {matchedStudents.length} student
                            {matchedStudents.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {progress}%
                        </p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-brand"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatCurrency(paid)} paid of {formatCurrency(due)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading portfolio mix...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load scholarship portfolio."}
              </p>
            ) : scholarships.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No scholarship programs to summarize yet.
              </p>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Active Programs",
                    value: activeScholarships.length,
                    variant: "green" as const,
                  },
                  {
                    label: "Inactive Programs",
                    value: scholarships.length - activeScholarships.length,
                    variant: "gray" as const,
                  },
                  {
                    label: "Sponsors Engaged",
                    value: sponsors.length,
                    variant: "blue" as const,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
                  >
                    <Badge variant={item.variant}>{item.label}</Badge>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withRoleGuard(SuperAdminScholarshipsPage, ["super_admin"]);
