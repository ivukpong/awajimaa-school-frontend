"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Plus, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Meeting {
  id: number;
  title: string;
  agenda?: string;
  platform?: string;
  meeting_url?: string;
  livekit_room_name?: string;
  starts_at: string;
  ends_at?: string;
  type?: string;
  created_at: string;
}

const PLATFORM_OPTIONS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "custom", label: "Custom" },
  { value: "awajimaa", label: "Awajimaa (Built-in)" },
];

const TYPE_OPTIONS = [
  { value: "virtual", label: "Virtual" },
  { value: "physical", label: "Physical" },
];

const PLATFORM_VARIANT: Record<
  string,
  "blue" | "green" | "purple" | "gray" | "yellow"
> = {
  zoom: "blue",
  google_meet: "green",
  teams: "purple",
  custom: "gray",
  awajimaa: "yellow",
};

const EMPTY_FORM = {
  title: "",
  agenda: "",
  platform: "zoom",
  meeting_url: "",
  meeting_id: "",
  passcode: "",
  starts_at: "",
  ends_at: "",
  type: "virtual",
};

export default function MinistryMeetingsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  async function handleJoinAwajimaa(meeting: Meeting) {
    setJoiningId(meeting.id);
    try {
      const userData = Cookies.get("user");
      const userName = userData
        ? (JSON.parse(userData)?.name ?? "Participant")
        : "Participant";
      const res = await post<{
        success: boolean;
        token: string;
        ws_url: string;
      }>("/meetings/livekit/token", {
        meeting_id: meeting.id,
        participant_name: userName,
      });
      if (res.success && meeting.livekit_room_name) {
        const url = `/meeting/${meeting.livekit_room_name}?meeting=${meeting.id}&name=${encodeURIComponent(userName)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Could not get meeting token.");
      }
    } catch {
      toast.error("Failed to join meeting.");
    } finally {
      setJoiningId(null);
    }
  }

  const { data, isLoading } = useQuery<{ data: Meeting[] }>({
    queryKey: ["ministry-meetings"],
    queryFn: () => get<{ data: Meeting[] }>("/meetings").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) => post("/meetings", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-meetings"] });
      toast.success("Meeting created.");
      closeModal();
    },
    onError: () => toast.error("Failed to create meeting."),
  });

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return toast.error("Title is required.");
    if (!form.starts_at) return toast.error("Start time is required.");
    if (
      form.type === "virtual" &&
      form.platform !== "awajimaa" &&
      !form.meeting_url
    )
      return toast.error("Meeting URL is required for this platform.");
    createMutation.mutate(form);
  }

  const meetings = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meetings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule virtual and physical meetings with schools, teachers and
            regulators
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Schedule Meeting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meetings ({meetings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Video className="h-10 w-10 mb-3" />
              <p className="text-sm">No meetings scheduled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Title
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Platform
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Starts At
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Ends At
                    </th>
                    <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                        {m.title}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={m.type === "virtual" ? "blue" : "green"}
                        >
                          {m.type ?? "Virtual"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {m.platform ? (
                          <Badge
                            variant={PLATFORM_VARIANT[m.platform] ?? "gray"}
                          >
                            {PLATFORM_OPTIONS.find(
                              (p) => p.value === m.platform,
                            )?.label ?? m.platform}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {m.starts_at
                          ? new Date(m.starts_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {m.ends_at ? new Date(m.ends_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3">
                        {m.platform === "awajimaa" ? (
                          <button
                            onClick={() => handleJoinAwajimaa(m)}
                            disabled={joiningId === m.id}
                            className="inline-flex items-center gap-1 text-xs bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-medium px-2.5 py-1 rounded"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {joiningId === m.id ? "…" : "Join"}
                          </button>
                        ) : m.meeting_url ? (
                          <a
                            href={m.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Join
                          </a>
                        ) : (
                          "—"
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

      {/* Schedule Meeting Modal */}
      <Modal open={showModal} onClose={closeModal} title="Schedule Meeting">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Q1 School Principals Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Type
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {form.type === "virtual" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={form.platform}
                  onChange={(e) =>
                    setForm({ ...form, platform: e.target.value })
                  }
                >
                  {PLATFORM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.platform !== "awajimaa" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting URL *
                    </label>
                    <input
                      type="url"
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={form.meeting_url}
                      onChange={(e) =>
                        setForm({ ...form, meeting_url: e.target.value })
                      }
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meeting ID
                      </label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={form.meeting_id}
                        onChange={(e) =>
                          setForm({ ...form, meeting_id: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Passcode
                      </label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={form.passcode}
                        onChange={(e) =>
                          setForm({ ...form, passcode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {form.platform === "awajimaa" && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-3 py-2">
                  The built-in Awajimaa video room will be created
                  automatically. Participants can join directly from the
                  meetings list.
                </p>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agenda
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={3}
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Meeting agenda..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starts At *
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ends At
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving…" : "Schedule"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
