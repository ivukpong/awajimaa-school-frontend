"use client";
import React, { useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  useFreelancerProfile,
  useUploadTeacherDocument,
  useSendEmailOtp,
  useVerifyEmailOtp,
  useSendPhoneOtp,
  useVerifyPhoneOtp,
  useTeacherVerificationMessages,
  useTeacherReply,
} from "@/hooks/useFreelancer";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { TeacherVerificationStatus } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  TeacherVerificationStatus,
  {
    label: string;
    variant: "yellow" | "blue" | "green" | "red" | "purple" | "gray";
  }
> = {
  pending: { label: "Pending Review", variant: "yellow" },
  under_review: { label: "Under Review", variant: "blue" },
  approved: { label: "Approved", variant: "green" },
  declined: { label: "Declined", variant: "red" },
  more_info_requested: { label: "More Info Requested", variant: "purple" },
};

// ── OTP field ─────────────────────────────────────────────────────────────────

function OtpInput({
  onVerify,
  isPending,
}: {
  onVerify: (otp: string) => void;
  isPending: boolean;
}) {
  const [otp, setOtp] = useState("");
  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        maxLength={6}
        placeholder="6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        className="border rounded px-3 py-1.5 text-sm w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <button
        onClick={() => onVerify(otp)}
        disabled={otp.length !== 6 || isPending}
        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Verify
      </button>
    </div>
  );
}

// ── upload row ────────────────────────────────────────────────────────────────

function DocUploadRow({
  label,
  type,
  currentUrl,
  certLabel,
}: {
  label: string;
  type: "cv" | "trcn" | "nin_document" | "certificate";
  currentUrl?: string;
  certLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadTeacherDocument(type);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    if (type === "certificate" && certLabel) fd.append("label", certLabel);
    upload.mutate(fd, {
      onSuccess: () => toast.success(`${label} uploaded`),
      onError: () => toast.error(`Failed to upload ${label}`),
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-700">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </p>
        {currentUrl ? (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View uploaded file
          </a>
        ) : (
          <p className="text-xs text-gray-500">Not uploaded yet</p>
        )}
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded disabled:opacity-50"
      >
        <Upload size={14} />
        {upload.isPending ? "Uploading…" : currentUrl ? "Replace" : "Upload"}
      </button>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ── Certificate upload row ────────────────────────────────────────────────────

function CertificateUploadSection({
  certificates,
}: {
  certificates?: Array<{ label: string; url: string }>;
}) {
  const [label, setLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadTeacherDocument("certificate");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !label.trim()) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("label", label.trim());
    upload.mutate(fd, {
      onSuccess: () => {
        toast.success("Certificate uploaded");
        setLabel("");
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: () => toast.error("Failed to upload certificate"),
    });
  };

  return (
    <div>
      {(certificates ?? []).map((c) => (
        <div
          key={c.url}
          className="flex items-center justify-between py-2 border-b dark:border-gray-700 text-sm"
        >
          <span className="text-gray-800 dark:text-gray-200">{c.label}</span>
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
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Certificate label (e.g. B.Ed Mathematics)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!label.trim() || upload.isPending}
          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload size={14} />
          {upload.isPending ? "Uploading…" : "Add Certificate"}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherKycPage() {
  const { data: profileRes } = useFreelancerProfile();
  const { data: messagesRes } = useTeacherVerificationMessages();
  const profile = profileRes?.data;

  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();
  const sendPhoneOtp = useSendPhoneOtp();
  const verifyPhoneOtp = useVerifyPhoneOtp();
  const teacherReply = useTeacherReply();

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [replyText, setReplyText] = useState("");

  const verificationStatus: TeacherVerificationStatus =
    profile?.verification_status ?? "pending";
  const statusInfo = STATUS_BADGE[verificationStatus];

  const messages = messagesRes?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          KYC &amp; Verification
        </h1>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {verificationStatus === "declined" && profile?.admin_notes && (
        <div className="flex gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-sm text-red-800 dark:text-red-300">
          <XCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Your application was declined</p>
            <p className="mt-1">{profile.admin_notes}</p>
          </div>
        </div>
      )}

      {verificationStatus === "more_info_requested" && (
        <div className="flex gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-sm text-purple-800 dark:text-purple-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            The admin has requested more information. Please check the messages
            section below and reply.
          </p>
        </div>
      )}

      {/* ── Contact Verification ── */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Email Address
              </p>
              <p className="text-xs text-gray-500">
                {profileRes?.data?.user?.email ?? "—"}
              </p>
            </div>
            {/* We rely on the user's email_verified_at from the auth user object;
                expose it through profile.user if needed */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={14} /> Verified
              </span>
              {!showEmailOtp && (
                <button
                  onClick={() => {
                    sendEmailOtp.mutate(undefined, {
                      onSuccess: () => setShowEmailOtp(true),
                      onError: (e: unknown) =>
                        toast.error(
                          (e as Error)?.message ?? "Failed to send OTP",
                        ),
                    });
                  }}
                  disabled={sendEmailOtp.isPending}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Re-verify
                </button>
              )}
            </div>
          </div>
          {showEmailOtp && (
            <OtpInput
              isPending={verifyEmailOtp.isPending}
              onVerify={(otp) =>
                verifyEmailOtp.mutate(otp, {
                  onSuccess: () => {
                    toast.success("Email verified!");
                    setShowEmailOtp(false);
                  },
                  onError: () => toast.error("Invalid or expired OTP"),
                })
              }
            />
          )}

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t dark:border-gray-700">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Phone Number
              </p>
              <p className="text-xs text-gray-500">
                Verify your phone number via OTP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-yellow-600">
                <Clock size={14} /> Not verified
              </span>
              {!showPhoneOtp && (
                <button
                  onClick={() => {
                    sendPhoneOtp.mutate(undefined, {
                      onSuccess: () => setShowPhoneOtp(true),
                      onError: () => toast.error("Failed to send OTP"),
                    });
                  }}
                  disabled={sendPhoneOtp.isPending}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {sendPhoneOtp.isPending ? "Sending…" : "Send OTP"}
                </button>
              )}
            </div>
          </div>
          {showPhoneOtp && (
            <OtpInput
              isPending={verifyPhoneOtp.isPending}
              onVerify={(otp) =>
                verifyPhoneOtp.mutate(otp, {
                  onSuccess: () => {
                    toast.success("Phone verified!");
                    setShowPhoneOtp(false);
                  },
                  onError: () => toast.error("Invalid or expired OTP"),
                })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* ── Document Uploads ── */}
      <Card>
        <CardHeader>
          <CardTitle>Document Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <DocUploadRow
            label="Curriculum Vitae (CV)"
            type="cv"
            currentUrl={profile?.cv_url}
          />
          <DocUploadRow
            label="TRCN Certificate"
            type="trcn"
            currentUrl={profile?.trcn_url}
          />
          <DocUploadRow
            label="NIN Document"
            type="nin_document"
            currentUrl={profile?.nin_document_url}
          />
          <div className="pt-3">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Academic Certificates
            </p>
            <CertificateUploadSection certificates={profile?.certificates} />
          </div>
        </CardContent>
      </Card>

      {/* ── Message Thread ── */}
      <Card>
        <CardHeader>
          <CardTitle>Messages from Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                    {msg.is_from_admin ? "Admin" : "You"}
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

          <div className="pt-2 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to admin…"
              rows={3}
              className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
            <button
              onClick={() => {
                if (!replyText.trim()) return;
                teacherReply.mutate(replyText.trim(), {
                  onSuccess: () => {
                    toast.success("Reply sent");
                    setReplyText("");
                  },
                  onError: () => toast.error("Failed to send reply"),
                });
              }}
              disabled={!replyText.trim() || teacherReply.isPending}
              className="flex items-center gap-1 self-end bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
