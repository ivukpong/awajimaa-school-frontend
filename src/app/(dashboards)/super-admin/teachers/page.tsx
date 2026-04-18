"use client";
import React, { useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import {
  useTeacherVerifications,
  useTeacherVerificationDetail,
  useApproveTeacher,
  useDeclineTeacher,
  useRequestMoreInfo,
  useAdminTeacherMessages,
  useSendAdminMessage,
} from "@/hooks/useFreelancer";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { TeacherVerificationStatus, FreelancerProfile } from "@/types";

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_FILTER_TABS: {
  key: TeacherVerificationStatus | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
  { key: "more_info_requested", label: "More Info" },
];

const STATUS_BADGE: Record<
  TeacherVerificationStatus,
  {
    label: string;
    variant: "green" | "blue" | "yellow" | "red" | "gray" | "purple";
  }
> = {
  pending: { label: "Pending", variant: "yellow" },
  under_review: { label: "Under Review", variant: "blue" },
  approved: { label: "Approved", variant: "green" },
  declined: { label: "Declined", variant: "red" },
  more_info_requested: { label: "More Info", variant: "purple" },
};

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function DetailDrawer({
  profileId,
  onClose,
}: {
  profileId: number;
  onClose: () => void;
}) {
  const { data, isLoading } = useTeacherVerificationDetail(profileId);
  const { data: msgsRes } = useAdminTeacherMessages(profileId);
  const approve = useApproveTeacher();
  const decline = useDeclineTeacher();
  const requestInfo = useRequestMoreInfo();
  const sendMsg = useSendAdminMessage(profileId);

  const [declineReason, setDeclineReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [msgText, setMsgText] = useState("");
  const [panel, setPanel] = useState<
    "detail" | "decline" | "request_info" | "messages"
  >("detail");

  const profile = data?.data as FreelancerProfile & {
    user?: { id: number; name: string; email: string };
  };
  const messages = msgsRes?.data?.data ?? [];

  if (isLoading || !profile) {
    return (
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-gray-800 shadow-xl z-50 p-6 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading…</span>
      </div>
    );
  }

  const st = STATUS_BADGE[profile.verification_status ?? "pending"];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {profile.user?.name}
          </h2>
          <p className="text-xs text-gray-500">{profile.user?.email}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 px-4 pt-3 border-b dark:border-gray-700">
        {(["detail", "messages", "decline", "request_info"] as const).map(
          (p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`px-3 py-1.5 text-xs rounded-t font-medium border-b-2 transition-colors ${
                panel === p
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              {p === "detail"
                ? "Details"
                : p === "messages"
                  ? "Messages"
                  : p === "decline"
                    ? "Decline"
                    : "Request Info"}
            </button>
          ),
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── Details panel ── */}
        {panel === "detail" && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={st.variant}>{st.label}</Badge>
              {profile.verified_at && (
                <span className="text-xs text-gray-500">
                  on {formatDate(profile.verified_at)}
                </span>
              )}
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Documents
              </h3>
              {[
                { label: "CV", url: profile.cv_url },
                { label: "TRCN Certificate", url: profile.trcn_url },
                { label: "NIN Document", url: profile.nin_document_url },
              ].map(({ label, url }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Not uploaded
                    </span>
                  )}
                </div>
              ))}
              {(profile.certificates ?? []).map((c) => (
                <div
                  key={c.url}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {c.label}
                  </span>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>

            {profile.admin_notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Admin Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.admin_notes}
                </p>
              </div>
            )}

            {/* Approve */}
            {profile.verification_status !== "approved" && (
              <button
                onClick={() =>
                  approve.mutate(
                    { id: profile.id! },
                    {
                      onSuccess: () => {
                        toast.success("Teacher approved");
                        onClose();
                      },
                      onError: () => toast.error("Failed to approve"),
                    },
                  )
                }
                disabled={approve.isPending}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {approve.isPending ? "Approving…" : "Approve Teacher"}
              </button>
            )}
          </>
        )}

        {/* ── Decline panel ── */}
        {panel === "decline" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <XCircle size={16} /> Decline Application
            </div>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Provide a reason for declining…"
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
            <button
              onClick={() =>
                decline.mutate(
                  { id: profile.id!, reason: declineReason.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Application declined");
                      onClose();
                    },
                    onError: () => toast.error("Failed to decline"),
                  },
                )
              }
              disabled={!declineReason.trim() || decline.isPending}
              className="w-full bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {decline.isPending ? "Declining…" : "Confirm Decline"}
            </button>
          </div>
        )}

        {/* ── Request Info panel ── */}
        {panel === "request_info" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
              <AlertTriangle size={16} /> Request More Information
            </div>
            <textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="Describe what additional information or documents are needed…"
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
            <button
              onClick={() =>
                requestInfo.mutate(
                  { id: profile.id!, message: infoMessage.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Request sent to teacher");
                      onClose();
                    },
                    onError: () => toast.error("Failed to send request"),
                  },
                )
              }
              disabled={!infoMessage.trim() || requestInfo.isPending}
              className="w-full bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {requestInfo.isPending ? "Sending…" : "Send Request"}
            </button>
          </div>
        )}

        {/* ── Messages panel ── */}
        {panel === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.is_from_admin
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 ml-8"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
                      {msg.is_from_admin
                        ? "Admin"
                        : (profile.user?.name ?? "Teacher")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">
                    {msg.message}
                  </p>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-2">
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Send a message to this teacher…"
                rows={3}
                className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              />
              <button
                onClick={() =>
                  sendMsg.mutate(msgText.trim(), {
                    onSuccess: () => {
                      toast.success("Message sent");
                      setMsgText("");
                    },
                    onError: () => toast.error("Failed to send message"),
                  })
                }
                disabled={!msgText.trim() || sendMsg.isPending}
                className="self-end bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Table row type ────────────────────────────────────────────────────────────

type ProfileRow = FreelancerProfile & {
  user?: { id: number; name: string; email: string };
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherVerificationsPage() {
  const [statusFilter, setStatusFilter] = useState<
    TeacherVerificationStatus | "all"
  >("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useTeacherVerifications({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const profiles: ProfileRow[] = data?.data?.data ?? [];

  const columns: Column<ProfileRow>[] = [
    {
      key: "user",
      header: "Teacher",
      render: (row) => (
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            {row.user?.name ?? "—"}
          </p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "qualification",
      header: "Qualification",
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.qualification ?? <span className="italic text-gray-400">—</span>}
        </span>
      ),
    },
    {
      key: "documents",
      header: "Documents",
      render: (row) => (
        <div className="flex gap-2 flex-wrap text-xs">
          {row.cv_url && (
            <a
              href={row.cv_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              CV
            </a>
          )}
          {row.trcn_url && (
            <a
              href={row.trcn_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              TRCN
            </a>
          )}
          {row.nin_document_url && (
            <a
              href={row.nin_document_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              NIN
            </a>
          )}
          {!row.cv_url && !row.trcn_url && !row.nin_document_url && (
            <span className="italic text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      key: "verification_status",
      header: "Status",
      render: (row) => {
        const s = STATUS_BADGE[row.verification_status ?? "pending"];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          onClick={() => setSelectedId(row.id!)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Eye size={13} /> Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Teacher Verifications
      </h1>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b dark:border-gray-700 flex-wrap">
        {STATUS_FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : profiles.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No teacher applications found.
            </div>
          ) : (
            <Table columns={columns} data={profiles} keyField="id" />
          )}
        </CardContent>
      </Card>

      {/* Drawer */}
      {selectedId !== null && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedId(null)}
          />
          <DetailDrawer
            profileId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        </>
      )}
    </div>
  );
}
