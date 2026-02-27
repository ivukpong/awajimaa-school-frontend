"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { User, TrendingUp, Award } from "lucide-react";

interface SponsoredStudent {
  id: number;
  student: {
    id: number;
    full_name: string;
    admission_number: string;
    class_room?: { name: string };
    attendance_rate?: number;
    avg_score?: number;
  };
  scholarship: { name: string };
  created_at: string;
}

export default function SponsorStudentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sponsored-students"],
    queryFn: () => get<{ data: SponsoredStudent[] }>("/sponsor/students"),
  });

  const students = data?.data.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Sponsored Students
      </h1>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((ss) => (
          <Card key={ss.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {ss.student.full_name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {ss.student.admission_number}
                  </p>
                  {ss.student.class_room && (
                    <Badge variant="blue" size="sm" className="mt-1">
                      {ss.student.class_room.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t dark:border-gray-700 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-green-500" />
                    <span className="text-xs text-gray-400">Avg Score</span>
                  </div>
                  <p className="font-bold text-sm">
                    {ss.student.avg_score ?? "--"}%
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award size={12} className="text-blue-500" />
                    <span className="text-xs text-gray-400">Attendance</span>
                  </div>
                  <p className="font-bold text-sm">
                    {ss.student.attendance_rate ?? "--"}%
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                <p className="text-xs text-gray-400">Scholarship</p>
                <p className="text-sm font-medium truncate">
                  {ss.scholarship.name}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && students.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            No sponsored students yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
