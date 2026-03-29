"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useRecruitment } from "@/hooks/useHR";
import type { JobPosting, JobApplication } from "@/types/hr";
import { Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  draft: "gray",
  published: "blue",
  closed: "gray",
};
const appStatusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  submitted: "gray",
  shortlisted: "yellow",
  interviewed: "blue",
  hired: "green",
  rejected: "red",
};

export default function RecruitmentPage() {
  const {
    postings,
    loading,
    createPosting,
    updatePosting,
    deletePosting,
    getApplications,
    updateApplicationStatus,
  } = useRecruitment();
  const [showPostModal, setShowPostModal] = useState(false);
  const [viewApps, setViewApps] = useState<{
    posting: JobPosting;
    apps: JobApplication[];
  } | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    employment_type: "full_time",
    application_deadline: "",
    slots: "1",
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title || !form.employment_type || !form.slots) {
      toast.error("Please fill all required fields (Title, Type, Slots)");
      return;
    }
    setSaving(true);
    try {
      const { requirements: reqStr, ...rest } = form;
      await createPosting({
        ...rest,
        employment_type: form.employment_type as JobPosting["employment_type"],
        requirements: reqStr ? reqStr.split("\n").filter(Boolean) : undefined,
        slots: Number(form.slots) || 1,
      });
      toast.success("Job posting created");
      setShowPostModal(false);
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleViewApps = async (posting: JobPosting) => {
    try {
      const apps = await getApplications(posting.id);
      setViewApps({ posting, apps: apps?.data ?? [] });
    } catch {
      toast.error("Could not load applications");
    }
  };

  const handleAppStatus = async (appId: number, status: string) => {
    try {
      await updateApplicationStatus(appId, status);
      toast.success("Status updated");
      if (viewApps) {
        const apps = await getApplications(viewApps.posting.id);
        setViewApps({ ...viewApps, apps: apps?.data ?? [] });
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns: Column<JobPosting>[] = [
    {
      key: "title",
      header: "Position",
      sortable: true,
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "employment_type",
      header: "Type",
      render: (r) => (
        <Badge variant="gray">{r.employment_type?.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    { key: "application_deadline", header: "Deadline" },
    {
      key: "id" as keyof JobPosting,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewApps(r)}
          >
            <Users className="h-3 w-3 mr-1" />
            Applicants
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              deletePosting(r.id)
                .then(() => toast.success("Deleted"))
                .catch(() => toast.error("Failed"))
            }
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const appColumns: Column<JobApplication>[] = [
    {
      key: "applicant_name",
      header: "Name",
      render: (r) => <span className="font-medium">{r.applicant_name}</span>,
    },
    { key: "applicant_email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={appStatusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "id" as keyof JobApplication,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.status === "submitted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAppStatus(r.id, "shortlisted")}
            >
              Shortlist
            </Button>
          )}
          {r.status === "shortlisted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAppStatus(r.id, "interviewed")}
            >
              Interview
            </Button>
          )}
          {r.status === "interviewed" && (
            <>
              <Button size="sm" onClick={() => handleAppStatus(r.id, "hired")}>
                Hire
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAppStatus(r.id, "rejected")}
              >
                Reject
              </Button>
            </>
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
            Recruitment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage job postings and applications
          </p>
        </div>
        <Button onClick={() => setShowPostModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Posting
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            keyField="id"
            columns={columns}
            data={
              (postings?.data ?? []) as unknown as (JobPosting &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">New Job Posting</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mathematics Teacher"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({ ...form, employment_type: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <Input
                  type="date"
                  value={form.application_deadline}
                  onChange={(e) =>
                    setForm({ ...form, application_deadline: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Role description…"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) =>
                    setForm({ ...form, requirements: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Qualifications required…"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowPostModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : "Post Job"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Applicants — {viewApps.posting.title}
              </h2>
              <Button variant="secondary" onClick={() => setViewApps(null)}>
                Close
              </Button>
            </div>
            <Table
              keyField="id"
              columns={appColumns}
              data={
                viewApps.apps as unknown as (JobApplication &
                  Record<string, unknown>)[]
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
