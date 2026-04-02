"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import {
  BookOpen,
  TrendingUp,
  Calendar,
  DollarSign,
  HeartHandshake,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

// ── Thank-you compose modal ───────────────────────────────────────────────────
function ThankYouModal({
  sponsorId,
  sponsorName,
  onClose,
}: {
  sponsorId: number;
  sponsorName: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: () =>
      post("/messages", {
        recipient_id: sponsorId,
        subject: "Thank You",
        body,
      }),
    onSuccess: () => {
      toast.success("Thank-you message sent!");
      onClose();
    },
    onError: () => toast.error("Failed to send message"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Send Thank You
        </h2>
        <p className="text-sm text-gray-500 mb-4">To: {sponsorName}</p>
        <textarea
          className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Write your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<Send className="h-4 w-4" />}
            disabled={!body.trim() || send.isPending}
            onClick={() => send.mutate()}
          >
            {send.isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [thankYouTarget, setThankYouTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard"),
  });

  const { data: sponsorsData } = useQuery({
    queryKey: ["my-sponsors"],
    queryFn: () => get<any>("/students/my-sponsors"),
  });

  const { data: studentData } = useQuery({
    queryKey: ["my-student-profile"],
    queryFn: () => get<any>("/students/my-profile"),
    enabled: false, // only if endpoint exists
  });

  const d = data?.data ?? {};
  const sponsors = sponsorsData?.data ?? [];
  const myConsent = (studentData?.data as any)?.featured_consent ?? false;

  const toggleConsent = useMutation({
    mutationFn: (featured_consent: boolean) =>
      post(`/students/${user?.id}/featured-consent`, { featured_consent }),
    onSuccess: (_, val) => {
      toast.success(
        val ? "You're now featured for sponsors" : "Removed from featured list",
      );
      qc.invalidateQueries({ queryKey: ["my-student-profile"] });
    },
    onError: () => toast.error("Failed to update preference"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome, {user?.name?.split(" ")[0]} 👋
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${d.attendance_rate ?? 0}%`}
          icon={<Calendar size={20} />}
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={`${d.avg_score ?? 0}%`}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <StatCard
          title="Courses"
          value={d.enrolled_courses ?? 0}
          icon={<BookOpen size={20} />}
          color="purple"
        />
        <StatCard
          title="Fee Balance"
          value={`₦${(d.fee_balance ?? 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="yellow"
        />
      </div>

      {/* My Sponsors */}
      {sponsors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Sponsors</CardTitle>
              <button
                onClick={() => toggleConsent.mutate(!myConsent)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  myConsent
                    ? "bg-brand text-white border-brand"
                    : "border-gray-300 text-gray-500 hover:border-brand"
                }`}
              >
                {myConsent ? "Featured ✓" : "Allow Featured"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {sponsors.map((sp: any) => (
                <div
                  key={sp.id ?? sp.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold shrink-0 text-sm">
                    {sp.name === "Anonymous Sponsor"
                      ? "?"
                      : sp.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {sp.name}
                    </p>
                    {sp.scholarship_type && (
                      <p className="text-xs text-gray-500">
                        {sp.scholarship_type}
                      </p>
                    )}
                  </div>
                  {sp.name !== "Anonymous Sponsor" && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Send className="h-3 w-3" />}
                      onClick={() =>
                        setThankYouTarget({ id: sp.id, name: sp.name })
                      }
                    >
                      Thank You
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.upcoming_exams ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No upcoming exams
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.upcoming_exams ?? []).map((ex: any) => (
                <li
                  key={ex.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{ex.subject?.name}</p>
                    <p className="text-xs text-gray-400">
                      {ex.date} · {ex.start_time}
                    </p>
                  </div>
                  <Badge variant="blue" size="sm">
                    {ex.venue}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {(d.recent_results ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No results yet
              </p>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(d.recent_results ?? []).map((r: any) => (
                <li
                  key={r.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{r.subject?.name}</p>
                    <p className="text-xs text-gray-400">{r.term?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.total}%</span>
                    <Badge
                      variant={
                        r.grade === "A"
                          ? "green"
                          : r.grade === "B"
                            ? "blue"
                            : r.grade === "C"
                              ? "yellow"
                              : "red"
                      }
                      size="sm"
                    >
                      {r.grade}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Thank-you modal */}
      {thankYouTarget && (
        <ThankYouModal
          sponsorId={thankYouTarget.id}
          sponsorName={thankYouTarget.name}
          onClose={() => setThankYouTarget(null)}
        />
      )}
    </div>
  );
}
