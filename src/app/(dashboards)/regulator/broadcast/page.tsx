"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { get, post } from "@/lib/api";
import toast from "react-hot-toast";
import { Send, Users, ChevronDown } from "lucide-react";

interface Lga {
  id: number;
  name: string;
  state_id: number;
}

interface BroadcastResponse {
  success: boolean;
  total_sent: number;
  total_found: number;
  message?: string;
}

const AUDIENCE_OPTIONS = [
  {
    value: "all_schools",
    label: "All Schools",
    description: "Every school in your jurisdiction",
  },
  {
    value: "registered_schools",
    label: "Registered Schools",
    description: "Only schools with approved registration",
  },
  {
    value: "unregistered_schools",
    label: "Unregistered Schools",
    description: "Schools without approved registration",
  },
  {
    value: "students",
    label: "Students",
    description: "All students in your jurisdiction",
  },
  {
    value: "teachers",
    label: "Teachers",
    description: "All teachers in your jurisdiction",
  },
  {
    value: "parents",
    label: "Parents",
    description: "All parents in your jurisdiction",
  },
  {
    value: "custom_lgas",
    label: "Custom (by LGA)",
    description: "Select specific LGAs to target",
  },
] as const;

type AudienceValue = (typeof AUDIENCE_OPTIONS)[number]["value"];

export default function BroadcastPage() {
  const [audience, setAudience] = useState<AudienceValue>("all_schools");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedLgas, setSelectedLgas] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<BroadcastResponse | null>(null);

  const { data: lgas } = useQuery<Lga[]>({
    queryKey: ["lgas"],
    queryFn: () => get<Lga[]>("/lgas").then((r) => r.data),
    enabled: audience === "custom_lgas",
  });

  const sendMutation = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        to: audience,
        subject,
        message,
      };
      if (audience === "custom_lgas") {
        body.lga_ids = selectedLgas;
      }
      return post<BroadcastResponse>("/regulator/broadcast", body).then(
        (r) => r.data,
      );
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast.success(
        `Broadcast sent to ${data.total_sent} of ${data.total_found} recipients.`,
      );
      setSubject("");
      setMessage("");
      setSelectedLgas([]);
    },
    onError: () => {
      toast.error("Failed to send broadcast. Please try again.");
    },
  });

  const toggleLga = (id: number) =>
    setSelectedLgas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canSend =
    subject.trim().length > 0 &&
    message.trim().length > 0 &&
    (audience !== "custom_lgas" || selectedLgas.length > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          <Send className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Broadcast Message
          </h1>
          <p className="text-sm text-gray-500">
            Send email messages to groups within your jurisdiction
          </p>
        </div>
      </div>

      {lastResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-800 dark:text-green-300">
              Last broadcast: sent to {lastResult.total_sent} of{" "}
              {lastResult.total_found} recipients
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Audience Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Target Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAudience(opt.value);
                  setSelectedLgas([]);
                }}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  audience === opt.value
                    ? "border-brand bg-brand/5 dark:bg-brand/10"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    audience === opt.value
                      ? "text-brand"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {opt.description}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Compose Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            {/* LGA multi-select */}
            {audience === "custom_lgas" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select LGAs <span className="text-red-500">*</span>
                </label>
                {lgas && lgas.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                    <div className="flex flex-wrap gap-1.5">
                      {lgas.map((lga) => (
                        <button
                          key={lga.id}
                          onClick={() => toggleLga(lga.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            selectedLgas.includes(lga.id)
                              ? "bg-brand text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {lga.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-sm text-gray-400">Loading LGAs…</p>
                  </div>
                )}
                {selectedLgas.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedLgas.length} LGA
                    {selectedLgas.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Important notice regarding school registration"
              />
            </div>

            {/* Message body */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Write your message here. Recipients will receive this as a plain-text email."
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                {message.length} characters
              </p>
            </div>

            {/* Summary line */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ChevronDown className="h-4 w-4" />
                <span>
                  Sending to:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.label}
                  </span>
                  {audience === "custom_lgas" && selectedLgas.length > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      ({selectedLgas.length} LGAs)
                    </span>
                  )}
                </span>
              </div>

              <Button
                onClick={() => sendMutation.mutate()}
                disabled={!canSend || sendMutation.isPending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sendMutation.isPending ? "Sending…" : "Send Broadcast"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
