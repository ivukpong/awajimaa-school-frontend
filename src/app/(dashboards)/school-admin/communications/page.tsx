"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Radio } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Broadcast {
  id: number;
  title: string;
  body: string;
  audience: string[];
  channels: string[];
  status: "draft" | "sending" | "sent" | "failed";
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

interface BroadcastForm {
  title: string;
  body: string;
  audience: string[];
  channels: string[];
}

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone in School" },
  { value: "teacher", label: "Teachers" },
  { value: "parent", label: "Parents" },
  { value: "student", label: "Students" },
];

const CHANNEL_OPTIONS = [
  { value: "in_app", label: "In-App" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
];

const statusBadge: Record<string, "green" | "yellow" | "red" | "gray"> = {
  sent: "green",
  sending: "yellow",
  failed: "red",
  draft: "gray",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SchoolCommunicationsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<BroadcastForm>({
    title: "",
    body: "",
    audience: [],
    channels: [],
  });

  const { data: sentData, isLoading } = useQuery({
    queryKey: ["school", "broadcasts"],
    queryFn: () =>
      api.get<{ data: Broadcast[] }>("/school/broadcasts").then((r) => r.data),
  });

  const broadcasts: Broadcast[] = sentData?.data ?? [];

  const { mutate: sendBroadcast, isPending } = useMutation({
    mutationFn: (payload: BroadcastForm) =>
      api.post("/school/broadcasts", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Broadcast sent successfully");
      setForm({ title: "", body: "", audience: [], channels: [] });
      queryClient.invalidateQueries({ queryKey: ["school", "broadcasts"] });
    },
    onError: () => toast.error("Failed to send broadcast"),
  });

  function toggleValue(arr: string[], value: string): string[] {
    return arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.body.trim()) return toast.error("Message body is required");
    if (form.audience.length === 0)
      return toast.error("Select at least one audience");
    if (form.channels.length === 0)
      return toast.error("Select at least one channel");
    sendBroadcast(form);
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Radio className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Broadcast
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send messages to your school community via multiple channels
          </p>
        </div>
      </div>

      {/* Compose Form */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Broadcast</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Broadcast title..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows={5}
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                placeholder="Write your message here..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
              />
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audience
              </label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        audience: toggleValue(f.audience, opt.value),
                      }))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      form.audience.includes(opt.value)
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        channels: toggleValue(f.channels, opt.value),
                      }))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      form.channels.includes(opt.value)
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                {isPending ? "Sending…" : "Send Broadcast"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sent Broadcasts */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : broadcasts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No broadcasts sent yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Recipients</th>
                    <th className="pb-2 pr-4 font-medium">Delivered</th>
                    <th className="pb-2 font-medium">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b dark:border-gray-700 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {b.title}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadge[b.status] ?? "gray"}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {b.total_recipients ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {b.sent_count ?? 0} / {b.total_recipients ?? "—"}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(b.sent_at)}
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
