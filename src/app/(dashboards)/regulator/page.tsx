"use client";
import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  School,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  TrendingUp,
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
