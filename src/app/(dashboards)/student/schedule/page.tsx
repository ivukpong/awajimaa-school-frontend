"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";

interface ExamSchedule extends Record<string, unknown> {
  id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue?: string;
  subject?: { name: string; code: string };
}

export default function StudentSchedulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["exam-schedules"],
    queryFn: () =>
      get<any>("/exam-schedules").then((r) => r.data?.data ?? r.data ?? []),
  });
  const exams: ExamSchedule[] = Array.isArray(data) ? data : [];

  const isToday = (d: string) =>
    new Date(d).toDateString() === new Date().toDateString();
  const isPast = (d: string) => new Date(d) < new Date();

  const columns: Column<ExamSchedule>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (r) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {r.subject?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "exam_date",
      header: "Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span>
            {new Date(r.exam_date).toLocaleDateString("en-NG", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          {isToday(r.exam_date) && <Badge variant="blue">Today</Badge>}
        </div>
      ),
    },
    {
      key: "start_time",
      header: "Time",
      render: (r) => (
        <span className="text-gray-600 dark:text-gray-400">
          {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
        </span>
      ),
    },
    {
      key: "venue",
      header: "Venue",
      render: (r) => (
        <span className="text-gray-600 dark:text-gray-400">
          {r.venue ?? "TBA"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant={
            isToday(r.exam_date)
              ? "blue"
              : isPast(r.exam_date)
                ? "gray"
                : "green"
          }
        >
          {isToday(r.exam_date)
            ? "Today"
            : isPast(r.exam_date)
              ? "Done"
              : "Upcoming"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exam Schedule
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {exams.length} exam{exams.length !== 1 ? "s" : ""} scheduled
        </p>
      </div>
      <Card padding={false}>
        <Table
          keyField="id"
          columns={columns}
          data={exams as any}
                    loading={isLoading}
          emptyMessage="No exams scheduled."
        />
      </Card>
    </div>
  );
}
