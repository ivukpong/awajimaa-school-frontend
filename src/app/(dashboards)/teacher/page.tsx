"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { BookOpen, Users, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function TeacherDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });

  const d = data ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="My Classes"
          value={d.my_classes ?? 0}
          icon={<BookOpen size={20} />}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={d.total_students ?? 0}
          icon={<Users size={20} />}
          color="green"
        />
        <StatCard
          title="Attendance Today"
          value={`${d.attendance_today ?? 0}%`}
          icon={<CheckCircle size={20} />}
          color="purple"
        />
        <StatCard
          title="Pending Results"
          value={d.pending_results ?? 0}
          icon={<Clock size={20} />}
          color="yellow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.upcoming_exams ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No exams scheduled today
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
                      {ex.class_room?.name} · {ex.start_time}
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

        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.classes ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No classes assigned
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.classes ?? []).map((cls: any) => (
                <li
                  key={cls.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{cls.name}</p>
                    <p className="text-xs text-gray-400">
                      {cls.students_count} students
                    </p>
                  </div>
                  <Badge variant="green" size="sm">
                    Active
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
