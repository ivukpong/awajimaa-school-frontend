"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Plus, Video, Calendar, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

const mockMeetings = [
  {
    id: 1,
    title: "Q1 Heads of School Summit",
    type: "virtual",
    platform: "zoom",
    scheduled_at: "2026-03-05T10:00:00",
    duration_minutes: 90,
    participants: 45,
    status: "scheduled",
  },
  {
    id: 2,
    title: "Annual Regulatory Review",
    type: "virtual",
    platform: "google_meet",
    scheduled_at: "2026-02-28T14:00:00",
    duration_minutes: 60,
    participants: 12,
    status: "scheduled",
  },
  {
    id: 3,
    title: "Safety Compliance Briefing",
    type: "virtual",
    platform: "teams",
    scheduled_at: "2026-02-20T09:00:00",
    duration_minutes: 45,
    participants: 30,
    status: "completed",
  },
];

export default function RegulatorMeetingsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meetings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule virtual meetings with school heads and stakeholders
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowModal(true)}
        >
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mockMeetings.map((m) => (
          <Card key={m.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={m.status === "completed" ? "gray" : "blue"}>
                  {m.status}
                </Badge>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-white text-sm">
                  {m.title}
                </h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
                <Video className="h-4 w-4 text-brand" />
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(m.scheduled_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {m.duration_minutes} mins · {m.platform}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{m.participants} participants</span>
              </div>
            </div>
            {m.status === "scheduled" && (
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Join
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Schedule Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Meeting Title"
                  placeholder="e.g. Q1 Heads of School Summit"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platform
                    </label>
                    <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800">
                      <option value="zoom">Zoom</option>
                      <option value="google_meet">Google Meet</option>
                      <option value="teams">Microsoft Teams</option>
                    </select>
                  </div>
                  <Input
                    label="Duration (mins)"
                    type="number"
                    placeholder="60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" required />
                  <Input label="Time" type="time" required />
                </div>
                <Input
                  label="Meeting Link"
                  placeholder="https://zoom.us/j/..."
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea className="min-h-[70px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
