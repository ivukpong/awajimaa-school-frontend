"use client";

import Link from "next/link";
import { ChevronLeft, Award, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  useMyCertificates,
  type ElearningCertificate,
} from "@/hooks/useElearning";

export default function CertificatesPage() {
  const { data, isLoading } = useMyCertificates();
  const [search, setSearch] = useState("");

  const certs: ElearningCertificate[] = data?.data ?? [];
  const filtered = certs.filter(
    (c) =>
      c.certificate_number.toLowerCase().includes(search.toLowerCase()) ||
      c.issued_to?.toLowerCase().includes(search.toLowerCase()) ||
      c.program?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied");
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="../e-learning">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeft size={14} />}
            >
              Programs
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Certificates Issued
            </h1>
            <p className="text-sm text-gray-500">
              All completion certificates for your e-learning programs
            </p>
          </div>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────── */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by number, learner, or program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            {isLoading ? "Loading…" : `${filtered.length} certificates`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse py-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 dark:bg-gray-800 rounded"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              {search
                ? "No certificates match your search."
                : "No certificates issued yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-left text-xs text-gray-400">
                    <th className="pb-3 font-medium">Certificate No.</th>
                    <th className="pb-3 font-medium">Learner</th>
                    <th className="pb-3 font-medium">Program</th>
                    <th className="pb-3 font-medium">Issued</th>
                    <th className="pb-3 font-medium">Expires</th>
                    <th className="pb-3 font-medium">Verify Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filtered.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {cert.certificate_number}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="font-medium">
                          {cert.issued_to ?? cert.enrollment?.user?.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cert.enrollment?.user?.email}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="text-gray-700 dark:text-gray-300">
                          {cert.program?.name ??
                            cert.enrollment?.program?.name ??
                            "—"}
                        </p>
                      </td>
                      <td className="py-3 text-gray-500">
                        {cert.issued_at
                          ? new Date(cert.issued_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3">
                        {cert.expires_at ? (
                          <Badge
                            size="sm"
                            variant={
                              new Date(cert.expires_at) > new Date()
                                ? "blue"
                                : "red"
                            }
                          >
                            {new Date(cert.expires_at).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge size="sm" variant="green">
                            Lifetime
                          </Badge>
                        )}
                      </td>
                      <td className="py-3">
                        {cert.verification_url ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={cert.verification_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand hover:underline text-xs inline-flex items-center gap-1"
                            >
                              <ExternalLink size={11} /> Open
                            </a>
                            <button
                              onClick={() => copyLink(cert.verification_url!)}
                              className="text-gray-400 hover:text-gray-600 ml-1"
                              title="Copy link"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
