"use client";

import { useState } from "react";
import { Calendar, PlusCircle, X, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import {
  useAppointments,
  useCreateAppointment,
  useCancelAppointment,
} from "@/hooks/useAppointments";

const STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  completed: "default",
  rescheduled: "secondary",
};

export default function StudentAppointmentsPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    type: "in_person" as "in_person" | "virtual",
    location: "",
    meeting_url: "",
    bookable_type: "school",
    bookable_id: user?.school_id ?? 0,
  });

  const { data, isLoading } = useAppointments({});
  const createMutation = useCreateAppointment();
  const cancelMutation = useCancelAppointment();

  const appointments = data?.data.data ?? [];

  const handleCreate = () => {
    createMutation.mutate(
      { ...form, bookable_type: "school", bookable_id: user?.school_id! },
      {
        onSuccess: () => {
          toast.success("Appointment request sent");
          setShowForm(false);
          setForm({
            title: "",
            description: "",
            appointment_date: "",
            start_time: "",
            end_time: "",
            type: "in_person",
            location: "",
            meeting_url: "",
            bookable_type: "school",
            bookable_id: user?.school_id ?? 0,
          });
        },
        onError: () => toast.error("Failed to create appointment"),
      },
    );
  };

  const handleCancel = () => {
    if (!cancelId) return;
    cancelMutation.mutate(
      { id: cancelId, cancel_reason: cancelReason },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled");
          setCancelId(null);
          setCancelReason("");
        },
        onError: () => toast.error("Failed to cancel"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Appointments
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Book Appointment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Book an Appointment</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Academic counselling session"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What is this appointment about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <Input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) =>
                    setForm({ ...form, appointment_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "in_person" | "virtual",
                    })
                  }
                >
                  <option value="in_person">In Person</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                />
              </div>
              {form.type === "in_person" ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Physical location"
                  />
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Meeting URL
                  </label>
                  <Input
                    value={form.meeting_url}
                    onChange={(e) =>
                      setForm({ ...form, meeting_url: e.target.value })
                    }
                    placeholder="https://meet.example.com/..."
                  />
                </div>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  loading={createMutation.isPending}
                  disabled={
                    !form.title ||
                    !form.appointment_date ||
                    !form.start_time ||
                    !form.end_time
                  }
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {cancelId !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cancel Appointment</CardTitle>
              <button onClick={() => setCancelId(null)}>
                <X size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Reason *</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCancelId(null)}>
                  Back
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  loading={cancelMutation.isPending}
                  disabled={!cancelReason.trim()}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No appointments booked yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {appt.title}
                      </h3>
                      <Badge variant={STATUS_COLORS[appt.status] as any}>
                        {appt.status}
                      </Badge>
                    </div>
                    {appt.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appt.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {appt.appointment_date} · {appt.start_time} –{" "}
                        {appt.end_time}
                      </span>
                      <span className="capitalize">
                        {appt.type.replace("_", " ")}
                      </span>
                    </div>
                    {appt.location && (
                      <p className="text-xs text-gray-500">
                        📍 {appt.location}
                      </p>
                    )}
                    {appt.meeting_url && (
                      <a
                        href={appt.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(appt.status === "pending" ||
                      appt.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<XCircle size={14} />}
                        onClick={() => setCancelId(appt.id)}
                      >
                        Cancel
                      </Button>
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
