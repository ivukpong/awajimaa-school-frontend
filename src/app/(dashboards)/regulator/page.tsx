"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  School,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { get } from "@/lib/api";
import type { SchoolRegistration } from "@/types/school";
import type { PaginatedResponse } from "@/types";

const enrollmentData = [
  { month: "Sep", students: 1200 },
  { month: "Oct", students: 1230 },
  { month: "Nov", students: 1250 },
  { month: "Dec", students: 1245 },
  { month: "Jan", students: 1290 },
  { month: "Feb", students: 1310 },
];

const revenueData = [
  { month: "Sep", collected: 2400000, pending: 800000 },
  { month: "Oct", collected: 2600000, pending: 600000 },
  { month: "Nov", collected: 2100000, pending: 900000 },
  { month: "Dec", collected: 1800000, pending: 1200000 },
  { month: "Jan", collected: 2900000, pending: 500000 },
  { month: "Feb", collected: 3100000, pending: 400000 },
];

function statusBadge(s: SchoolRegistration) {
  if (s.is_active)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </span>
    );
  if (s.signup_fee_paid)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="h-3 w-3" /> Pending Review
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <XCircle className="h-3 w-3" /> Awaiting Payment
    </span>
  );
}

function formatDate(dt?: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatType(t: string | string[]) {
  const arr = Array.isArray(t) ? t : JSON.parse(t || "[]");
  return (arr as string[])
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
    .join(", ");
}

export default function RegulatorDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "approved" | "pending">(
    "",
  );

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const regsQ = useQuery({
    queryKey: ["regulator-school-registrations", params],
    queryFn: () =>
      get<PaginatedResponse<SchoolRegistration>>(
        `/regulator/school-registrations?${new URLSearchParams(params)}`,
      ),
  });

  const registrations: SchoolRegistration[] =
    (regsQ.data?.data as unknown as { data: SchoolRegistration[] })?.data ?? [];

  const totalCount =
    (regsQ.data?.data as unknown as { total?: number })?.total ?? 0;
  const approvedCount = registrations.filter((s) => s.is_active).length;
  const pendingCount = registrations.filter((s) => !s.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Regulatory Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitoring all schools under your jurisdiction
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={totalCount > 0 ? String(totalCount) : "248"}
          icon={<School className="h-5 w-5" />}
          trend={{ value: 4, label: "this term", direction: "up" }}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value="41,320"
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ value: 6.2, label: "vs last term", direction: "up" }}
          color="green"
        />
        <StatCard
          title="Charges Collected"
          value="₦12.4M"
          icon={<CreditCard className="h-5 w-5" />}
          subtitle="of ₦18.2M total"
          trend={{ value: 12, direction: "up" }}
          color="purple"
        />
        <StatCard
          title="Pending Forms"
          value={pendingCount > 0 ? String(pendingCount) : "34"}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, label: "awaiting review", direction: "down" }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrollment trend */}
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#1B4F72"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Charges Collected vs Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Bar
                  dataKey="collected"
                  fill="#1B4F72"
                  radius={[3, 3, 0, 0]}
                  name="Collected"
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  radius={[3, 3, 0, 0]}
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── School Registrations ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>School Registrations</CardTitle>
              <p className="mt-0.5 text-sm text-gray-500">
                All schools that have signed up — newest first
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {approvedCount} Approved
              </span>
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {pendingCount} Pending
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search by school name, LGA, or town…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              wrapperClassName="flex-1"
            />
            <select
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | "approved" | "pending")
              }
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3">Town</th>
                  <th className="px-4 py-3">LGA</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    Date of Submission
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">
                    Date of Approval
                  </th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
                {regsQ.isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Loading registrations…
                    </td>
                  </tr>
                )}
                {!regsQ.isLoading && registrations.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No school registrations found.
                    </td>
                  </tr>
                )}
                {registrations.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.town?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.lga?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="blue">{formatType(s.type)}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {formatDate(s.approved_at)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const enrollmentData = [
  { month: "Sep", students: 1200 },
  { month: "Oct", students: 1230 },
  { month: "Nov", students: 1250 },
  { month: "Dec", students: 1245 },
  { month: "Jan", students: 1290 },
  { month: "Feb", students: 1310 },
];

const revenueData = [
  { month: "Sep", collected: 2400000, pending: 800000 },
  { month: "Oct", collected: 2600000, pending: 600000 },
  { month: "Nov", collected: 2100000, pending: 900000 },
  { month: "Dec", collected: 1800000, pending: 1200000 },
  { month: "Jan", collected: 2900000, pending: 500000 },
  { month: "Feb", collected: 3100000, pending: 400000 },
];

const recentSchools = [
  {
    id: 1,
    name: "Government Secondary School, Uyo",
    lga: "Uyo",
    status: "Active",
  },
  { id: 2, name: "Greenfield Academy", lga: "Ikot Ekpene", status: "Active" },
  { id: 3, name: "Heritage Nursery & Primary", lga: "Eket", status: "Pending" },
  { id: 4, name: "St. Patrick's College", lga: "Abak", status: "Active" },
];

export default function RegulatorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Regulatory Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitoring all schools under your jurisdiction
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value="248"
          icon={<School className="h-5 w-5" />}
          trend={{ value: 4, label: "this term", direction: "up" }}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value="41,320"
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ value: 6.2, label: "vs last term", direction: "up" }}
          color="green"
        />
        <StatCard
          title="Charges Collected"
          value="₦12.4M"
          icon={<CreditCard className="h-5 w-5" />}
          subtitle="of ₦18.2M total"
          trend={{ value: 12, direction: "up" }}
          color="purple"
        />
        <StatCard
          title="Pending Forms"
          value="34"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, label: "awaiting review", direction: "down" }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrollment trend */}
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#1B4F72"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Charges Collected vs Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Bar
                  dataKey="collected"
                  fill="#1B4F72"
                  radius={[3, 3, 0, 0]}
                  name="Collected"
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  radius={[3, 3, 0, 0]}
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Schools in Jurisdiction</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="py-2 pr-4">School Name</th>
                <th className="py-2 pr-4">LGA</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentSchools.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                    {s.lga}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
