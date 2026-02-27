"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Send, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Message {
  id: number;
  subject?: string;
  body: string;
  created_at: string;
  is_read: boolean;
  sender?: { name: string };
  recipient?: { name: string };
  type: "inbox" | "sent";
}

export default function SchoolAdminMessagesPage() {
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [compose, setCompose] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["messages", tab],
    queryFn: () =>
      get<any>(`/messages?type=${tab}`).then(
        (r) => r.data?.data ?? r.data ?? [],
      ),
  });
  const messages: Message[] = Array.isArray(data) ? data : [];
  const filtered = messages.filter(
    (m) =>
      (m.subject ?? "No subject")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (m.sender?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const sendMutation = useMutation({
    mutationFn: () => post("/messages", form),
    onSuccess: () => {
      toast.success("Message sent");
      setCompose(false);
      setForm({ to: "", subject: "", body: "" });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Failed to send"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <p className="text-sm text-gray-500">
            Staff &amp; parent communications
          </p>
        </div>
        <Button
          onClick={() => setCompose(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Compose
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[60vh]">
        {/* Sidebar */}
        <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(["inbox", "sent"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? "bg-brand text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <p className="text-center text-gray-400 py-6 text-sm">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">
                No messages
              </p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selected?.id === m.id ? "bg-brand/5" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${!m.is_read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {m.sender?.name ?? "You"}
                    </span>
                    {!m.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {m.subject ?? "No subject"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col">
          {compose ? (
            <div className="flex-1 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                New Message
              </h2>
              <Input
                placeholder="To (name / email)"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
              <Input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                placeholder="Body…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full flex-1 min-h-[150px] rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => sendMutation.mutate()}
                  leftIcon={<Send className="h-4 w-4" />}
                  isLoading={sendMutation.isPending}
                >
                  Send
                </Button>
                <Button variant="outline" onClick={() => setCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : selected ? (
            <div className="flex-1 p-6">
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {selected.subject ?? "No subject"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  From: {selected.sender?.name ?? "You"} ·{" "}
                  {new Date(selected.created_at).toLocaleString("en-NG")}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {selected.body}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
