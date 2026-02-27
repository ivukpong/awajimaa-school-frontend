"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import {
  Calendar,
  Video,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Meeting {
  id: number;
  title: string;
  description?: string;
  meeting_type: string;
  platform?: string;
  meeting_link?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  my_status?: string;
}

const statusBadge: Record<string, "green" | "yellow" | "gray" | "red"> = {
  scheduled: "blue" as any,
  ongoing: "green",
  completed: "gray",
  cancelled: "red",
};

export default function ParentMeetingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: () =>
      get<any>("/meetings").then((r) => r.data?.data ?? r.data ?? []),
  });
  const meetings: Meeting[] = Array.isArray(data) ? data : [];

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      post(`/meetings/${id}/${action}`, {}),
    onSuccess: () => {
      toast.success("Response sent");
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: () => toast.error("Failed to respond"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Meetings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upcoming &amp; past meetings
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No meetings scheduled.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      {m.meeting_type === "virtual" ? (
                        <Video className="h-5 w-5 text-brand" />
                      ) : (
                        <MapPin className="h-5 w-5 text-brand" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {m.title}
                      </p>
                      {m.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {m.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(m.scheduled_at).toLocaleDateString(
                            "en-NG",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(m.scheduled_at).toLocaleTimeString(
                            "en-NG",
                            { hour: "2-digit", minute: "2-digit" },
                          )}{" "}
                          · {m.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge[m.status] ?? "gray"}>
                      {m.status}
                    </Badge>
                    {m.meeting_link && (
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      </a>
                    )}
                    {m.status === "scheduled" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                          onClick={() =>
                            respondMutation.mutate({
                              id: m.id,
                              action: "accept",
                            })
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          onClick={() =>
                            respondMutation.mutate({
                              id: m.id,
                              action: "decline",
                            })
                          }
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
