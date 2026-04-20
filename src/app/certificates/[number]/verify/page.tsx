"use client";

import { useParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Award,
  GraduationCap,
  Calendar,
  Copy,
} from "lucide-react";
import { useVerifyCertificate } from "@/hooks/useElearning";
import toast from "react-hot-toast";

export default function CertificateVerifyPage() {
  const params = useParams<{ number: string }>();
  const certNumber = params.number;

  const { data, isLoading, isError } = useVerifyCertificate(certNumber);
  const cert = data?.data;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Verification link copied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ── Loading ──────────────────────────────────── */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-gray-500">Verifying certificate…</p>
          </div>
        )}

        {/* ── Invalid / error ──────────────────────────── */}
        {(isError || (!isLoading && !cert)) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Certificate Not Found
            </h1>
            <p className="text-gray-500 text-sm max-w-xs">
              The certificate number{" "}
              <span className="font-mono font-semibold">{certNumber}</span>{" "}
              could not be verified. It may be invalid or has been revoked.
            </p>
          </div>
        )}

        {/* ── Valid certificate ────────────────────────── */}
        {!isLoading && cert && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Top accent */}
            <div className="h-2 bg-gradient-to-r from-brand to-purple-500" />

            <div className="p-8">
              {/* Status badge */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle size={16} />
                  Certificate Verified
                </div>
              </div>

              {/* Award icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award size={36} className="text-white" />
                </div>
              </div>

              {/* Issued to */}
              <div className="text-center mb-8">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                  This certifies that
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cert.issued_to ?? cert.enrollment?.user?.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  has successfully completed
                </p>
                <h3 className="text-lg font-semibold text-brand mt-1">
                  {cert.program?.name ?? cert.enrollment?.program?.name}
                </h3>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar size={12} />
                    Issued On
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {cert.issued_at
                      ? new Date(cert.issued_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar size={12} />
                    {cert.expires_at ? "Expires" : "Valid Until"}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {cert.expires_at
                      ? new Date(cert.expires_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Lifetime"}
                  </p>
                </div>
              </div>

              {/* Certificate number */}
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 text-center mb-6">
                <p className="text-xs text-gray-400 mb-1">Certificate Number</p>
                <p className="font-mono font-bold text-gray-800 dark:text-gray-200 text-sm tracking-widest">
                  {cert.certificate_number}
                </p>
              </div>

              {/* School */}
              {(cert.program?.school_name ||
                cert.enrollment?.program?.school_name) && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                  <GraduationCap size={15} />
                  <span>
                    Issued by:{" "}
                    {cert.program?.school_name ??
                      cert.enrollment?.program?.school_name}
                  </span>
                </div>
              )}

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <Copy size={13} />
                Copy verification link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
