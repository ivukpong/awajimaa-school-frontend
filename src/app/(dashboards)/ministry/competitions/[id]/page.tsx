"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Plus,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Medal,
  Users,
  Calendar,
  MapPin,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, del } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrizeStructure {
  first?: string;
  second?: string;
  third?: string;
}

interface Competition {
  id: number;
  title: string;
  description?: string;
  competition_type: string;
  scope: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  venue?: string;
  prize_structure?: PrizeStructure;
  total_prize_pool: number | string;
  status: string;
  banner_url?: string;
  rules?: string;
}

interface EntrySchool {
  id: number;
  name: string;
}

interface EntryStudent {
  id: number;
  name: string;
}

interface CompetitionEntry {
  id: number;
  competition_id: number;
  school?: EntrySchool;
  student?: EntryStudent;
  participant_name: string;
  category?: string;
  score?: number | null;
  rank?: number | null;
  prize_position?: number | null;
  prize_category?: string | null;
  prize_amount?: number | null;
  status: string;
  notes?: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  string,
  "gray" | "green" | "blue" | "purple" | "red" | "yellow"
> = {
  draft: "gray",
  open: "green",
  ongoing: "blue",
  completed: "purple",
  cancelled: "red",
};

const TYPE_VARIANT: Record<
  string,
  "blue" | "green" | "purple" | "yellow" | "red" | "gray"
> = {
  debate: "blue",
  science: "green",
  sports: "red",
  arts: "purple",
  math: "yellow",
  cultural: "yellow",
  other: "gray",
};

const ENTRY_STATUS_VARIANT: Record<
  string,
  "gray" | "blue" | "yellow" | "green"
> = {
  registered: "gray",
  scored: "blue",
  ranked: "yellow",
  awarded: "green",
};

const PRIZE_POSITION_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const EMPTY_ENTRY_FORM = {
  participant_name: "",
  school_id: "",
  student_id: "",
  category: "",
  score: "",
  rank: "",
  prize_position: "",
  prize_category: "",
  prize_amount: "",
  status: "registered",
  notes: "",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<CompetitionEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<CompetitionEntry | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ENTRY_FORM });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const {
    data: competition,
    isLoading: compLoading,
    error: compError,
  } = useQuery<Competition>({
    queryKey: ["ministry-competition", id],
    queryFn: () =>
      get<Competition>(`/ministry/competitions/${id}`).then((r) => r.data),
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<
    CompetitionEntry[]
  >({
    queryKey: ["competition-entries", id],
    queryFn: () =>
      get<CompetitionEntry[]>(`/ministry/competitions/${id}/entries`).then(
        (r) => r.data,
      ),
    enabled: !!id,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["competition-entries", id] });
    queryClient.invalidateQueries({ queryKey: ["ministry-competition", id] });
  };

  const addMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      post<CompetitionEntry>(
        `/ministry/competitions/${id}/entries`,
        payload,
      ).then((r) => r.data),
    onSuccess: () => {
      toast.success("Entry added");
      setAddOpen(false);
      setForm({ ...EMPTY_ENTRY_FORM });
      invalidate();
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const editMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      patch<CompetitionEntry>(
        `/ministry/competitions/${id}/entries/${editEntry!.id}`,
        payload,
      ).then((r) => r.data),
    onSuccess: () => {
      toast.success("Entry updated");
      setEditEntry(null);
      setForm({ ...EMPTY_ENTRY_FORM });
      invalidate();
    },
    onError: () => toast.error("Failed to update entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      del(`/ministry/competitions/${id}/entries/${deleteEntry!.id}`),
    onSuccess: () => {
      toast.success("Entry removed");
      setDeleteEntry(null);
      invalidate();
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openAdd() {
    setForm({ ...EMPTY_ENTRY_FORM });
    setAddOpen(true);
  }

  function openEdit(entry: CompetitionEntry) {
    setForm({
      participant_name: entry.participant_name,
      school_id: entry.school?.id?.toString() ?? "",
      student_id: entry.student?.id?.toString() ?? "",
      category: entry.category ?? "",
      score: entry.score != null ? String(entry.score) : "",
      rank: entry.rank != null ? String(entry.rank) : "",
      prize_position:
        entry.prize_position != null ? String(entry.prize_position) : "",
      prize_category: entry.prize_category ?? "",
      prize_amount:
        entry.prize_amount != null ? String(entry.prize_amount) : "",
      status: entry.status,
      notes: entry.notes ?? "",
    });
    setEditEntry(entry);
  }

  function buildPayload() {
    return {
      participant_name: form.participant_name,
      school_id: form.school_id ? Number(form.school_id) : null,
      student_id: form.student_id ? Number(form.student_id) : null,
      category: form.category || null,
      score: form.score !== "" ? Number(form.score) : null,
      rank: form.rank !== "" ? Number(form.rank) : null,
      prize_position:
        form.prize_position !== "" ? Number(form.prize_position) : null,
      prize_category: form.prize_category || null,
      prize_amount: form.prize_amount !== "" ? Number(form.prize_amount) : null,
      status: form.status,
      notes: form.notes || null,
    };
  }

  function handleSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    addMutation.mutate(buildPayload());
  }

  function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    editMutation.mutate(buildPayload());
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (compLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (compError || !competition) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load competition.</span>
      </div>
    );
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const fmtAmount = (v: number | string | null | undefined) =>
    v != null
      ? Number(v).toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN",
        })
      : "—";

  const canPublish = competition.status === "ongoing";

  // ── Entry form fields ──────────────────────────────────────────────────────

  const EntryForm = ({
    onSubmit,
    loading,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Participant Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.participant_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, participant_name: e.target.value }))
          }
          placeholder="Full name or team name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School ID
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.school_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, school_id: e.target.value }))
            }
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student ID
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.student_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, student_id: e.target.value }))
            }
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder="e.g. U-15, Senior"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.score}
            onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rank
          </label>
          <input
            type="number"
            min="1"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.rank}
            onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
            placeholder="Overall rank"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Position
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.prize_position}
            onChange={(e) =>
              setForm((f) => ({ ...f, prize_position: e.target.value }))
            }
          >
            <option value="">None</option>
            <option value="1">1st Place</option>
            <option value="2">2nd Place</option>
            <option value="3">3rd Place</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Category
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.prize_category}
            onChange={(e) =>
              setForm((f) => ({ ...f, prize_category: e.target.value }))
            }
            placeholder="e.g. Best Essay"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Amount (₦)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.prize_amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, prize_amount: e.target.value }))
            }
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="registered">Registered</option>
          <option value="scored">Scored</option>
          <option value="ranked">Ranked</option>
          <option value="awarded">Awarded</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setAddOpen(false);
            setEditEntry(null);
            setForm({ ...EMPTY_ENTRY_FORM });
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Entry
        </Button>
      </div>
    </form>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/ministry/competitions"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Competitions
      </Link>

      {/* Competition header */}
      <Card>
        {competition.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={competition.banner_url}
            alt={competition.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
              <CardTitle className="text-xl">{competition.title}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={TYPE_VARIANT[competition.competition_type] ?? "gray"}
              >
                {competition.competition_type.charAt(0).toUpperCase() +
                  competition.competition_type.slice(1)}
              </Badge>
              <Badge variant="gray">{competition.scope}</Badge>
              <Badge variant={STATUS_VARIANT[competition.status] ?? "gray"}>
                {competition.status.charAt(0).toUpperCase() +
                  competition.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {competition.description && (
            <p className="text-sm text-gray-600">{competition.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Start</div>
                <div>{fmt(competition.start_date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium text-gray-900">End</div>
                <div>{fmt(competition.end_date)}</div>
              </div>
            </div>
            {competition.registration_deadline && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Registration</div>
                  <div>{fmt(competition.registration_deadline)}</div>
                </div>
              </div>
            )}
            {competition.venue && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Venue</div>
                  <div>{competition.venue}</div>
                </div>
              </div>
            )}
          </div>

          {/* Prize pool */}
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-yellow-500 shrink-0" />
            <span className="font-medium text-gray-900">Total Prize Pool:</span>
            <span className="text-gray-700">
              {fmtAmount(competition.total_prize_pool)}
            </span>
          </div>

          {competition.prize_structure && (
            <div className="flex flex-wrap gap-4 text-sm">
              {competition.prize_structure.first && (
                <div className="flex items-center gap-1.5">
                  <Medal className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">1st:</span>
                  <span className="text-gray-700">
                    {competition.prize_structure.first}
                  </span>
                </div>
              )}
              {competition.prize_structure.second && (
                <div className="flex items-center gap-1.5">
                  <Medal className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">2nd:</span>
                  <span className="text-gray-700">
                    {competition.prize_structure.second}
                  </span>
                </div>
              )}
              {competition.prize_structure.third && (
                <div className="flex items-center gap-1.5">
                  <Medal className="h-4 w-4 text-amber-700" />
                  <span className="font-medium">3rd:</span>
                  <span className="text-gray-700">
                    {competition.prize_structure.third}
                  </span>
                </div>
              )}
            </div>
          )}

          {competition.rules && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                Rules & Guidelines
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {competition.rules}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entries section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <CardTitle>Entries</CardTitle>
            <span className="ml-1 text-sm text-gray-500">
              ({entries.length})
            </span>
          </div>
          <div className="flex gap-2">
            {canPublish && (
              <Button
                variant="secondary"
                onClick={() => setPublishOpen(true)}
                className="text-sm"
              >
                <Trophy className="h-4 w-4 mr-1.5" />
                Publish Results
              </Button>
            )}
            <Button onClick={openAdd} className="text-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {entriesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
              <Users className="h-8 w-8" />
              <p className="text-sm">
                No entries yet. Add the first participant.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Participant
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      School
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Score
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Rank
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">
                      Position
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Prize Cat.
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Prize (₦)
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {entry.participant_name}
                        {entry.student && (
                          <div className="text-xs text-gray-400">
                            {entry.student.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.school?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {entry.score != null
                          ? Number(entry.score).toFixed(2)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {entry.rank ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.prize_position ? (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
                              entry.prize_position === 1 &&
                                "bg-yellow-100 text-yellow-700",
                              entry.prize_position === 2 &&
                                "bg-gray-100 text-gray-700",
                              entry.prize_position === 3 &&
                                "bg-amber-100 text-amber-700",
                            )}
                          >
                            {PRIZE_POSITION_LABEL[entry.prize_position]}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.prize_category ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {entry.prize_amount != null
                          ? Number(entry.prize_amount).toLocaleString("en-NG")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={ENTRY_STATUS_VARIANT[entry.status] ?? "gray"}
                        >
                          {entry.status.charAt(0).toUpperCase() +
                            entry.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => openEdit(entry)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs text-red-500 hover:underline"
                            onClick={() => setDeleteEntry(entry)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Entry Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm({ ...EMPTY_ENTRY_FORM });
        }}
        title="Add Entry"
      >
        <EntryForm onSubmit={handleSubmitAdd} loading={addMutation.isPending} />
      </Modal>

      {/* ── Edit Entry Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={!!editEntry}
        onClose={() => {
          setEditEntry(null);
          setForm({ ...EMPTY_ENTRY_FORM });
        }}
        title="Edit Entry"
      >
        <EntryForm
          onSubmit={handleSubmitEdit}
          loading={editMutation.isPending}
        />
      </Modal>

      {/* ── Delete Entry Confirm ──────────────────────────────────────────────── */}
      <Modal
        open={!!deleteEntry}
        onClose={() => setDeleteEntry(null)}
        title="Remove Entry"
      >
        <p className="text-sm text-gray-600 mb-4">
          Remove{" "}
          <span className="font-semibold">{deleteEntry?.participant_name}</span>{" "}
          from this competition?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteEntry(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Remove
          </Button>
        </div>
      </Modal>

      {/* ── Publish Results Confirm ───────────────────────────────────────────── */}
      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish Results"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600">
            Publishing results will mark the competition as{" "}
            <span className="font-semibold">completed</span>. Prize amounts will
            be debited from the ministry wallet for all awarded entries. This
            cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPublishOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              post(`/ministry/competitions/${id}/publish-results`, {})
                .then(() => {
                  toast.success("Results published");
                  setPublishOpen(false);
                  invalidate();
                })
                .catch(() => toast.error("Failed to publish results"));
            }}
          >
            <Trophy className="h-4 w-4 mr-1.5" />
            Confirm &amp; Publish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
