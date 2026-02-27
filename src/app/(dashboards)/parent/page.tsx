"use client";
import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  CreditCard,
  Bell,
  BarChart3,
  Shield,
  MessageSquare,
  Calendar,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const children = [
  {
    id: 1,
    name: "Chidinma Nwosu",
    reg: "GS/2022/088",
    class: "SS 1A",
    photo: null,
    attendance_pct: 94,
    fees_status: "partial" as const,
    last_result_avg: 72,
  },
  {
    id: 2,
    name: "Emeka Nwosu",
    reg: "GS/2024/034",
    class: "Primary 4B",
    photo: null,
    attendance_pct: 98,
    fees_status: "paid" as const,
    last_result_avg: 85,
  },
];

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Parent / Guardian Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your children&apos;s academic journey
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Generate Pickup Code",
            icon: Shield,
            href: "/parent/pickup",
            color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Pay Fees",
            icon: CreditCard,
            href: "/parent/fees",
            color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
          },
          {
            label: "View Reports",
            icon: BarChart3,
            href: "/parent/reports",
            color: "text-green-600 bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "Messages",
            icon: MessageSquare,
            href: "/parent/messages",
            color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
          },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow transition-shadow dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${q.color}`}
            >
              <q.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {q.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand text-lg font-bold shrink-0">
                {child.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {child.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {child.reg} · {child.class}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-xs text-gray-500">Attendance</p>
                    <p className="mt-0.5 font-bold text-green-600">
                      {child.attendance_pct}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-xs text-gray-500">Avg Score</p>
                    <p className="mt-0.5 font-bold text-brand">
                      {child.last_result_avg}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-xs text-gray-500">Fees</p>
                    <Badge
                      variant={
                        child.fees_status === "paid" ? "green" : "yellow"
                      }
                      size="sm"
                    >
                      {child.fees_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<BarChart3 className="h-4 w-4" />}
              >
                Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<GraduationCap className="h-4 w-4" />}
              >
                Profile
              </Button>
              <Button
                size="sm"
                className="flex-1"
                leftIcon={<Shield className="h-4 w-4" />}
              >
                Pickup Code
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Announcements & Messages */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { title: "Mid-Term Break: 10 – 14 March 2026", date: "Feb 26" },
                {
                  title: "PTA Meeting — Saturday 7 March 2026",
                  date: "Feb 24",
                },
                {
                  title: "End-of-term examination schedule released",
                  date: "Feb 20",
                },
              ].map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-gray-800 dark:text-gray-200">{a.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {a.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { title: "PTA Meeting", date: "Sat, 7 Mar 2026 · 10:00 AM" },
                { title: "Sports Day", date: "Fri, 20 Mar 2026 · 9:00 AM" },
                { title: "End-of-Term Exams begin", date: "Mon, 30 Mar 2026" },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <Calendar className="h-3.5 w-3.5 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {e.title}
                    </p>
                    <p className="text-xs text-gray-500">{e.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
