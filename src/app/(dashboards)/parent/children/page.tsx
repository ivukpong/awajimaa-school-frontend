"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import {
  GraduationCap,
  BarChart3,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  reg_number: string;
  status: string;
  current_class?: { name: string };
}

export default function ParentChildrenPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-students"],
    queryFn: () =>
      get<any>("/students?guardian=me").then(
        (r) => r.data?.data ?? r.data ?? [],
      ),
  });
  const students: Student[] = Array.isArray(data) ? data : [];

  const demoStudents = [
    {
      id: 1,
      first_name: "Chidinma",
      last_name: "Nwosu",
      reg_number: "GFA/2022/001",
      status: "active",
      attendance: 94,
      avg_score: 72,
      fees: "partial",
      current_class: { name: "SS 1A" },
    },
    {
      id: 2,
      first_name: "Emeka",
      last_name: "Nwosu",
      reg_number: "GFA/2024/002",
      status: "active",
      attendance: 98,
      avg_score: 85,
      fees: "paid",
      current_class: { name: "Primary 4A" },
    },
  ];
  const display = students.length > 0 ? students : demoStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Children
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {display.length} child{display.length !== 1 ? "ren" : ""} registered
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(display as any[]).map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {s.first_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{s.reg_number}</p>
                    <p className="text-sm text-gray-500">
                      {s.current_class?.name ?? "—"}
                    </p>
                  </div>
                  <Badge variant={s.status === "active" ? "green" : "gray"}>
                    {s.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: CheckCircle,
                      label: "Attendance",
                      value: s.attendance ? `${s.attendance}%` : "—",
                      color: "text-green-600",
                    },
                    {
                      icon: BarChart3,
                      label: "Avg Score",
                      value: s.avg_score ? `${s.avg_score}/100` : "—",
                      color: "text-blue-600",
                    },
                    {
                      icon: CreditCard,
                      label: "Fees",
                      value: s.fees ?? "—",
                      color:
                        s.fees === "paid"
                          ? "text-green-600"
                          : "text-yellow-600",
                    },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center"
                    >
                      <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {value}
                      </p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
