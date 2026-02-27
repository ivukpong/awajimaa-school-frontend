"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { BookOpen, Users, ClipboardList, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ClassRoom {
  id: number;
  name: string;
  level: string;
  section: string;
  capacity: number;
  students_count?: number;
  subject?: string;
}

export default function TeacherClassesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () =>
      get<any>("/classes").then((r) => r.data?.data ?? r.data ?? []),
  });
  const classes: ClassRoom[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Classes
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {classes.length} class{classes.length !== 1 ? "es" : ""} assigned
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No classes assigned yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {cls.name}
                      </p>
                      <p className="text-sm text-gray-500">Level {cls.level}</p>
                    </div>
                  </div>
                  <Badge variant="blue">Active</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {cls.students_count ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Students</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {cls.capacity}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Capacity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
