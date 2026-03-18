"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AffiliateDashboard {
  referral_code: string;
}

export default function AffiliateMessagesPage() {
  const [form, setForm] = useState({ recipient_email: "", message: "" });

  const { data } = useQuery<AffiliateDashboard>({
    queryKey: ["affiliate-dashboard"],
    queryFn: () =>
      get<AffiliateDashboard>("/affiliate/dashboard").then((r) => r.data),
  });

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${data?.referral_code ?? ""}`
      : "";

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: typeof form) =>
      post("/affiliate/send-referral", payload),
    onSuccess: () => {
      toast.success("Referral email sent!");
      setForm({ recipient_email: "", message: "" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to send email.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipient_email) {
      toast.error("Please enter a recipient email.");
      return;
    }
    mutate(form);
  }

  function insertLink() {
    setForm((prev) => ({
      ...prev,
      message: prev.message ? `${prev.message}\n${referralLink}` : referralLink,
    }));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Send Referral</h1>
        <p className="text-sm text-gray-500 mt-1">
          Invite schools to Awajimaa directly from your dashboard.
        </p>
      </div>

      {/* Referral link preview */}
      <Card>
        <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Your Referral Link
        </p>
        <div className="flex items-center gap-2">
          <p className="flex-1 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate text-gray-700">
            {referralLink || "Loading…"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast.success("Link copied!");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Compose form */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Compose Message
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="School Email Address"
            type="email"
            placeholder="admin@school.edu.ng"
            value={form.recipient_email}
            onChange={(e) =>
              setForm({ ...form, recipient_email: e.target.value })
            }
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Message{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <button
                type="button"
                onClick={insertLink}
                className="text-xs text-brand hover:underline flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Insert referral link
              </button>
            </div>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
              placeholder={`Hi there! I'd like to introduce you to Awajimaa — a powerful school management platform.\n\n${referralLink}`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">
              Your referral link will be appended automatically if left blank.
            </p>
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            <Send className="h-4 w-4 mr-2" />
            Send Referral Email
          </Button>
        </form>
      </Card>
    </div>
  );
}
