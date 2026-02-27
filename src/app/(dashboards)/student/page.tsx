"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { BookOpen, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });

  const d = data?.data ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome, {user?.name?.split(" ")[0]} 👋
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${d.attendance_rate ?? 0}%`}
          icon={<Calendar size={20} />}
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={`${d.avg_score ?? 0}%`}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <StatCard
          title="Courses"
          value={d.enrolled_courses ?? 0}
          icon={<BookOpen size={20} />}
          color="purple"
        />
        <StatCard
          title="Fee Balance"
          value={`₦${(d.fee_balance ?? 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="yellow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.upcoming_exams ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No upcoming exams
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.upcoming_exams ?? []).map((ex: any) => (
                <li
                  key={ex.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{ex.subject?.name}</p>
                    <p className="text-xs text-gray-400">
                      {ex.date} · {ex.start_time}
                    </p>
                  </div>
                  <Badge variant="blue" size="sm">
                    {ex.venue}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.recent_results ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No results yet
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.recent_results ?? []).map((r: any) => (
                <li
                  key={r.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{r.subject?.name}</p>
                    <p className="text-xs text-gray-400">{r.term?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.total}%</span>
                    <Badge
                      variant={
                        r.grade === "A"
                          ? "green"
                          : r.grade === "B"
                            ? "blue"
                            : r.grade === "C"
                              ? "yellow"
                              : "red"
                      }
                      size="sm"
                    >
                      {r.grade}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
