"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import {
  School2,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import type { School } from "@/hooks/useSchools";

interface LinkRequest {
  id: number;
  school_id: number;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  admin_note: string | null;
  created_at: string;
  school: Pick<School, "id" | "name">;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    variant: "yellow" as const,
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: "Approved",
    variant: "green" as const,
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Rejected",
    variant: "red" as const,
    icon: <XCircle className="h-3 w-3" />,
  },
};

export default function LinkSchoolPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [schoolSearch, setSchoolSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [message, setMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch my existing link requests
  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ["student-link-requests"],
    queryFn: () =>
      get<{ data: LinkRequest[] }>("/student/link-requests").then(
        (r) => r.data,
      ),
  });

  // Search schools
  const { data: schoolsData, isLoading: loadingSchools } = useQuery({
    queryKey: ["schools-search", schoolSearch],
    queryFn: () =>
      get<{ data: School[] }>(
        `/schools?search=${encodeURIComponent(schoolSearch)}&per_page=10`,
      ).then((r) => r.data),
    enabled: schoolSearch.length >= 2,
  });

  const sendRequest = useMutation({
    mutationFn: () =>
      post("/student/link-requests", {
        school_id: selectedSchool!.id,
        message: message.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Link request sent successfully!");
      setSelectedSchool(null);
      setSchoolSearch("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["student-link-requests"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to send request.";
      toast.error(msg);
    },
  });

  const requests: LinkRequest[] = requestsData?.data ?? [];
  const schools: School[] = schoolsData?.data ?? [];

  const pendingSchoolIds = new Set(
    requests.filter((r) => r.status === "pending").map((r) => r.school_id),
  );
  const approvedSchoolIds = new Set(
    requests.filter((r) => r.status === "approved").map((r) => r.school_id),
  );

  const canSend =
    selectedSchool &&
    !pendingSchoolIds.has(selectedSchool.id) &&
    !approvedSchoolIds.has(selectedSchool.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <School2 className="h-6 w-6 text-brand" />
          Link to a School
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Send a request to your school so they can link your account to your
          student record.
        </p>
      </div>

      {/* Request form */}
      <Card>
        <CardHeader>
          <CardTitle>Send a Link Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* School search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search schools by name…"
                className="pl-9"
                value={selectedSchool ? selectedSchool.name : schoolSearch}
                onChange={(e) => {
                  setSelectedSchool(null);
                  setSchoolSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>

            {/* Dropdown */}
            {showDropdown && schoolSearch.length >= 2 && !selectedSchool && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                {loadingSchools ? (
                  <p className="px-4 py-3 text-sm text-gray-500">Searching…</p>
                ) : schools.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    No schools found.
                  </p>
                ) : (
                  schools.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col"
                      onClick={() => {
                        setSelectedSchool(school);
                        setSchoolSearch(school.name);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {school.name}
                      </span>
                      {school.state && (
                        <span className="text-xs text-gray-400">
                          {school.state.name}
                          {school.lga ? `, ${school.lga.name}` : ""}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Status hint when school already requested */}
          {selectedSchool && pendingSchoolIds.has(selectedSchool.id) && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              You already have a pending request for this school.
            </p>
          )}
          {selectedSchool && approvedSchoolIds.has(selectedSchool.id) && (
            <p className="text-sm text-green-600 dark:text-green-400">
              You are already linked to this school.
            </p>
          )}

          {/* Optional message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-gray-400"
              placeholder="E.g. My admission number is STD-2023-001…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
            />
          </div>

          <Button
            leftIcon={<Send className="h-4 w-4" />}
            disabled={!canSend || sendRequest.isPending}
            onClick={() => sendRequest.mutate()}
            className="w-full"
          >
            {sendRequest.isPending ? "Sending…" : "Send Request"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">No requests sent yet.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => {
                const cfg = STATUS_CONFIG[req.status];
                return (
                  <li
                    key={req.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {req.school?.name ?? `School #${req.school_id}`}
                      </p>
                      {req.message && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                          {req.message}
                        </p>
                      )}
                      {req.admin_note && req.status !== "pending" && (
                        <p className="mt-1 text-xs text-gray-500 italic">
                          Note: {req.admin_note}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={cfg.variant}
                      className="flex items-center gap-1 shrink-0"
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
