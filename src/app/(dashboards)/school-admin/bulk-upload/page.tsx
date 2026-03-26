"use client";

import React, { useRef, useState } from "react";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useBulkUpload, UploadType } from "@/hooks/useBulkUpload";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TabDef {
  id: UploadType;
  label: string;
  icon: React.ReactNode;
  description: string;
  columns: string[];
  accent: string;
}

const TABS: TabDef[] = [
  {
    id: "teachers",
    label: "Teachers",
    icon: <Users className="h-4 w-4" />,
    description:
      "Upload teaching staff. Each teacher receives an email with their login credentials.",
    columns: ["name", "email", "phone", "gender", "date_of_birth", "address"],
    accent: "blue",
  },
  {
    id: "students",
    label: "Students",
    icon: <GraduationCap className="h-4 w-4" />,
    description:
      "Upload student records. A student profile is automatically created for each entry.",
    columns: ["name", "email", "phone", "gender", "date_of_birth", "address"],
    accent: "green",
  },
  {
    id: "admins",
    label: "Administrators",
    icon: <ShieldCheck className="h-4 w-4" />,
    description:
      "Upload school admin accounts. Roles are assigned by your school and cannot be changed by the users.",
    columns: ["name", "email", "phone", "gender", "date_of_birth", "address"],
    accent: "purple",
  },
];

const ACCENT_CLASSES: Record<string, Record<string, string>> = {
  blue: {
    tab: "border-blue-600 text-blue-600",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    drop: "border-blue-400 bg-blue-50 dark:bg-blue-900/10",
  },
  green: {
    tab: "border-green-600 text-green-600",
    icon: "bg-green-100 text-green-600 dark:bg-green-900/30",
    badge:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    drop: "border-green-400 bg-green-50 dark:bg-green-900/10",
  },
  purple: {
    tab: "border-purple-600 text-purple-600",
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
    badge:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
    drop: "border-purple-400 bg-purple-50 dark:bg-purple-900/10",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  isUploading,
  accent,
}: {
  onFile: (f: File) => void;
  isUploading: boolean;
  accent: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const ac = ACCENT_CLASSES[accent];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (
      ![
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ].includes(file.type) &&
      !/\.(xlsx|xls|csv)$/i.test(file.name)
    ) {
      return;
    }
    onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isUploading && inputRef.current?.click()}
      onKeyDown={(e) =>
        e.key === "Enter" && !isUploading && inputRef.current?.click()
      }
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={[
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
        dragging
          ? ac.drop
          : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50",
        isUploading ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <FileSpreadsheet className="h-10 w-10 text-gray-400" />
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Drag &amp; drop your file here, or{" "}
          <span className="underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Accepts .xlsx, .xls, or .csv — max 10 MB, up to 500 rows
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />
    </div>
  );
}

function ResultPanel({
  created,
  failed,
  failures,
}: {
  created: number;
  failed: number;
  failures: Array<{ row: number; email: string | null; error: string }>;
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {created > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {created} account{created !== 1 ? "s" : ""} created
            </span>
          </div>
        )}
        {failed > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 dark:bg-red-900/20">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              {failed} row{failed !== 1 ? "s" : ""} failed
            </span>
          </div>
        )}
      </div>

      {/* Failure details */}
      {failures.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
          <div className="flex items-center gap-2 border-b border-red-200 px-4 py-3 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
              Failed Rows
            </span>
          </div>
          <div className="divide-y divide-red-100 dark:divide-red-800">
            {failures.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="w-14 flex-shrink-0 font-mono text-xs text-gray-500">
                  Row {f.row}
                </span>
                {f.email && (
                  <span className="flex-shrink-0 font-medium text-gray-700 dark:text-gray-300">
                    {f.email}
                  </span>
                )}
                <span className="text-red-600 dark:text-red-400">
                  {f.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState<UploadType>("teachers");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { upload, downloadTemplate, isUploading, result, reset } =
    useBulkUpload();

  const tab = TABS.find((t) => t.id === activeTab)!;
  const ac = ACCENT_CLASSES[tab.accent];

  const handleFile = (file: File) => {
    reset();
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    await upload(activeTab, pendingFile);
    setPendingFile(null);
  };

  const handleTabChange = (id: UploadType) => {
    setActiveTab(id);
    setPendingFile(null);
    reset();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bulk User Upload
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Import Teachers, Students, or Administrators from an Excel or CSV
          file. Each user will receive a welcome email with their login
          credentials.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/10">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800 dark:text-amber-400">
          <strong>Role protection:</strong> Roles are assigned by this upload
          and <strong>cannot be changed by the users themselves</strong>. Only
          school admins can reassign roles.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={[
                "flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === t.id
                  ? ACCENT_CLASSES[t.accent].tab
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              ].join(" ")}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Instructions & template */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg p-2 ${ac.icon}`}>{tab.icon}</span>
                <CardTitle>Upload {tab.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {tab.description}
              </p>

              {/* Required columns */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Required columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {tab.columns.map((col) => (
                    <span
                      key={col}
                      className={`rounded-md border px-2 py-0.5 font-mono text-xs ${ac.badge}`}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => downloadTemplate(activeTab)}
                className="w-full"
              >
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {[
                  "Download the template CSV above.",
                  "Fill it in with user data (one row per person).",
                  "Upload the completed file here.",
                  "Each user gets an email with their username and a temporary password.",
                  "Users must change their password on first login.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right: Upload area */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropZone
                onFile={handleFile}
                isUploading={isUploading}
                accent={tab.accent}
              />

              {pendingFile && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {pendingFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(pendingFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPendingFile(null);
                      reset();
                    }}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={handleUpload}
                loading={isUploading}
                disabled={!pendingFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading…" : `Upload ${tab.label}`}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultPanel
                  created={result.created}
                  failed={result.failed}
                  failures={result.failures}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
