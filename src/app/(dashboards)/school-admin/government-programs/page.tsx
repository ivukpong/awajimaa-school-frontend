"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { useGovernmentPrograms } from "@/hooks/useGovernment";
import type { GovernmentProgram, ProgramApplication } from "@/types/government";
import { Globe, Plus } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  submitted: "yellow",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  disbursed: "green",
};

export default function SchoolAdminGovernmentProgramsPage() {
  const { programs, myApplications, loading, applyToProgram } =
    useGovernmentPrograms({ status: "published" });
  const [applying, setApplying] = useState<GovernmentProgram | null>(null);
  const [appForm, setAppForm] = useState({
    proposal: "",
    requested_amount: "",
  });
  const [saving, setSaving] = useState(false);

  const handleApply = async () => {
    if (!applying) return;
    setSaving(true);
    try {
      await applyToProgram(applying.id, {
        proposal: appForm.proposal,
        requested_amount: Number(appForm.requested_amount) || undefined,
      });
      toast.success("Application submitted");
      setApplying(null);
    } catch {
      toast.error("Application failed");
    } finally {
      setSaving(false);
    }
  };

  const programColumns: Column<GovernmentProgram>[] = [
    {
      key: "title",
      header: "Program",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <Badge variant="blue">{r.category}</Badge>,
    },
    {
      key: "budget",
      header: "Amount",
      render: (r) => (r.budget ? `₦${Number(r.budget).toLocaleString()}` : "—"),
    },
    { key: "application_deadline", header: "Deadline" },
    {
      key: "id" as keyof GovernmentProgram,
      header: "Actions",
      render: (r) => (
        <Button
          size="sm"
          onClick={() => {
            setApplying(r);
            setAppForm({ proposal: "", requested_amount: "" });
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Apply
        </Button>
      ),
    },
  ];

  const appColumns: Column<ProgramApplication>[] = [
    {
      key: "government_program_id",
      header: "Program",
      render: (r) => (
        <span className="font-medium">
          {r.program?.title ?? r.government_program_id}
        </span>
      ),
    },
    {
      key: "requested_amount",
      header: "Requested",
      render: (r) =>
        r.requested_amount
          ? `₦${Number(r.requested_amount).toLocaleString()}`
          : "—",
    },
    {
      key: "amount_disbursed",
      header: "Disbursed",
      render: (r) =>
        r.amount_disbursed ? (
          <span className="text-green-600 font-semibold">
            ₦{Number(r.amount_disbursed).toLocaleString()}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Government Programs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse and apply for available government programs
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">Available Programs</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={programColumns}
            data={
              (programs?.data ?? []) as unknown as (GovernmentProgram &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">My Applications</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={appColumns}
            data={
              (myApplications?.data ?? []) as unknown as (ProgramApplication &
                Record<string, unknown>)[]
            }
          />
        </CardContent>
      </Card>

      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Apply — {applying.title}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Proposal</label>
                <textarea
                  value={appForm.proposal}
                  onChange={(e) =>
                    setAppForm({ ...appForm, proposal: e.target.value })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Describe how your school will use this program…"
                />
              </div>
              {applying.budget && (
                <div>
                  <label className="text-sm font-medium">
                    Requested Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={appForm.requested_amount}
                    onChange={(e) =>
                      setAppForm({
                        ...appForm,
                        requested_amount: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setApplying(null)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={saving}>
                {saving ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
