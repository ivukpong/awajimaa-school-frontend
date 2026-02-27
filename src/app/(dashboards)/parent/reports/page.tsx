"use client";
import React from "react";
import { BarChart3, TrendingUp, TrendingDown, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const termData = [
  { term: "Term 1 24/25", chidinma: 72, emeka: 85 },
  { term: "Term 2 24/25", chidinma: 77, emeka: 81 },
];

const subjectData = [
  { subject: "Maths", score: 74, grade: "B2" },
  { subject: "English", score: 68, grade: "B3" },
  { subject: "Physics", score: 81, grade: "A1" },
  { subject: "Chemistry", score: 60, grade: "C5" },
  { subject: "Biology", score: 79, grade: "B2" },
  { subject: "Economics", score: 70, grade: "B3" },
];

export default function ParentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Academic Reports
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Performance overview for all your children
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Term Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={termData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="chidinma"
                  name="Chidinma"
                  fill="#1B4F72"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="emeka"
                  name="Emeka"
                  fill="#2980B9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chidinma — Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectData.map((s) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20 shrink-0">
                    {s.subject}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                    {s.score}
                  </span>
                  <Badge
                    variant={
                      s.score >= 75
                        ? "green"
                        : s.score >= 55
                          ? "blue"
                          : "yellow"
                    }
                    size="sm"
                  >
                    {s.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Chidinma Average",
                value: "72%",
                icon: TrendingUp,
                color: "text-green-600",
                bg: "bg-green-50 dark:bg-green-900/20",
              },
              {
                label: "Emeka Average",
                value: "85%",
                icon: Award,
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-900/20",
              },
              {
                label: "Recommended Action",
                value: "Focus on Chemistry",
                icon: TrendingDown,
                color: "text-yellow-600",
                bg: "bg-yellow-50 dark:bg-yellow-900/20",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className={`rounded-xl ${bg} p-4 flex items-center gap-3`}
              >
                <Icon className={`h-6 w-6 ${color}`} />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
