"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { DollarSign, TrendingUp, Users, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const paymentHistory = [
  { month: "Oct'24", amount: 170000 },
  { month: "Nov'24", amount: 170000 },
  { month: "Dec'24", amount: 170000 },
  { month: "Jan'25", amount: 170000 },
  { month: "Feb'25", amount: 170000 },
  { month: "Mar'25", amount: 170000 },
];

const fmt = (v: number) => `₦${(v / 1000).toFixed(0)}k`;

const sponsored = [
  {
    name: "Amara Okafor",
    school: "Greenfield Academy",
    class: "SS 1A",
    status: "active",
    amount: 85000,
    paid: 85000,
  },
  {
    name: "Chukwudi Eze",
    school: "Unity High",
    class: "JSS 3A",
    status: "active",
    amount: 85000,
    paid: 85000,
  },
];

export default function SponsorPaymentsPage() {
  const { data } = useQuery({
    queryKey: ["scholarships"],
    queryFn: () =>
      get<any>("/scholarships").then((r) => r.data?.data ?? r.data ?? []),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scholarship Payments
        </h1>
        <p className="text-sm text-gray-500">
          Track your scholarship disbursements
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Students Sponsored",
            value: "2",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Total Disbursed",
            value: "₦1.02M",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "This Term",
            value: "₦170k",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
          {
            label: "Active Scholarships",
            value: "2",
            icon: Award,
            color: "text-yellow-600",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => `₦${v.toLocaleString()}`} />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  fill="#1B4F72"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sponsored Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sponsored.map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-gray-100 dark:border-gray-800 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.school} · {s.class}
                      </p>
                    </div>
                    <Badge variant="green">{s.status}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Paid: ₦{s.paid.toLocaleString()}</span>
                      <span>Total: ₦{s.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(s.paid / s.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">School</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((m, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                >
                  <td className="py-3 text-gray-500">{m.month}</td>
                  <td className="py-3 text-gray-900 dark:text-white">
                    {i % 2 === 0 ? "Amara Okafor" : "Chukwudi Eze"}
                  </td>
                  <td className="py-3 text-gray-500">
                    {i % 2 === 0 ? "Greenfield Academy" : "Unity High"}
                  </td>
                  <td className="py-3 font-semibold text-gray-900 dark:text-white text-right">
                    ₦{m.amount.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <Badge variant="green">Completed</Badge>
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
