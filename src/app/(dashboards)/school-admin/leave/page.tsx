"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useLeave } from "@/hooks/useHR";
import type { LeaveRequest } from "@/types/hr";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
};

export default function LeaveManagementPage() {
  const { leaveTypes, requests, loading, approveLeave, rejectLeave } =
    useLeave();
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const rows = (requests?.data ?? []).filter(
    (r) => r.teacher_profile?.staff_id?.toLowerCase().includes(search.toLowerCase()) ?? true,
  );

  const handleApprove = async (id: number) => {
    try {
      await approveLeave(id);
      toast.success("Leave approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectNote) return toast.error("Please provide a reason");
    try {
      await rejectLeave(rejectModal.id, rejectNote);
      toast.success("Leave rejected");
      setRejectModal(null);
      setRejectNote("");
    } catch {
      toast.error("Failed");
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: "teacher_profile_id" as keyof LeaveRequest,
      header: "Staff",
      render: (r) => <span className="font-medium">{r.teacher_profile?.staff_id}</span>,
    },
    {
      key: "leave_type_id",
      header: "Leave Type",
      render: (r) => (
        <span>
          {leaveTypes.find((t) => t.id === r.leave_type_id)?.name ?? "—"}
        </span>
      ),
    },
    { key: "start_date", header: "Start" },
    { key: "end_date", header: "End" },
    { key: "total_days", header: "Days" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (r) => (
        <span className="text-sm text-gray-500 truncate max-w-[200px] block">
          {r.reason}
        </span>
      ),
    },
    {
      key: "id" as keyof LeaveRequest,
      header: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => handleApprove(r.id)}>
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setRejectModal({ id: r.id })}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leave Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve staff leave requests
        </p>
      </div>

      {/* Summary by type */}
      {leaveTypes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {leaveTypes.map((t) => (
            <Card key={t.id} className="border">
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Max {t.days_allowed} days/year
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <Input
            placeholder="Search staff…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={rows as unknown as (LeaveRequest & Record<string, unknown>)[]}
            loading={loading}
          />
        </CardContent>
      </Card>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Reject Leave Request</h2>
            <div>
              <label className="text-sm font-medium">Reason *</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Explain reason for rejection…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
