"use client";
import React from "react";
import { Users, GraduationCap, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const enrollmentData = [
  { month: "Sep", count: 487 },
  { month: "Oct", count: 491 },
  { month: "Nov", count: 493 },
  { month: "Dec", count: 490 },
  { month: "Jan", count: 494 },
  { month: "Feb", count: 496 },
];

const classPerf = [
  { class: "SS 1A", avg: 74 },
  { class: "SS 1B", avg: 69 },
  { class: "SS 2A", avg: 78 },
  { class: "JSS 3A", avg: 71 },
  { class: "P 4A", avg: 82 },
  { class: "P 5A", avg: 80 },
];

const feeCollection = [
  { month: "Sep", collected: 6800000, target: 8500000 },
  { month: "Oct", collected: 5200000, target: 7500000 },
  { month: "Nov", collected: 4100000, target: 5000000 },
  { month: "Dec", collected: 3600000, target: 4500000 },
  { month: "Jan", collected: 7200000, target: 8500000 },
  { month: "Feb", collected: 6100000, target: 7500000 },
];

const fmt = (v: number) => `₦${(v / 1_000_000).toFixed(1)}M`;

export default function SchoolAdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Reports
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Analytics &amp; performance overview
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: "496",
            change: "+9 this term",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Avg Attendance",
            value: "91%",
            change: "+2% vs last term",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "Avg Score",
            value: "75.7",
            change: "Across all classes",
            icon: GraduationCap,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
          {
            label: "Fee Collection",
            value: "₦33M",
            change: "80% target",
            icon: DollarSign,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
          },
        ].map(({ label, value, change, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className={`rounded-xl ${bg} p-3`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xs text-green-600 font-medium">{change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrolment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[480, 500]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Students"
                  stroke="#1B4F72"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#1B4F72" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="avg"
                  name="Avg Score"
                  fill="#1B4F72"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fee Collection vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feeCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar
                  dataKey="target"
                  name="Target"
                  fill="#e5e7eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="collected"
                  name="Collected"
                  fill="#1B4F72"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
