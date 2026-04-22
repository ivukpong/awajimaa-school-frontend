"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  School,
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  FileCheck,
  ClipboardList,
  HeartHandshake,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { get } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MinistryDashboard {
  counts: {
    schools: number;
    pending_approvals: number;
    teachers: number;
    campaigns: number;
    applications: number;
    postings: number;
  };
  recent_applications: Array<{
    id: number;
    applicant_name: string;
    subject: string;
    stage: string;
    created_at: string;
  }>;
  recent_approvals: Array<{
    id: number;
    school_name: string;
    state: string;
    status: string;
    submitted_at: string;
  }>;
}

const STAGE_VARIANT: Record<
  string,
  "yellow" | "blue" | "green" | "red" | "gray"
> = {
  applied: "yellow",
  stage1_passed: "blue",
  stage2_passed: "blue",
  invited_for_interview: "blue",
  employed: "green",
  rejected: "red",
};

const STATUS_VARIANT: Record<
  string,
  "yellow" | "blue" | "green" | "red" | "gray"
> = {
  pending: "yellow",
  approved: "green",
  queried: "blue",
  rejected: "red",
};

const VIEW_AS_ROLES = [
  {
    label: "School",
    href: "/school-admin",
    description: "School operations and admissions",
    icon: School,
  },
  {
    label: "Parent",
    href: "/parent",
    description: "Child progress and school updates",
    icon: Users,
  },
  {
    label: "Teacher",
    href: "/teacher",
    description: "Classes, attendance, and teaching tools",
    icon: GraduationCap,
  },
  {
    label: "Sponsor",
    href: "/sponsor",
    description: "Scholarships and sponsored students",
    icon: HeartHandshake,
  },
  {
    label: "Student",
    href: "/student",
    description: "Learning hub, classes, and results",
    icon: UserRound,
  },
  {
    label: "Regulator",
    href: "/regulator",
    description: "Compliance and school inspections",
    icon: ShieldCheck,
  },
] as const;

export default function MinistryDashboardPage() {
  const { data, isLoading } = useQuery<MinistryDashboard>({
    queryKey: ["ministry-dashboard"],
    queryFn: () =>
      get<MinistryDashboard>("/ministry/dashboard").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const counts = data?.counts;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rivers State Ministry of Education
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          State-wide education management dashboard
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Registered Schools"
          value={counts?.schools ?? 0}
          icon={<School className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Pending Approvals"
          value={counts?.pending_approvals ?? 0}
          icon={<FileCheck className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="State Teachers"
          value={counts?.teachers ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Recruitment Campaigns"
          value={counts?.campaigns ?? 0}
          icon={<Briefcase className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Total Applications"
          value={counts?.applications ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Teacher Postings"
          value={counts?.postings ?? 0}
          icon={<MapPin className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* View As */}
      <Card>
        <CardHeader>
          <CardTitle>View As</CardTitle>
          <p className="text-sm text-gray-500">
            Demo the experience across different user roles.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {VIEW_AS_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.label}
                  href={role.href}
                  className="group rounded-xl border border-gray-200 p-4 hover:border-brand/40 hover:bg-brand/5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {role.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {role.description}
                      </p>
                    </div>
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-brand" />
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                    Open dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recent_applications ?? []).length === 0 && (
                <p className="text-sm text-gray-500">No recent applications.</p>
              )}
              {(data?.recent_applications ?? []).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {app.applicant_name}
                    </p>
                    <p className="text-xs text-gray-500">{app.subject}</p>
                  </div>
                  <Badge variant={STAGE_VARIANT[app.stage] ?? "gray"}>
                    {app.stage.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Approval Requests */}
        <Card>
          <CardHeader>
            <CardTitle>School Approval Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recent_approvals ?? []).length === 0 && (
                <p className="text-sm text-gray-500">No pending approvals.</p>
              )}
              {(data?.recent_approvals ?? []).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {req.school_name}
                    </p>
                    <p className="text-xs text-gray-500">{req.state}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[req.status] ?? "gray"}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
