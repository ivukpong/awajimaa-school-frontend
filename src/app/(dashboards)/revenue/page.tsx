"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { DollarSign, TrendingUp, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });

  const d = data?.data ?? {};
  const chartData = d.monthly_collections ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Revenue Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Today"
          value={`₦${(d.today_collected ?? 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="This Month"
          value={`₦${(d.month_collected ?? 0).toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={d.pending_payments ?? 0}
          icon={<FileText size={20} />}
          color="yellow"
        />
        <StatCard
          title="Verified Today"
          value={d.verified_today ?? 0}
          icon={<CheckCircle size={20} />}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [
                  `₦${v.toLocaleString()}`,
                  "Collected",
                ]}
              />
              <Bar dataKey="amount" fill="var(--brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Collections</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.recent_payments ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No recent collections
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.recent_payments ?? []).map((p: any) => (
                <li
                  key={p.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{p.payer_name}</p>
                    <p className="text-xs text-gray-400">{p.reference}</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    ₦{p.amount?.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Schools by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.top_schools ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No data available
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.top_schools ?? []).map((sc: any, i: number) => (
                <li
                  key={sc.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="font-medium text-sm">{sc.name}</p>
                  </div>
                  <span className="font-semibold text-sm">
                    ₦{sc.total?.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
