import React from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  Activity,
  BarChart3,
  Calendar,
  Download,
  Heart,
} from "lucide-react";

// In production this would fetch from the API using the token
async function getStudentByToken(token: string) {
  // Mocked — replace with `fetch(${process.env.NEXT_PUBLIC_API_URL}/students/public/${token})`
  if (token === "demo") {
    return {
      student: {
        first_name: "Amara",
        last_name: "Nkemdirim",
        reg_number: "GS/2023/001",
        gender: "female",
        date_of_birth: "2008-03-14",
        admission_date: "2020-09-07",
        current_class: "SS 2A",
      },
      health: { blood_group: "O+", genotype: "AA" },
      activities: [
        {
          category: "debate",
          name: "Debate Club Captain",
          level: "SS 2",
          year: "2025",
        },
        {
          category: "sports",
          name: "100m Sprint - 2nd Place",
          level: "SS 1",
          year: "2024",
        },
      ],
      results: [
        {
          subject: "Mathematics",
          ca1: 18,
          ca2: 17,
          exam: 62,
          total: 97,
          grade: "A1",
        },
        {
          subject: "English Language",
          ca1: 16,
          ca2: 15,
          exam: 58,
          total: 89,
          grade: "B2",
        },
        {
          subject: "Physics",
          ca1: 14,
          ca2: 16,
          exam: 55,
          total: 85,
          grade: "B3",
        },
        {
          subject: "Chemistry",
          ca1: 17,
          ca2: 15,
          exam: 60,
          total: 92,
          grade: "A2",
        },
      ],
      attendance: { total_days: 68, present: 64, percentage: 94 },
    };
  }
  return null;
}

export default async function PublicStudentProfile({
  params,
}: {
  params: { token: string };
}) {
  const data = await getStudentByToken(params.token);
  if (!data) return notFound();

  const { student, health, activities, results, attendance } = data;

  const gradeColor = (grade: string) => {
    if (["A1", "A2"].includes(grade)) return "green";
    if (["B2", "B3"].includes(grade)) return "blue";
    if (["C4", "C5", "C6"].includes(grade)) return "yellow";
    return "red";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-brand text-white py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
              {student.first_name[0]}
              {student.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-white/80 text-sm">
                {student.reg_number} · {student.current_class}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs">
                  Blood Group: {health.blood_group}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs">
                  Genotype: {health.genotype}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs capitalize">
                  Gender: {student.gender}
                </span>
              </div>
            </div>
            <button className="ml-auto hidden sm:flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-xs text-gray-500">Attendance</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {attendance.percentage}%
            </p>
            <p className="text-xs text-gray-400">
              {attendance.present}/{attendance.total_days} days
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500">Subjects</p>
            <p className="text-2xl font-bold text-brand mt-1">
              {results.length}
            </p>
            <p className="text-xs text-gray-400">this term</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-gray-500">Avg Score</p>
            <p className="text-2xl font-bold text-brand mt-1">
              {Math.round(
                results.reduce((a, r) => a + r.total, 0) / results.length,
              )}
              %
            </p>
            <p className="text-xs text-gray-400">overall</p>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand" /> Academic Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4 text-center">CA1</th>
                  <th className="pb-2 pr-4 text-center">CA2</th>
                  <th className="pb-2 pr-4 text-center">Exam</th>
                  <th className="pb-2 pr-4 text-center">Total</th>
                  <th className="pb-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">
                      {r.subject}
                    </td>
                    <td className="py-2 pr-4 text-center text-gray-600">
                      {r.ca1}/20
                    </td>
                    <td className="py-2 pr-4 text-center text-gray-600">
                      {r.ca2}/20
                    </td>
                    <td className="py-2 pr-4 text-center text-gray-600">
                      {r.exam}/60
                    </td>
                    <td className="py-2 pr-4 text-center font-semibold">
                      {r.total}/100
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={gradeColor(r.grade)}>{r.grade}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand" /> Extracurricular
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {a.category} · {a.level} · {a.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          Powered by Awajimaa School Management System
        </p>
      </div>
    </div>
  );
}
