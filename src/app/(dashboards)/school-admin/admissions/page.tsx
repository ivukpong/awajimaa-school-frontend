"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useAdmissions } from "@/hooks/useInventory";
import type { AdmissionApplication, AdmissionSession } from "@/types/inventory";
import { Plus, UserCheck, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const statusVariant: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  submitted: "yellow",
  under_review: "blue",
  admitted: "green",
  rejected: "red",
  
};

export default function AdmissionsPage() {
  const {
    sessions,
    applications,
    loading,
    createSession,
    updateApplicationStatus,
    convertToStudent,
  } = useAdmissions();
  const [search, setSearch] = useState("");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    name: "",
    open_date: "",
    close_date: "",
    slots: "",
    application_fee: "",
  });
  const [saving, setSaving] = useState(false);

  const rows = (applications?.data ?? []).filter(
    (r) =>
      r.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.application_number?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateSession = async () => {
    if (!sessionForm.name) return toast.error("Session name required");
    setSaving(true);
    try {
      await createSession({
        ...sessionForm,
        slots: sessionForm.slots ? Number(sessionForm.slots) : undefined,
        application_fee: sessionForm.application_fee ? Number(sessionForm.application_fee) : 0,
      });
      toast.success("Session created");
      setShowSessionModal(false);
    } catch {
      toast.error("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateApplicationStatus(id, { status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleConvert = async (id: number) => {
    if (!confirm("Convert this applicant to an enrolled student?")) return;
    try {
      await convertToStudent(id, {});
      toast.success("Applicant converted to student");
    } catch {
      toast.error("Conversion failed");
    }
  };

  const columns: Column<AdmissionApplication>[] = [
    {
      key: "application_number",
      header: "App No.",
      render: (r) => (
        <span className="font-mono text-sm">{r.application_number}</span>
      ),
    },
    {
      key: "first_name",
      header: "Name",
      render: (r) => (
        <span className="font-medium">
          {r.first_name} {r.last_name}
        </span>
      ),
    },
    {
      key: "gender",
      header: "Gender",
      render: (r) => (
        <Badge variant={r.gender === "female" ? "purple" : "blue"}>
          {r.gender}
        </Badge>
      ),
    },
    { key: "date_of_birth", header: "DOB" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusVariant[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "id" as keyof AdmissionApplication,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.status === "submitted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatus(r.id, "under_review")}
            >
              Review
            </Button>
          )}
          {r.status === "under_review" && (
            <>
              <Button size="sm" onClick={() => handleStatus(r.id, "admitted")}>
                <UserCheck className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleStatus(r.id, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          {r.status === "admitted" && (
            <Button size="sm" onClick={() => handleConvert(r.id)}>
              Enroll
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage admission sessions and applications
          </p>
        </div>
        <Button onClick={() => setShowSessionModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((s: AdmissionSession) => (
            <Card key={s.id} className="border border-gray-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.open_date} – {s.close_date}
                    </p>
                  </div>
                  <Badge variant={s.is_active ? "green" : "gray"}>
                    {s.is_active ? "Active" : "Closed"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span>
                    <ClipboardList className="h-3 w-3 inline mr-1" />
                    {s.applications_count ?? 0} applications
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <Input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={
              rows as unknown as (AdmissionApplication &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">New Admission Session</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Session Name *</label>
                <Input
                  value={sessionForm.name}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, name: e.target.value })
                  }
                  placeholder="e.g. 2025/2026 Admissions"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Open Date</label>
                  <Input
                    type="date"
                    value={sessionForm.open_date}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        open_date: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Close Date</label>
                  <Input
                    type="date"
                    value={sessionForm.close_date}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        close_date: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Available Slots</label>
                <Input
                  type="number"
                  value={sessionForm.slots}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      slots: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Application Fee (₦)</label>
                <Input
                  type="number"
                  value={sessionForm.application_fee}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      application_fee: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowSessionModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSession} disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
