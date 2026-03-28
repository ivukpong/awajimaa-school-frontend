"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquare, Plus, Search, Send } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDate, timeAgo } from "@/lib/utils";

interface DashboardMessage {
  id: number;
  subject?: string;
  body: string;
  created_at: string;
  is_read?: boolean;
  read_at?: string | null;
  sender?: { name?: string };
  recipient?: { name?: string };
}

function SponsorMessagesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<DashboardMessage | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [compose, setCompose] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sponsor-messages", tab],
    queryFn: () =>
      get<any>(`/messages?type=${tab}`).then((response) => {
        const payload = response.data?.data ?? response.data ?? [];
        return Array.isArray(payload) ? payload : [];
      }),
  });

  const messages: DashboardMessage[] = Array.isArray(data) ? data : [];
  const unreadCount = messages.filter(
    (message) => !(message.is_read ?? !!message.read_at),
  ).length;

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return messages;
    }

    return messages.filter((message) =>
      [message.subject, message.body, message.sender?.name, message.recipient?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [messages, search]);

  const sendMutation = useMutation({
    mutationFn: () => post("/messages", form),
    onSuccess: () => {
      toast.success("Message sent");
      setCompose(false);
      setForm({ to: "", subject: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["sponsor-messages"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay in touch with school admins, students, and program contacts.
          </p>
        </div>
        <Button
          onClick={() => setCompose(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Compose
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <p className="text-sm text-gray-500">Inbox Messages</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {messages.length}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {unreadCount}
              </p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500">Mailbox</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={tab === "inbox" ? "blue" : "gray"}>
                {tab === "inbox" ? "Inbox" : "Sent"}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {filteredMessages.length} visible conversation
                {filteredMessages.length === 1 ? "" : "s"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card padding={false} className="overflow-hidden">
          <div className="border-b border-gray-200 p-2 dark:border-gray-800">
            <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {(["inbox", "sent"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTab(type);
                    setSelected(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    tab === type
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-gray-200 p-3 dark:border-gray-800">
            <Input
              placeholder="Search messages"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="max-h-[32rem] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <p className="p-6 text-sm text-gray-500">Loading messages...</p>
            ) : isError ? (
              <p className="p-6 text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : "Failed to load sponsor messages."}
              </p>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" />
                <p className="mt-3 text-sm text-gray-500">
                  No messages match your current view.
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const unread = !(message.is_read ?? !!message.read_at);
                const counterpart =
                  tab === "inbox"
                    ? message.sender?.name ?? "Platform"
                    : message.recipient?.name ?? "Recipient";

                return (
                  <button
                    key={message.id}
                    onClick={() => {
                      setCompose(false);
                      setSelected(message);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selected?.id === message.id ? "bg-brand/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`truncate text-sm ${
                              unread
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "font-medium text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {counterpart}
                          </p>
                          {unread && tab === "inbox" && (
                            <span className="h-2 w-2 rounded-full bg-brand" />
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {message.subject ?? "No subject"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-400">
                          {message.body}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {timeAgo(message.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="min-h-[32rem]">
          {compose ? (
            <>
              <CardHeader>
                <CardTitle>New Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Recipient"
                  placeholder="Email, name, or user ID"
                  value={form.to}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, to: event.target.value }))
                  }
                />
                <Input
                  label="Subject"
                  placeholder="Message subject"
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Write your message here..."
                    value={form.body}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, body: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => sendMutation.mutate()}
                    loading={sendMutation.isPending}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setCompose(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </>
          ) : selected ? (
            <>
              <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{selected.subject ?? "No subject"}</CardTitle>
                    <p className="mt-2 text-sm text-gray-500">
                      {tab === "inbox" ? "From" : "To"}{" "}
                      {tab === "inbox"
                        ? selected.sender?.name ?? "Platform"
                        : selected.recipient?.name ?? "Recipient"}{" "}
                      · {formatDate(selected.created_at, "dd MMM yyyy, p")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      !(selected.is_read ?? !!selected.read_at) && tab === "inbox"
                        ? "blue"
                        : "gray"
                    }
                  >
                    {!(selected.is_read ?? !!selected.read_at) && tab === "inbox"
                      ? "Unread"
                      : "Opened"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {selected.body}
                </p>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center">
              <div className="rounded-2xl bg-gray-100 p-4 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Select a conversation
              </h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Pick a message from the list to read it here, or compose a new
                one to reach a school or student.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SponsorMessagesPage;
