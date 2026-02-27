"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Message {
  id: number;
  subject?: string;
  body: string;
  sender: { name: string; id: number };
  is_read: boolean;
  created_at: string;
  replies?: Message[];
}

export default function ParentMessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [compose, setCompose] = useState(false);
  const [newMsg, setNewMsg] = useState({
    subject: "",
    body: "",
    recipient_id: "",
  });
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["messages"],
    queryFn: () => get<{ data: Message[] }>("/messages"),
  });

  const sendMsg = useMutation({
    mutationFn: (payload: any) => post("/messages", payload),
    onSuccess: () => {
      toast.success("Sent");
      qc.invalidateQueries({ queryKey: ["messages"] });
      setCompose(false);
      setNewMsg({ subject: "", body: "", recipient_id: "" });
    },
  });

  const sendReply = useMutation({
    mutationFn: (payload: any) => post("/messages", payload),
    onSuccess: () => {
      toast.success("Reply sent");
      qc.invalidateQueries({ queryKey: ["messages"] });
      setReply("");
    },
  });

  const messages = data?.data.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <Button leftIcon={<Send size={16} />} onClick={() => setCompose(true)}>
          Compose
        </Button>
      </div>

      {compose && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">New Message</h3>
            <input
              placeholder="Recipient ID"
              value={newMsg.recipient_id}
              onChange={(e) =>
                setNewMsg((n) => ({ ...n, recipient_id: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              placeholder="Subject"
              value={newMsg.subject}
              onChange={(e) =>
                setNewMsg((n) => ({ ...n, subject: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            />
            <textarea
              placeholder="Message..."
              rows={4}
              value={newMsg.body}
              onChange={(e) =>
                setNewMsg((n) => ({ ...n, body: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompose(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={sendMsg.isPending}
                onClick={() =>
                  sendMsg.mutate({
                    ...newMsg,
                    recipient_id: Number(newMsg.recipient_id),
                  })
                }
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        {/* Thread list */}
        <div className="border rounded-xl overflow-y-auto dark:border-gray-700">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No messages
            </div>
          )}
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                ${active?.id === m.id ? "bg-brand/5 border-l-2 border-l-brand" : ""}
                ${!m.is_read && m.sender.id !== user?.id ? "font-semibold" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{m.sender.name}</span>
                <span className="text-xs text-gray-400">
                  {timeAgo(m.created_at)}
                </span>
              </div>
              {m.subject && (
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {m.subject}
                </p>
              )}
              <p className="text-xs text-gray-500 truncate">{m.body}</p>
            </button>
          ))}
        </div>

        {/* Thread view */}
        <div className="md:col-span-2 border rounded-xl flex flex-col dark:border-gray-700">
          {!active && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a message to read</p>
              </div>
            </div>
          )}
          {active && (
            <>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">
                  {active.subject ?? "(No subject)"}
                </h3>
                <p className="text-xs text-gray-400">
                  From {active.sender.name} · {timeAgo(active.created_at)}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-sm">{active.body}</p>
                {(active.replies ?? []).map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-lg text-sm max-w-[80%] ${r.sender.id === user?.id ? "ml-auto bg-brand text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <p>{r.body}</p>
                    <p
                      className={`text-xs mt-1 ${r.sender.id === user?.id ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {timeAgo(r.created_at)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t dark:border-gray-700 flex gap-2">
                <input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && reply.trim())
                      sendReply.mutate({
                        body: reply,
                        parent_id: active.id,
                        recipient_id: active.sender.id,
                      });
                  }}
                />
                <Button
                  size="sm"
                  leftIcon={<Send size={14} />}
                  loading={sendReply.isPending}
                  onClick={() =>
                    reply.trim() &&
                    sendReply.mutate({
                      body: reply,
                      parent_id: active.id,
                      recipient_id: active.sender.id,
                    })
                  }
                >
                  Reply
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
