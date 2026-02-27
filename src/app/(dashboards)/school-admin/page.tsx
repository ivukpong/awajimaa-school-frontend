"use client";
import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  Users,
  Banknote,
  BookOpen,
  Bell,
  CheckCircle,
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

const feeData = [
  { class: "JSS 1", collected: 820000, pending: 180000 },
  { class: "JSS 2", collected: 750000, pending: 250000 },
  { class: "JSS 3", collected: 900000, pending: 100000 },
  { class: "SS 1", collected: 1100000, pending: 400000 },
  { class: "SS 2", collected: 950000, pending: 350000 },
  { class: "SS 3", collected: 1200000, pending: 200000 },
];

const attendancePie = [
  { name: "Present", value: 1180, fill: "#22C55E" },
  { name: "Absent", value: 80, fill: "#EF4444" },
  { name: "Late", value: 40, fill: "#F59E0B" },
];

const recentActivities = [
  {
    text: "JSS 2A attendance marked by Mrs. Okon",
    time: "5 mins ago",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    text: "New announcement posted: Mid-term break",
    time: "30 mins ago",
    icon: Bell,
    color: "text-blue-500",
  },
  {
    text: "25 new fee payments received",
    time: "1 hour ago",
    icon: Banknote,
    color: "text-purple-500",
  },
  {
    text: "3 new students enrolled in SS 1A",
    time: "2 hours ago",
    icon: GraduationCap,
    color: "text-brand",
  },
];

export default function SchoolAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          2025/2026 Academic Year · Second Term
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,310"
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ value: 3.2, direction: "up" }}
          color="blue"
        />
        <StatCard
          title="Staff"
          value="86"
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Fees Collected"
          value="₦5.72M"
          icon={<Banknote className="h-5 w-5" />}
          trend={{ value: 12, direction: "up" }}
          color="green"
        />
        <StatCard
          title="Active Courses"
          value="42"
          icon={<BookOpen className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fee collection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fee Collection by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={feeData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="class"
                  tick={{ fontSize: 12 }}
                  width={45}
                />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Bar
                  dataKey="collected"
                  fill="#1B4F72"
                  name="Collected"
                  radius={[0, 3, 3, 0]}
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  name="Pending"
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attendancePie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {attendancePie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <a.icon className={`mt-0.5 h-4 w-4 shrink-0 ${a.color}`} />
                <div className="flex-1 text-sm">
                  <p className="text-gray-800 dark:text-gray-200">{a.text}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
