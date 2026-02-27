"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Users, BookOpen, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ClassRoom {
  id: number;
  name: string;
  level?: string;
  capacity?: number;
  students_count: number;
  class_teacher?: { name: string };
  subjects?: { id: number; name: string }[];
}

export default function ClassesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get<ClassRoom[]>("/classes"),
  });

  const classes = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Classes
        </h1>
        <Button leftIcon={<PlusCircle size={16} />}>Add Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-base">{cls.name}</CardTitle>
              {cls.level && (
                <Badge variant="blue" size="sm">
                  {cls.level}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={14} />
                <span>
                  {cls.students_count} / {cls.capacity ?? "∞"} students
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen size={14} />
                <span>{cls.subjects?.length ?? 0} subjects</span>
              </div>
              {cls.class_teacher && (
                <p className="text-xs text-gray-500">
                  Class teacher:{" "}
                  <span className="font-medium">{cls.class_teacher.name}</span>
                </p>
              )}
              {cls.subjects && cls.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {cls.subjects.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5"
                    >
                      {s.name}
                    </span>
                  ))}
                  {cls.subjects.length > 4 && (
                    <span className="text-xs text-gray-400">
                      +{cls.subjects.length - 4}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No classes found. Add your first class to get started.
          </div>
        )}
      </div>
    </div>
  );
}
