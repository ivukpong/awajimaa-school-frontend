"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, del } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LGA {
  id: number;
  name: string;
}

interface School {
  id: number;
  name: string;
}

interface PrizeStructure {
  first: string;
  second: string;
  third: string;
}

interface Competition {
  id: number;
  title: string;
  description?: string;
  competition_type: string;
  scope: string;
  lga_ids?: number[];
  school_ids?: number[];
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

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "debate", label: "Debate" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "math", label: "Mathematics" },
  { value: "cultural", label: "Cultural" },
  { value: "other", label: "Other" },
];

const SCOPE_OPTIONS = [
  { value: "statewide", label: "Statewide" },
  { value: "lga", label: "Selected LGAs" },
  { value: "school", label: "Selected Schools" },
];

const STATUS_VARIANT: Record<
  string,
  "gray" | "green" | "blue" | "purple" | "red"
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

const EMPTY_PRIZES: PrizeStructure = { first: "", second: "", third: "" };

const EMPTY_FORM = {
  title: "",
  description: "",
  competition_type: "debate",
  scope: "statewide",
  lga_ids: [] as number[],
  school_ids: [] as number[],
  start_date: "",
  end_date: "",
  registration_deadline: "",
  venue: "",
  prize_structure: { ...EMPTY_PRIZES },
  total_prize_pool: "0",
  status: "draft",
  banner_url: "",
  rules: "",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function MinistryCompetitionsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ─── Data ──────────────────────────────────────────────────────────────

  const { data: compData, isLoading } = useQuery<{ data: Competition[] }>({
    queryKey: ["ministry-competitions"],
    queryFn: () =>
      get<{ data: Competition[] }>("/ministry/competitions").then(
        (r) => r.data,
      ),
  });

  const { data: walletData } = useQuery<{ balance: number; currency: string }>({
    queryKey: ["ministry-wallet-balance"],
    queryFn: () =>
      get<{ balance: number; currency: string }>(
        "/ministry/wallet/balance",
      ).then((r) => r.data),
  });

  const { data: lgaData } = useQuery<{ data: LGA[] }>({
    queryKey: ["lgas"],
    queryFn: () => get<{ data: LGA[] }>("/lgas").then((r) => r.data),
  });

  const { data: schoolData } = useQuery<{ data: School[] }>({
    queryKey: ["schools"],
    queryFn: () => get<{ data: School[] }>("/schools").then((r) => r.data),
    enabled: form.scope === "school",
  });

  const competitions = compData?.data ?? [];
  const lgas = lgaData?.data ?? [];
  const schools = schoolData?.data ?? [];
  const walletBalance = walletData?.balance ?? 0;
  const prizePool = parseFloat(form.total_prize_pool || "0");

  // ─── Mutations ─────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/competitions", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-competitions"] });
      qc.invalidateQueries({ queryKey: ["ministry-wallet-balance"] });
      toast.success("Competition created.");
      closeModal();
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to create competition."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: typeof EMPTY_FORM }) =>
      patch(`/ministry/competitions/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-competitions"] });
      qc.invalidateQueries({ queryKey: ["ministry-wallet-balance"] });
      toast.success("Competition updated.");
      closeModal();
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to update competition."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/ministry/competitions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-competitions"] });
      qc.invalidateQueries({ queryKey: ["ministry-wallet-balance"] });
      toast.success("Competition deleted.");
      setDeletingId(null);
    },
    onError: () => toast.error("Failed to delete competition."),
  });

  // ─── Helpers ───────────────────────────────────────────────────────────

  function recalcTotal(prizes: PrizeStructure) {
    const sum =
      (parseFloat(prizes.first) || 0) +
      (parseFloat(prizes.second) || 0) +
      (parseFloat(prizes.third) || 0);
    setForm((f) => ({
      ...f,
      prize_structure: prizes,
      total_prize_pool: sum.toFixed(2),
    }));
  }

  function setPrize(pos: keyof PrizeStructure, val: string) {
    const updated = { ...form.prize_structure, [pos]: val };
    recalcTotal(updated);
  }

  function toggleMulti(key: "lga_ids" | "school_ids", id: number) {
    setForm((f) => {
      const arr = f[key] as number[];
      return {
        ...f,
        [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
      };
    });
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, prize_structure: { ...EMPTY_PRIZES } });
    setShowModal(true);
  }

  function openEdit(c: Competition) {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description ?? "",
      competition_type: c.competition_type,
      scope: c.scope,
      lga_ids: c.lga_ids ?? [],
      school_ids: c.school_ids ?? [],
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
      registration_deadline: c.registration_deadline ?? "",
      venue: c.venue ?? "",
      prize_structure: c.prize_structure ?? { ...EMPTY_PRIZES },
      total_prize_pool: String(c.total_prize_pool ?? "0"),
      status: c.status,
      banner_url: c.banner_url ?? "",
      rules: c.rules ?? "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM, prize_structure: { ...EMPTY_PRIZES } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.start_date) return toast.error("Start date is required.");
    if (!form.end_date) return toast.error("End date is required.");

    if (
      !editing &&
      form.status === "open" &&
      prizePool > 0 &&
      prizePool > walletBalance
    ) {
      return toast.error(
        `Insufficient wallet balance. You need ₦${prizePool.toLocaleString()} but have ₦${walletBalance.toLocaleString()}.`,
      );
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Competitions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organise statewide or targeted academic competitions with prize
            funding from the ministry wallet.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {walletData && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Wallet Balance</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                ₦{Number(walletBalance).toLocaleString()}
              </p>
            </div>
          )}
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Competition
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitions ({competitions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : competitions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Trophy className="h-10 w-10 mb-3" />
              <p className="text-sm">No competitions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    {[
                      "Title",
                      "Type",
                      "Scope",
                      "Dates",
                      "Prize Pool",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitions.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={TYPE_VARIANT[c.competition_type] ?? "gray"}
                        >
                          {TYPE_OPTIONS.find(
                            (t) => t.value === c.competition_type,
                          )?.label ?? c.competition_type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="gray">
                          {SCOPE_OPTIONS.find((s) => s.value === c.scope)
                            ?.label ?? c.scope}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {c.start_date} → {c.end_date}
                      </td>
                      <td className="py-3 pr-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        ₦{Number(c.total_prize_pool).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[c.status] ?? "gray"}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          {c.status !== "ongoing" &&
                            c.status !== "completed" && (
                              <button
                                onClick={() => setDeletingId(c.id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
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

      {/* Delete confirm */}
      <Modal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete Competition"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this competition? This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editing ? "Edit Competition" : "New Competition"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[80vh] overflow-y-auto pr-1"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. State Debate Championship 2025"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Type + Scope */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Competition Type
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.competition_type}
                onChange={(e) =>
                  setForm({ ...form, competition_type: e.target.value })
                }
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scope
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.scope}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scope: e.target.value,
                    lga_ids: [],
                    school_ids: [],
                  })
                }
              >
                {SCOPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LGA multi-select */}
          {form.scope === "lga" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select LGAs
              </label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-1 dark:border-gray-700">
                {lgas.map((l) => (
                  <label
                    key={l.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.lga_ids.includes(l.id)}
                      onChange={() => toggleMulti("lga_ids", l.id)}
                      className="rounded"
                    />
                    <span className="dark:text-gray-300">{l.name}</span>
                  </label>
                ))}
                {lgas.length === 0 && (
                  <p className="text-xs text-gray-400 col-span-2">
                    No LGAs available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* School multi-select */}
          {form.scope === "school" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Schools
              </label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-1 gap-1 dark:border-gray-700">
                {schools.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.school_ids.includes(s.id)}
                      onChange={() => toggleMulti("school_ids", s.id)}
                      className="rounded"
                    />
                    <span className="dark:text-gray-300">{s.name}</span>
                  </label>
                ))}
                {schools.length === 0 && (
                  <p className="text-xs text-gray-400">Loading schools…</p>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reg. Deadline
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={form.registration_deadline}
                onChange={(e) =>
                  setForm({ ...form, registration_deadline: e.target.value })
                }
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Venue
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Government College, Port Harcourt"
            />
          </div>

          {/* Prize Structure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prize Structure (₦)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["first", "second", "third"] as (keyof PrizeStructure)[]).map(
                (pos) => (
                  <div key={pos}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                      {pos} Place
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={form.prize_structure[pos]}
                      onChange={(e) => setPrize(pos, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                ),
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Prize Pool</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ₦{Number(form.total_prize_pool).toLocaleString()}
              </span>
            </div>
            {/* Wallet warning */}
            {prizePool > 0 && prizePool > walletBalance && (
              <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Insufficient wallet balance. You need ₦
                  {prizePool.toLocaleString()} but only have ₦
                  {walletBalance.toLocaleString()}. Funds are only reserved when
                  status is <strong>Open</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="open">
                Open (publishes &amp; reserves prizes)
              </option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Banner URL
            </label>
            <input
              type="url"
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.banner_url}
              onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rules / Guidelines
            </label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              placeholder="Competition rules, eligibility, format..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create Competition"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
