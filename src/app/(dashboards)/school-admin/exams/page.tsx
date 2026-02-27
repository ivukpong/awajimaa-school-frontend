"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Calendar, Clock, MapPin, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ExamSchedule extends Record<string, unknown> {
  id: number;
  title: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue?: string;
  subject: { name: string };
  class_room: { name: string };
  term: { name: string };
}

export default function ExamsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["exam-schedules"],
    queryFn: () => get<ExamSchedule[]>("/exam-schedules"),
  });

  const exams = data?.data ?? [];

  const grouped = exams.reduce<Record<string, ExamSchedule[]>>((acc, exam) => {
    const date = exam.exam_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(exam);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exam Schedules
        </h1>
        <Button leftIcon={<PlusCircle size={16} />}>Schedule Exam</Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                {new Date(date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              {items.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{exam.subject?.name}</p>
                        <p className="text-xs text-gray-500">{exam.title}</p>
                      </div>
                      <Badge variant="blue">{exam.class_room?.name}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {exam.start_time} – {exam.end_time}
                      </span>
                      {exam.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {exam.venue}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{exam.term?.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {!isLoading && exams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            No exams scheduled yet. Click "Schedule Exam" to add one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
