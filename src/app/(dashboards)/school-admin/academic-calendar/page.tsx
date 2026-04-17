"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Download, CalendarDays } from "lucide-react";
import {
  useAcademicCalendars,
  type AcademicCalendar,
} from "@/hooks/useRegulatoryResources";

interface CalendarRow extends AcademicCalendar, Record<string, unknown> {}

const TERM_LABELS: Record<string, string> = {
  first: "First Term",
  second: "Second Term",
  third: "Third Term",
  full_year: "Full Year",
};

export default function SchoolAcademicCalendarPage() {
  const [search, setSearch] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (session) params.academic_session = session;
  if (term) params.term = term;

  const { data, isLoading } = useAcademicCalendars(params);
  const rows = (data?.data ?? []) as CalendarRow[];

  const columns: Column<CalendarRow>[] = [
    {
      key: "title",
      header: "Calendar",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
          {r.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "academic_session",
      header: "Session",
      render: (r) => (
        <span className="text-sm">{r.academic_session ?? "—"}</span>
      ),
    },
    {
      key: "term",
      header: "Term",
      render: (r) => (
        <Badge variant="blue">
          {TERM_LABELS[r.term ?? ""] ?? r.term ?? "—"}
        </Badge>
      ),
    },
    {
      key: "dates",
      header: "Period",
      render: (r) => {
        if (!r.start_date && !r.end_date)
          return <span className="text-gray-400">—</span>;
        const fmt = (d?: string) =>
          d
            ? new Date(d).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {fmt(r.start_date)} {r.end_date ? `– ${fmt(r.end_date)}` : ""}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.file_url ? (
          <a
            href={r.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-indigo-600" /> Academic Calendar
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Official academic calendars published for your state. Download the
          full calendar below.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search calendar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Input
          placeholder="Academic session (e.g. 2025/2026)"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="w-56"
        />
        <select
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option value="">All Terms</option>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
          <option value="full_year">Full Year</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns} data={rows} loading={isLoading} keyField="id" />
        </CardContent>
      </Card>

      {!isLoading && rows.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            No academic calendars have been published for your school yet.
          </p>
        </div>
      )}
    </div>
  );
}
