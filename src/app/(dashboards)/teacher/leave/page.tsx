"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useLeave } from "@/hooks/useHR";
import type { LeaveRequest } from "@/types/hr";
import { Plus, CalendarOff } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "gray" | "yellow" | "green" | "red"> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
};

export default function TeacherLeavePage() {
  const { leaveTypes, requests, loading, applyLeave, cancelLeave } = useLeave();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const myRequests = requests?.data ?? [];

  const handleApply = async () => {
    if (!form.leave_type_id || !form.start_date || !form.end_date)
      return toast.error("All fields required");
    setSaving(true);
    try {
      await applyLeave({ ...form, leave_type_id: Number(form.leave_type_id) });
      toast.success("Leave application submitted");
      setShowModal(false);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this leave request?")) return;
    try {
      await cancelLeave(id);
      toast.success("Request cancelled");
    } catch {
      toast.error("Could not cancel");
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: "leave_type_id",
      header: "Type",
      render: (r) =>
        leaveTypes.find((t) => t.id === r.leave_type_id)?.name ?? "—",
    },
    { key: "start_date", header: "From" },
    { key: "end_date", header: "To" },
    { key: "total_days", header: "Days" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "reviewer_notes",
      header: "Reviewer Note",
      render: (r) => (
        <span className="text-sm text-gray-500">{r.reviewer_notes ?? "—"}</span>
      ),
    },
    {
      key: "id" as keyof LeaveRequest,
      header: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <Button size="sm" variant="danger" onClick={() => handleCancel(r.id)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

  // Leave type quota summary
  const leaveBalance = leaveTypes.map((t) => ({
    type: t,
    used: myRequests
      .filter((r) => r.leave_type_id === t.id && r.status === "approved")
      .reduce((a, r) => a + r.total_days, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply for leave and view your history
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance */}
      {leaveBalance.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {leaveBalance.map(({ type, used }) => (
            <Card key={type.id} className="border">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1 mb-1">
                  <CalendarOff className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-sm font-medium">{type.name}</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {type.max_days_per_year - used}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    days left
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {used} used of {type.max_days_per_year}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">My Leave History</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={
              myRequests as unknown as (LeaveRequest &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Apply for Leave</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Leave Type *</label>
                <select
                  value={form.leave_type_id}
                  onChange={(e) =>
                    setForm({ ...form, leave_type_id: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select type…</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date *</label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Reason for leave…"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={saving}>
                {saving ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
