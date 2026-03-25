"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Search, Download, MapPin, AlertTriangle, X } from "lucide-react";
import { get } from "@/lib/api";
import toast from "react-hot-toast";

interface SchoolRow extends Record<string, unknown> {
  id: number;
  name: string;
  lga?: { id: number; name: string };
  town?: { id: number; name: string };
  type: string;
  ownership: string;
  is_active: boolean;
  reg_number?: string;
  email?: string;
  phone?: string;
}

const columns: Column<SchoolRow>[] = [
  {
    key: "name",
    header: "School Name",
    sortable: true,
    render: (r) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {r.name}
      </span>
    ),
  },
  {
    key: "lga",
    header: "LGA",
    sortable: true,
    render: (r) => r.lga?.name ?? "—",
  },
  {
    key: "town",
    header: "Town",
    render: (r) => r.town?.name ?? "—",
  },
  {
    key: "type",
    header: "Type",
    render: (r) => <Badge variant="blue">{r.type}</Badge>,
  },
  {
    key: "ownership",
    header: "Ownership",
    render: (r) => (
      <Badge
        variant={
          r.ownership === "public"
            ? "gray"
            : r.ownership === "mission"
              ? "purple"
              : "green"
        }
      >
        {r.ownership}
      </Badge>
    ),
  },
  {
    key: "is_active",
    header: "Status",
    render: (r) => (
      <Badge variant={r.is_active ? "green" : "yellow"}>
        {r.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  { key: "reg_number", header: "Reg. No.", render: (r) => r.reg_number ?? "—" },
];

export default function RegulatorSchoolsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );

  // Name clash checker state
  const [clashQuery, setClashQuery] = useState("");
  const [showClashModal, setShowClashModal] = useState(false);

  // Debounce search input
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(
      (
        handleSearchChange as unknown as {
          timer: ReturnType<typeof setTimeout>;
        }
      ).timer,
    );
    (
      handleSearchChange as unknown as { timer: ReturnType<typeof setTimeout> }
    ).timer = setTimeout(() => {
      setDebouncedSearch(val);
    }, 400);
  };

  const params: Record<string, string> = {};
  if (debouncedSearch) params.search = debouncedSearch;
  if (statusFilter) params.is_active = statusFilter === "active" ? "1" : "0";

  const schoolsQ = useQuery({
    queryKey: ["schools", params],
    queryFn: () =>
      get<{ data: SchoolRow[] }>(
        `/schools?${new URLSearchParams(params).toString()}`,
      ),
  });

  // Name clash query — only runs when showClashModal is true
  const clashQ = useQuery({
    queryKey: ["schools-clash", clashQuery],
    queryFn: () =>
      get<{ data: SchoolRow[] }>(
        `/schools?name_clash=${encodeURIComponent(clashQuery)}`,
      ),
    enabled: showClashModal && clashQuery.trim().length > 1,
  });

  const schools: SchoolRow[] =
    (schoolsQ.data?.data as unknown as { data: SchoolRow[] })?.data ?? [];
  const clashSchools: SchoolRow[] =
    (clashQ.data?.data as unknown as { data: SchoolRow[] })?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schools
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All schools under your regulatory jurisdiction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => setShowClashModal(true)}
          >
            Check Name Clash
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name, email, phone, or town…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            wrapperClassName="flex-1"
          />
          <select
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | "active" | "inactive")
            }
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      <Table
        keyField="id"
        columns={columns}
        data={schools}
        emptyMessage={schoolsQ.isLoading ? "Loading…" : "No schools found."}
        onRowClick={(row) => console.log("View school", row.id)}
      />

      {/* Name Clash Modal */}
      {showClashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                School Name Clash Checker
              </h2>
              <button
                onClick={() => {
                  setShowClashModal(false);
                  setClashQuery("");
                }}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500">
                Enter a school name to check whether a similar name already
                exists within your jurisdiction. This helps avoid naming
                conflicts.
              </p>
              <Input
                placeholder="Type school name to check…"
                leftIcon={<Search className="h-4 w-4" />}
                value={clashQuery}
                onChange={(e) => setClashQuery(e.target.value)}
              />
              {clashQ.isLoading && (
                <p className="text-sm text-gray-500">Checking…</p>
              )}
              {!clashQ.isLoading && clashSchools.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    {clashSchools.length} similar school name(s) found:
                  </p>
                  <ul className="space-y-1">
                    {clashSchools.map((s) => (
                      <li
                        key={s.id}
                        className="text-sm text-amber-700 dark:text-amber-400"
                      >
                        <span className="font-medium">{s.name}</span>
                        {s.lga && (
                          <span className="ml-2 text-xs">({s.lga.name})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!clashQ.isLoading &&
                clashQuery.trim().length > 1 &&
                clashSchools.length === 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      No existing schools match this name. The name appears to
                      be unique.
                    </p>
                  </div>
                )}
            </div>
            <div className="flex justify-end gap-2 border-t p-4 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowClashModal(false);
                  setClashQuery("");
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
