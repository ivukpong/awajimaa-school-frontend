"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  Users,
  Banknote,
  BookOpen,
  Bell,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function SchoolAdminDashboard() {
  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });

  const { data: statsData } = useQuery({
    queryKey: ["dashboard-school-stats"],
    queryFn: () => get<any>("/dashboard/school-stats"),
  });

  const d = dashData?.data ?? {};
  const s = statsData?.data ?? {};

  const feeCounts = s.fee_status ?? {};
  const feeTotal =
    (feeCounts.fully_paid ?? 0) +
    (feeCounts.partial ?? 0) +
    (feeCounts.unpaid ?? 0);

  const feeStatusPie = [
    { name: "Fully Paid", value: feeCounts.fully_paid ?? 0, fill: "#22C55E" },
    { name: "Partial", value: feeCounts.partial ?? 0, fill: "#F59E0B" },
    { name: "Unpaid", value: feeCounts.unpaid ?? 0, fill: "#EF4444" },
  ];

  const userCounts = s.user_counts ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {d.academic_year
            ? `${d.academic_year} · ${d.term ?? ""}`
            : "Overview"}
        </p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={(d.total_students ?? userCounts.student ?? 0).toLocaleString()}
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Staff"
          value={(userCounts.teacher ?? d.total_teachers ?? 0).toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Fees Collected"
          value={formatCurrency(d.fees_collected ?? 0)}
          icon={<Banknote className="h-5 w-5" />}
          trend={d.fees_collected ? { value: 0, direction: "up" } : undefined}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(d.fees_outstanding ?? 0)}
          icon={<Banknote className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* User category counts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Parents",
            count: userCounts.parent ?? 0,
            color: "text-purple-600",
          },
          {
            label: "Revenue Collectors",
            count: userCounts.revenue_collector ?? 0,
            color: "text-blue-600",
          },
          {
            label: "Security",
            count: userCounts.security ?? 0,
            color: "text-red-600",
          },
          {
            label: "Attendance Rate",
            count: `${d.attendance_rate ?? 0}%`,
            color: "text-green-600",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fee payment status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {feeTotal === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                No fee data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={feeStatusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {feeStatusPie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-green-600 font-bold text-lg">
                  {feeCounts.fully_paid ?? 0}
                </p>
                <p className="text-gray-500">Fully Paid</p>
              </div>
              <div>
                <p className="text-yellow-500 font-bold text-lg">
                  {feeCounts.partial ?? 0}
                </p>
                <p className="text-gray-500">Partial</p>
              </div>
              <div>
                <p className="text-red-500 font-bold text-lg">
                  {feeCounts.unpaid ?? 0}
                </p>
                <p className="text-gray-500">Unpaid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance pie */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.attendance_breakdown?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={d.attendance_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {(d.attendance_breakdown ?? []).map((_: any, i: number) => (
                      <Cell
                        key={i}
                        fill={["#22C55E", "#EF4444", "#F59E0B"][i] ?? "#94A3B8"}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-4xl font-bold text-green-600">
                  {d.attendance_rate ?? 0}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Overall Attendance Rate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
