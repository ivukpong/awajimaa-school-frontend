"use client";
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { School, Upload, FileCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, postForm } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface MinistrySchool {
  id: number;
  name: string;
  lga?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  school_type?: string;
  created_at: string;
}

interface ApprovalRequest {
  id: number;
  school_name: string;
  contact_email?: string;
  contact_phone?: string;
  lga?: string;
  status: string;
  query_reason?: string;
  submitted_at: string;
}

const STATUS_VARIANT: Record<
  string,
  "yellow" | "green" | "blue" | "red" | "gray"
> = {
  pending: "yellow",
  approved: "green",
  queried: "blue",
  rejected: "red",
};

const EMPTY_SCHOOL = {
  name: "",
  lga: "",
  city: "",
  phone: "",
  email: "",
  school_type: "primary",
};

type TabType = "schools" | "approvals";

export default function MinistrySchoolsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabType>("schools");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<
    "approved" | "queried" | "rejected"
  >("approved");
  const [queryReason, setQueryReason] = useState("");
  const [form, setForm] = useState(EMPTY_SCHOOL);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: schoolsData, isLoading: loadingSchools } = useQuery<{
    data: MinistrySchool[];
  }>({
    queryKey: ["ministry-schools"],
    queryFn: () =>
      get<{ data: MinistrySchool[] }>("/ministry/schools").then((r) => r.data),
  });

  const { data: approvalsData, isLoading: loadingApprovals } = useQuery<{
    data: ApprovalRequest[];
  }>({
    queryKey: ["ministry-approvals"],
    queryFn: () =>
      get<{ data: ApprovalRequest[] }>("/ministry/approval-requests").then(
        (r) => r.data,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_SCHOOL) => post("/ministry/schools", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-schools"] });
      toast.success("School created.");
      setShowCreateModal(false);
      setForm(EMPTY_SCHOOL);
    },
    onError: () => toast.error("Failed to create school."),
  });

  const bulkMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return postForm("/ministry/schools/bulk-upload", fd);
    },
    onSuccess: (res: unknown) => {
      qc.invalidateQueries({ queryKey: ["ministry-schools"] });
      const r = res as { data?: { imported?: number } };
      toast.success(`Imported ${r?.data?.imported ?? "??"} schools.`);
    },
    onError: () => toast.error("Bulk upload failed."),
  });

  const approvalMutation = useMutation({
    mutationFn: ({
      id,
      status,
      query_reason,
    }: {
      id: number;
      status: string;
      query_reason?: string;
    }) => post(`/ministry/approval-requests/${id}`, { status, query_reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-approvals"] });
      toast.success("Approval request updated.");
      setShowApprovalModal(false);
      setSelectedApproval(null);
    },
    onError: () => toast.error("Failed to process approval."),
  });

  function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    bulkMutation.mutate(file);
    e.target.value = "";
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      toast.error("School name is required.");
      return;
    }
    createMutation.mutate(form);
  }

  function openApproval(req: ApprovalRequest) {
    setSelectedApproval(req);
    setApprovalAction("approved");
    setQueryReason("");
    setShowApprovalModal(true);
  }

  function submitApproval() {
    if (!selectedApproval) return;
    if (approvalAction === "queried" && !queryReason.trim()) {
      toast.error("Please enter a reason for querying.");
      return;
    }
    approvalMutation.mutate({
      id: selectedApproval.id,
      status: approvalAction,
      query_reason: approvalAction === "queried" ? queryReason : undefined,
    });
  }

  const schools = schoolsData?.data ?? [];
  const approvals = approvalsData?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schools
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage state schools and approve new school requests
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv,.xlsx"
            ref={fileRef}
            className="hidden"
            onChange={handleBulkUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={bulkMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {bulkMutation.isPending ? "Uploading..." : "Bulk Upload"}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <School className="h-4 w-4 mr-2" /> Add School
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["schools", "approvals"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t === "schools" ? "All Schools" : "Approval Requests"}
            {t === "approvals" &&
              approvals.filter((a) => a.status === "pending").length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
                  {approvals.filter((a) => a.status === "pending").length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Schools Tab */}
      {tab === "schools" && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Schools ({schools.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSchools ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : schools.length === 0 ? (
              <p className="text-sm text-gray-500">
                No schools found. Create one or use bulk upload.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Name
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        LGA
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Type
                      </th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr
                        key={school.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                          {school.name}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {school.lga ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 capitalize">
                          {school.school_type ?? "—"}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {school.phone ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approvals Tab */}
      {tab === "approvals" && (
        <Card>
          <CardHeader>
            <CardTitle>School Approval Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingApprovals ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : approvals.length === 0 ? (
              <p className="text-sm text-gray-500">No approval requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        School
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        LGA
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Contact
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                          {req.school_name}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {req.lga ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {req.contact_email ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_VARIANT[req.status] ?? "gray"}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {req.status === "pending" && (
                            <Button size="sm" onClick={() => openApproval(req)}>
                              <FileCheck className="h-4 w-4 mr-1" /> Review
                            </Button>
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
      )}

      {/* Create School Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setForm(EMPTY_SCHOOL);
        }}
        title="Add School"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="School name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LGA
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={form.lga}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lga: e.target.value }))
                }
                placeholder="Local Govt. Area"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                placeholder="City"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="08012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="school@edu.ng"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School Type
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={form.school_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, school_type: e.target.value }))
              }
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setForm(EMPTY_SCHOOL);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create School"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approval Review Modal */}
      <Modal
        open={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedApproval(null);
        }}
        title={`Review: ${selectedApproval?.school_name ?? ""}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm space-y-1">
            {selectedApproval?.lga && (
              <p>
                <span className="font-medium">LGA:</span> {selectedApproval.lga}
              </p>
            )}
            {selectedApproval?.contact_email && (
              <p>
                <span className="font-medium">Email:</span>{" "}
                {selectedApproval.contact_email}
              </p>
            )}
            {selectedApproval?.contact_phone && (
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {selectedApproval.contact_phone}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Decision
            </label>
            <div className="flex gap-2">
              {(["approved", "queried", "rejected"] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setApprovalAction(action)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    approvalAction === action
                      ? action === "approved"
                        ? "bg-green-600 text-white border-green-600"
                        : action === "queried"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-red-600 text-white border-red-600"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {approvalAction === "queried" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Query Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                rows={3}
                value={queryReason}
                onChange={(e) => setQueryReason(e.target.value)}
                placeholder="Explain what needs to be corrected..."
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedApproval(null);
              }}
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={approvalMutation.isPending}
            >
              {approvalMutation.isPending ? "Processing..." : "Submit Decision"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
