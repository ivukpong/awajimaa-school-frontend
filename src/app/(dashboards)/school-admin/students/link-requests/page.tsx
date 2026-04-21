"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { CheckCircle2, XCircle, UserSearch, X, Filter } from "lucide-react";
import { get, post } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useStudents, type Student } from "@/hooks/useStudents";

interface LinkRequest {
  id: number;
  school_id: number;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  admin_note: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  student?: { id: number; admission_number: string } | null;
}

interface RequestsResponse {
  data: { data: LinkRequest[]; meta: any };
}

const STATUS_VARIANTS: Record<
  string,
  "warning" | "success" | "destructive" | "gray"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

// ── Approve modal ─────────────────────────────────────────────────────────────
function ApproveModal({
  request,
  students,
  onClose,
  onSuccess,
}: {
  request: LinkRequest;
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [search, setSearch] = useState("");

  const approve = useMutation({
    mutationFn: () =>
      post(`/school/link-requests/${request.id}/approve`, {
        student_id: studentId ? Number(studentId) : undefined,
        admin_note: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Request approved. Student linked!");
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to approve request.");
    },
  });

  const filtered = students.filter(
    (s) =>
      !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Approve Link Request
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 mb-4 text-sm space-y-1">
          <p>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Student:
            </span>{" "}
            {request.user.name}
          </p>
          <p>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Email:
            </span>{" "}
            {request.user.email}
          </p>
          {request.message && (
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Message:
              </span>{" "}
              {request.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Link to existing student record (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link to existing student record{" "}
              <span className="text-gray-400">
                (optional – leave blank to create new)
              </span>
            </label>
            <Input
              placeholder="Search by name or reg. number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
            >
              <option value="">— Create new student record —</option>
              {filtered.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} — {s.admission_number}
                </option>
              ))}
            </select>
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-gray-400"
              placeholder="Internal note for this approval…"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            loading={approve.isPending}
            onClick={() => approve.mutate()}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({
  request,
  onClose,
  onSuccess,
}: {
  request: LinkRequest;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [adminNote, setAdminNote] = useState("");

  const reject = useMutation({
    mutationFn: () =>
      post(`/school/link-requests/${request.id}/reject`, {
        admin_note: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Request rejected.");
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to reject request.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reject Link Request
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Rejecting request from{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {request.user.name}
          </span>
        </p>

        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-gray-400"
          placeholder="Reason for rejection (optional, visible to student)…"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          maxLength={500}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            leftIcon={<XCircle className="h-4 w-4" />}
            loading={reject.isPending}
            onClick={() => reject.mutate()}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LinkRequestsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [approveTarget, setApproveTarget] = useState<LinkRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LinkRequest | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["school-link-requests", statusFilter],
    queryFn: () =>
      get<RequestsResponse["data"]>(
        `/school/link-requests?status=${statusFilter}&per_page=50`,
      ),
    enabled: !!user?.school_id,
  });

  const { data: studentsData } = useStudents({});
  const students: Student[] = studentsData?.data?.data ?? [];

  const requests: LinkRequest[] = (data as any)?.data ?? [];

  const onMutated = () => {
    qc.invalidateQueries({ queryKey: ["school-link-requests"] });
  };

  const columns: Column<LinkRequest>[] = [
    {
      key: "user",
      header: "Student",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {r.user.name}
          </p>
          <p className="text-xs text-gray-500">{r.user.email}</p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (r) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {r.message ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={STATUS_VARIANTS[r.status] ?? "gray"}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (r) => (
        <span className="text-xs text-gray-500">
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              onClick={() => setApproveTarget(r)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<XCircle className="h-3.5 w-3.5" />}
              onClick={() => setRejectTarget(r)}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserSearch className="h-6 w-6 text-brand" />
            Student Link Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Students requesting to be linked to your school account.
          </p>
        </div>
      </div>

      {/* Status filter */}
      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          {["pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-brand text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      <Table
        keyField="id"
        columns={columns}
        data={requests}
        loading={isLoading}
        emptyMessage={`No ${statusFilter} requests.`}
      />

      {approveTarget && (
        <ApproveModal
          request={approveTarget}
          students={students}
          onClose={() => setApproveTarget(null)}
          onSuccess={onMutated}
        />
      )}

      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={onMutated}
        />
      )}
    </div>
  );
}
