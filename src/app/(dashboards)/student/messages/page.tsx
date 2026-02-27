"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Send, MessageSquare, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  id: number;
  subject?: string;
  body: string;
  sender?: { name: string };
  read_at?: string;
  created_at: string;
}

export default function StudentMessagesPage() {
  const qc = useQueryClient();
  const [compose, setCompose] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      get<any>("/messages").then((r) => r.data?.data ?? r.data ?? []),
  });
  const messages: Message[] = Array.isArray(data) ? data : [];

  const sendMutation = useMutation({
    mutationFn: (payload: any) => post("/messages", payload),
    onSuccess: () => {
      toast.success("Message sent");
      qc.invalidateQueries({ queryKey: ["messages"] });
      setCompose(false);
    },
    onError: () => toast.error("Failed to send message"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <Button
          onClick={() => setCompose(true)}
          leftIcon={<Send className="h-4 w-4" />}
        >
          Compose
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card padding={false} className="md:col-span-1">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Inbox ({messages.length})
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <p className="p-4 text-sm text-gray-400">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">
                No messages yet.
              </p>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selected?.id === m.id ? "bg-brand/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!m.read_at && (
                      <Circle className="h-2 w-2 text-brand fill-brand mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate ${!m.read_at ? "font-semibold" : ""} text-gray-900 dark:text-white`}
                      >
                        {m.sender?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {m.subject ?? m.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(m.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
        <Card className="md:col-span-2">
          {selected ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {selected.subject ?? "(No subject)"}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>
                  From: <strong>{selected.sender?.name}</strong>
                </span>
                <span>·</span>
                <span>{formatDate(selected.created_at)}</span>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {selected.body}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <MessageSquare className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </Card>
      </div>
      {compose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCompose(false)}
          />
          <Card className="relative w-full max-w-md mx-4 z-10">
            <CardHeader>
              <CardTitle>New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  sendMutation.mutate(Object.fromEntries(fd));
                }}
                className="space-y-4"
              >
                <Input
                  label="To (User ID)"
                  name="receiver_id"
                  type="number"
                  required
                />
                <Input label="Subject" name="subject" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCompose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={sendMutation.isPending}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
