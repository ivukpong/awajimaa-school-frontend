"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { get } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { withRoleGuard } from "@/lib/withRoleGuard";
import type { Scholarship, SponsorStudent } from "@/types/finance";
import type { User } from "@/types";

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

function SuperAdminSponsorsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["super-admin", "sponsors-dashboard"],
    queryFn: async () => {
      const [sponsorsRes, scholarshipsRes, sponsoredRes] = await Promise.all([
        get<{ data?: User[] } | User[]>("/users?role=sponsor"),
        get<{ data?: Scholarship[] } | Scholarship[]>("/scholarships"),
        get<{ data?: SponsorStudent[] } | SponsorStudent[]>("/sponsor-students"),
      ]);

      const sponsors = toArray<User>(sponsorsRes.data);
      const scholarships = toArray<Scholarship>(scholarshipsRes.data);
      const sponsoredStudents = toArray<SponsorStudent>(sponsoredRes.data);

      return { sponsors, scholarships, sponsoredStudents };
    },
  });

  const sponsors = data?.sponsors ?? [];
  const scholarships = data?.scholarships ?? [];
  const sponsoredStudents = data?.sponsoredStudents ?? [];
  const activeScholarships = scholarships.filter((scholarship) => scholarship.is_active);
  const totalPaid = sponsoredStudents.reduce(
    (sum, student) => sum + Number(student.amount_paid ?? 0),
    0,
  );
  const totalCommitted = sponsoredStudents.reduce(
    (sum, student) => sum + Number(student.amount_due ?? 0),
    0,
  );
  const activeStudents = sponsoredStudents.filter(
    (student) => student.status === "active",
  ).length;
  const recentSponsors = [...sponsors]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);
  const recentScholarships = [...scholarships]
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    )
    .slice(0, 5);
  const fulfillmentRate =
    totalCommitted > 0 ? Math.round((totalPaid / totalCommitted) * 100) : 0;
  const sponsorCoverage =
    sponsors.length > 0
      ? `${Math.round((activeStudents / sponsors.length) * 10) / 10} students / sponsor`
      : "No sponsor coverage yet";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sponsors
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track sponsor activity, scholarship coverage, and payment progress.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Sponsors"
          value={sponsors.length}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Active Scholarships"
          value={activeScholarships.length}
          icon={<HeartHandshake className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Active Sponsored Students"
          value={activeStudents}
          icon={<GraduationCap className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle={
            totalCommitted > 0
              ? `${Math.round((totalPaid / totalCommitted) * 100)}% of committed support`
              : "No sponsor payments yet"
          }
          icon={<CreditCard className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white">
          <CardContent className="grid gap-6 pt-0 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                Sponsor Network
              </div>
              <h2 className="mt-4 text-2xl font-semibold">
                Measure sponsor momentum across scholarships and funded students
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                This view highlights who joined recently, where scholarships are
                active, and how much of committed support has already been paid.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <TrendingUp className="h-4 w-4" />
                  Fulfillment rate
                </div>
                <p className="mt-2 text-2xl font-semibold">{fulfillmentRate}%</p>
                <p className="mt-1 text-xs text-white/70">
                  {formatCurrency(totalPaid)} paid out of {formatCurrency(totalCommitted)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <Users className="h-4 w-4" />
                  Coverage
                </div>
                <p className="mt-2 text-lg font-semibold">{sponsorCoverage}</p>
                <p className="mt-1 text-xs text-white/70">
                  Based on {activeStudents} active students and {sponsors.length} sponsors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading sponsors...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load sponsors dashboard."}
              </p>
            ) : recentSponsors.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">No sponsors found yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentSponsors.map((sponsor) => (
                  <li
                    key={sponsor.id}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sponsor.name}
                      </p>
                      <p className="text-sm text-gray-500">{sponsor.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(sponsor.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scholarship Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading scholarships...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load scholarships."}
              </p>
            ) : recentScholarships.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No scholarships have been created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentScholarships.map((scholarship) => {
                  const allocatedStudents = sponsoredStudents.filter(
                    (student) => student.scholarship_id === scholarship.id,
                  );
                  const amountDue = allocatedStudents.reduce(
                    (sum, student) => sum + Number(student.amount_due ?? 0),
                    0,
                  );
                  const amountPaid = allocatedStudents.reduce(
                    (sum, student) => sum + Number(student.amount_paid ?? 0),
                    0,
                  );

                  return (
                    <div
                      key={scholarship.id}
                      className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {scholarship.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Starts {formatDate(scholarship.start_date)}
                          </p>
                        </div>
                        <Badge
                          variant={scholarship.is_active ? "green" : "gray"}
                        >
                          {scholarship.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Students
                          </p>
                          <p className="mt-1 font-medium text-gray-900 dark:text-white">
                            {allocatedStudents.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Paid / Due
                          </p>
                          <p className="mt-1 font-medium text-gray-900 dark:text-white">
                            {formatCurrency(amountPaid)} / {formatCurrency(amountDue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-6 text-sm text-gray-500">Loading payment data...</p>
            ) : isError ? (
              <p className="py-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load sponsor payment summary."}
              </p>
            ) : sponsoredStudents.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                No sponsored student records available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Paid",
                    value: formatCurrency(totalPaid),
                    variant: "green" as const,
                  },
                  {
                    label: "Committed",
                    value: formatCurrency(totalCommitted),
                    variant: "blue" as const,
                  },
                  {
                    label: "Outstanding",
                    value: formatCurrency(Math.max(totalCommitted - totalPaid, 0)),
                    variant: "yellow" as const,
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

export default withRoleGuard(SuperAdminSponsorsPage, ["super_admin"]);
