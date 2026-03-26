"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Trash2,
  GripVertical,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { get, post } from "@/lib/api";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormField {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "file"
    | "select"
    | "checkbox";
  required: boolean;
  options?: string[];
}

interface VerificationForm {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
  target_school_types?: string[];
  applicable_lgas?: number[];
  amount?: number;
  currency?: string;
  designation?: string;
  deadline?: string;
  signature_url?: string;
  stamp_url?: string;
  certificate_template?: string;
  is_active: boolean;
  regulator?: { id: number; name: string };
}

interface Submission {
  id: number;
  school: { id: number; name: string; email?: string };
  status: string;
  reviewer_note?: string;
  certificate_url?: string;
  certificate_sent_at?: string;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];
const SCHOOL_TYPES = [
  "nursery",
  "primary",
  "secondary",
  "tertiary",
  "vocational",
];
const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "date",
  "file",
  "select",
  "checkbox",
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldRow({
  field,
  index,
  onChange,
  onRemove,
}: {
  field: FormField;
  index: number;
  onChange: (i: number, f: FormField) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      <GripVertical className="mt-2 h-4 w-4 flex-shrink-0 text-gray-400" />
      <div className="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          placeholder="Field key (e.g. phone)"
          value={field.key}
          onChange={(e) => onChange(index, { ...field, key: e.target.value })}
        />
        <Input
          placeholder="Label (e.g. Phone Number)"
          value={field.label}
          onChange={(e) => onChange(index, { ...field, label: e.target.value })}
        />
        <select
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          value={field.type}
          onChange={(e) =>
            onChange(index, {
              ...field,
              type: e.target.value as FormField["type"],
            })
          }
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) =>
              onChange(index, { ...field, required: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          Required
        </label>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-1 rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Create Form Modal ─────────────────────────────────────────────────────────

function CreateFormModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [targetTypes, setTargetTypes] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [designation, setDesignation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [stampUrl, setStampUrl] = useState("");
  const [certTemplate, setCertTemplate] = useState(
    "This certifies that {{school_name}} has been approved for {{form_title}} on {{date}}.",
  );

  const createMutation = useMutation({
    mutationFn: (body: object) => post("/verification-forms", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification-forms"] });
      toast.success("Form created successfully");
      onClose();
    },
    onError: () => toast.error("Failed to create form"),
  });

  const addField = () =>
    setFields((f) => [
      ...f,
      { key: "", label: "", type: "text", required: false },
    ]);

  const updateField = (i: number, f: FormField) =>
    setFields((prev) => prev.map((el, idx) => (idx === i ? f : el)));

  const removeField = (i: number) =>
    setFields((prev) => prev.filter((_, idx) => idx !== i));

  const toggleType = (t: string) =>
    setTargetTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    createMutation.mutate({
      title,
      description,
      fields,
      target_school_types: targetTypes,
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      designation,
      deadline: deadline || undefined,
      signature_url: signatureUrl || undefined,
      stamp_url: stampUrl || undefined,
      certificate_template: certTemplate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-gray-900 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Verification / Approval Form
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Form Title *
              </label>
              <Input
                placeholder="e.g. Annual Safety Compliance Form"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                rows={3}
                placeholder="Describe what this form is for…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Target school types */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target School Types
            </label>
            <div className="flex flex-wrap gap-2">
              {SCHOOL_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    targetTypes.includes(t)
                      ? "border-brand bg-brand text-white"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Payment info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency
              </label>
              <select
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deadline
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Designations & signatures */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Approver Designation
              </label>
              <Input
                placeholder="e.g. Director of Education"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Signature Image URL
              </label>
              <Input
                placeholder="https://…"
                value={signatureUrl}
                onChange={(e) => setSignatureUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stamp Image URL
              </label>
              <Input
                placeholder="https://…"
                value={stampUrl}
                onChange={(e) => setStampUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Form Fields
              </label>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={addField}
              >
                Add Field
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-400 dark:border-gray-600">
                No fields yet. Click "Add Field" to start building your form.
              </p>
            )}
            <div className="space-y-2">
              {fields.map((f, i) => (
                <FieldRow
                  key={i}
                  field={f}
                  index={i}
                  onChange={updateField}
                  onRemove={removeField}
                />
              ))}
            </div>
          </div>

          {/* Certificate Template */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Certificate Template{" "}
              <span className="text-xs font-normal text-gray-400">
                (use {"{{school_name}}"}, {"{{form_title}}"}, {"{{date}}"})
              </span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
              rows={4}
              value={certTemplate}
              onChange={(e) => setCertTemplate(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t p-4 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending}>
            Create Form
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Submissions Panel ─────────────────────────────────────────────────────────

function SubmissionsPanel({ formId }: { formId: number }) {
  const qc = useQueryClient();

  const submissionsQ = useQuery({
    queryKey: ["form-submissions", formId],
    queryFn: () =>
      get<{ data: { data: Submission[] } }>(
        `/verification-forms/${formId}/submissions`,
      ),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
      reviewer_note,
    }: {
      submissionId: number;
      status: string;
      reviewer_note?: string;
    }) =>
      post(`/form-submissions/${submissionId}/review`, {
        status,
        reviewer_note,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["form-submissions", formId] });
      toast.success("Submission reviewed");
    },
    onError: () => toast.error("Review failed"),
  });

  const submissions: Submission[] =
    (submissionsQ.data?.data as unknown as { data: Submission[] })?.data ?? [];

  if (submissionsQ.isLoading) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Loading submissions…
      </p>
    );
  }

  if (submissions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No submissions for this form yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
        >
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {s.school?.name ?? "Unknown School"}
            </p>
            <p className="text-xs text-gray-500">{formatDate(s.created_at)}</p>
          </div>
          <Badge
            variant={
              s.status === "approved"
                ? "green"
                : s.status === "rejected"
                  ? "red"
                  : s.status === "needs_revision"
                    ? "yellow"
                    : "blue"
            }
          >
            {s.status.replace(/_/g, " ")}
          </Badge>
          {s.status === "submitted" && (
            <div className="flex gap-1">
              <button
                title="Approve"
                onClick={() =>
                  reviewMutation.mutate({
                    submissionId: s.id,
                    status: "approved",
                  })
                }
                className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                title="Needs Revision"
                onClick={() =>
                  reviewMutation.mutate({
                    submissionId: s.id,
                    status: "needs_revision",
                  })
                }
                className="rounded p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                title="Reject"
                onClick={() =>
                  reviewMutation.mutate({
                    submissionId: s.id,
                    status: "rejected",
                  })
                }
                className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const formColumns: Column<VerificationForm>[] = [
  {
    key: "title",
    header: "Form Title",
    sortable: true,
    render: (r) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {r.title}
      </span>
    ),
  },
  {
    key: "target_school_types",
    header: "Target",
    render: (r) =>
      r.target_school_types?.length
        ? r.target_school_types.join(", ")
        : "All schools",
  },
  {
    key: "deadline",
    header: "Deadline",
    render: (r) => (r.deadline ? formatDate(r.deadline) : "—"),
  },
  {
    key: "amount",
    header: "Fee",
    render: (r) =>
      r.amount
        ? `${r.currency ?? "NGN"} ${Number(r.amount).toLocaleString()}`
        : "Free",
  },
  {
    key: "is_active",
    header: "Status",
    render: (r) => (
      <Badge variant={r.is_active ? "green" : "gray"}>
        {r.is_active ? "Active" : "Closed"}
      </Badge>
    ),
  },
];

export default function RegulatorFormsPage() {
  const [tab, setTab] = useState<"forms" | "submissions">("forms");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const formsQ = useQuery({
    queryKey: ["verification-forms"],
    queryFn: () => get<{ data: VerificationForm[] }>("/verification-forms"),
  });

  const forms: VerificationForm[] =
    (formsQ.data?.data as unknown as { data: VerificationForm[] })?.data ?? [];

  const handleRowClick = (form: VerificationForm) => {
    setSelectedFormId(form.id);
    setTab("submissions");
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreateFormModal onClose={() => setShowCreate(false)} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forms & Verification
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create compliance forms, track school submissions, and manage
            approvals
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Create Form
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit dark:border-gray-700 dark:bg-gray-800">
        {(["forms", "submissions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "forms" ? (
        <Table
          keyField="id"
          columns={formColumns}
          data={forms}
          emptyMessage={
            formsQ.isLoading
              ? "Loading…"
              : "No forms yet. Create your first form."
          }
          onRowClick={handleRowClick}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Submissions</CardTitle>
              {selectedFormId && (
                <select
                  className="h-9 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(Number(e.target.value))}
                >
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              )}
              {!selectedFormId && (
                <p className="text-sm text-gray-500">
                  Click a form in the Forms tab to view its submissions.
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedFormId ? (
              <SubmissionsPanel formId={selectedFormId} />
            ) : (
              <p className="py-6 text-center text-sm text-gray-400">
                Select a form to view submissions.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
