"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Plus, Send } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Campaign {
  id: number;
  title: string;
  academic_year: string;
}

interface InterviewSchedule {
  id: number;
  campaign_id: number;
  campaign?: Campaign;
  mode: "physical" | "virtual";
  venue?: string;
  scheduled_at: string;
  end_time?: string;
  max_invites?: number;
  livekit_room_token?: string;
  livekit_room_name?: string;
  invitations_count?: number;
  created_at: string;
}

const EMPTY_FORM = {
  campaign_id: "",
  mode: "physical",
  venue: "",
  scheduled_at: "",
  end_time: "",
  max_invites: "",
};

export default function MinistryInterviewsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<InterviewSchedule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: campaignsData } = useQuery<{ data: Campaign[] }>({
    queryKey: ["ministry-campaigns"],
    queryFn: () =>
      get<{ data: Campaign[] }>("/ministry/campaigns").then((r) => r.data),
  });

  const { data: interviewsData, isLoading } = useQuery<{
    data: InterviewSchedule[];
  }>({
    queryKey: ["ministry-interviews"],
    queryFn: () =>
      get<{ data: InterviewSchedule[] }>("/ministry/interviews").then(
        (r) => r.data,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/interviews", {
        ...payload,
        campaign_id: parseInt(payload.campaign_id),
        max_invites: payload.max_invites
          ? parseInt(payload.max_invites)
          : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-interviews"] });
      toast.success("Interview scheduled.");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to schedule interview."),
  });

  const inviteMutation = useMutation({
    mutationFn: (scheduleId: number) =>
      post(`/ministry/interviews/${scheduleId}/invites`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-interviews"] });
      toast.success("Invites sent to shortlisted applicants.");
      setShowInviteModal(false);
      setSelectedSchedule(null);
    },
    onError: () => toast.error("Failed to send invites."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campaign_id) {
      toast.error("Select a campaign.");
      return;
    }
    if (!form.scheduled_at) {
      toast.error("Select a date and time.");
      return;
    }
    if (form.mode === "physical" && !form.venue) {
      toast.error("Enter a venue for physical interview.");
      return;
    }
    createMutation.mutate(form);
  }

  const interviews = interviewsData?.data ?? [];
  const campaigns = campaignsData?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule interview sessions and send invitations
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Schedule Interview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              No interviews scheduled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {interviews.map((iv) => (
                <div
                  key={iv.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {iv.campaign?.title ?? `Campaign #${iv.campaign_id}`}
                      </p>
                      <Badge variant={iv.mode === "virtual" ? "blue" : "gray"}>
                        {iv.mode === "virtual" ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" /> Virtual
                          </span>
                        ) : (
                          "Physical"
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(iv.scheduled_at).toLocaleString()}
                      {iv.end_time &&
                        ` — ${new Date(iv.end_time).toLocaleString()}`}
                    </p>
                    {iv.venue && (
                      <p className="text-sm text-gray-500">📍 {iv.venue}</p>
                    )}
                    {iv.mode === "virtual" && iv.livekit_room_name && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                        Room: {iv.livekit_room_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {iv.invitations_count ?? 0} invitations sent
                      {iv.max_invites ? ` / ${iv.max_invites} max` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSchedule(iv);
                        setShowInviteModal(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" /> Send Invites
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Interview Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setForm(EMPTY_FORM);
        }}
        title="Schedule Interview"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.campaign_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, campaign_id: e.target.value }))
              }
            >
              <option value="">Select campaign...</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.academic_year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mode
            </label>
            <div className="flex gap-3">
              {(["physical", "virtual"] as const).map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={form.mode === mode}
                    onChange={() => setForm((f) => ({ ...f, mode }))}
                  />
                  <span className="text-sm capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>
          {form.mode === "physical" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.venue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, venue: e.target.value }))
                }
                placeholder="Interview location"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.scheduled_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduled_at: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={form.end_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_time: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Invites
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={form.max_invites}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_invites: e.target.value }))
              }
              placeholder="Leave blank for all shortlisted"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setForm(EMPTY_FORM);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Send Invites Confirmation Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedSchedule(null);
        }}
        title="Send Interview Invitations"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This will send interview invitations to all{" "}
            <strong>shortlisted</strong> applicants for{" "}
            <strong>{selectedSchedule?.campaign?.title}</strong>, scheduled on{" "}
            <strong>
              {selectedSchedule?.scheduled_at
                ? new Date(selectedSchedule.scheduled_at).toLocaleString()
                : "—"}
            </strong>
            .
          </p>
          {selectedSchedule?.mode === "virtual" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
              A LiveKit virtual room link will be included in the invitation
              email.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowInviteModal(false);
                setSelectedSchedule(null);
              }}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedSchedule && inviteMutation.mutate(selectedSchedule.id)
              }
              disabled={inviteMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {inviteMutation.isPending ? "Sending..." : "Send Invitations"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
