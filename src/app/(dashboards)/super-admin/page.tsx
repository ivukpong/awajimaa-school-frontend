"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { School, Users, DollarSign, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import {
  LineChart,
  Line,
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

const PIE_COLORS = ["#1B4F72", "#2980B9", "#5DADE2", "#AED6F1", "#D6EAF8"];

export default function SuperAdminDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });
  const d = data?.data ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Platform Overview
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Schools"
          value={d.total_schools ?? 0}
          icon={<School size={20} />}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={(d.total_students ?? 0).toLocaleString()}
          icon={<Users size={20} />}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={(d.total_users ?? 0).toLocaleString()}
          icon={<Users size={20} />}
          color="purple"
        />
        <StatCard
          title="Revenue (MTD)"
          value={`₦${((d.revenue_mtd ?? 0) / 1000).toFixed(0)}k`}
          icon={<DollarSign size={20} />}
          color="yellow"
        />
        <StatCard
          title="Active Regulators"
          value={d.active_regulators ?? 0}
          icon={<Shield size={20} />}
          color="red"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Growth chart */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>School Registrations (12 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={d.monthly_registrations ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Schools by type */}
        <Card>
          <CardHeader>
            <CardTitle>Schools by Type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={d.schools_by_type ?? []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                >
                  {(d.schools_by_type ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top states */}
        <Card>
          <CardHeader>
            <CardTitle>Top States by Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.top_states ?? []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="state"
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="var(--brand)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent schools */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Registered Schools</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.recent_schools ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No recent registrations
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.recent_schools ?? []).map((s: any) => (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {s.lga?.name}, {s.state?.name}
                    </p>
                  </div>
                  <Badge variant="blue" size="sm">
                    {s.type}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
