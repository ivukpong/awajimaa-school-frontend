"use client";
import React, { useState } from "react";
import { BookOpen, Clock, DollarSign, Tag, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  useTeachingGigs,
  useProposeOnGig,
  useMyGigProposals,
} from "@/hooks/useTeachingGigs";
import { useFreelancerProfile } from "@/hooks/useFreelancer";
import toast from "react-hot-toast";
import type { TeachingGig } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  TeachingGig["status"],
  {
    label: string;
    variant: "green" | "blue" | "yellow" | "red" | "gray" | "purple";
  }
> = {
  open: { label: "Open", variant: "green" },
  funded: { label: "Funded", variant: "blue" },
  assigned: { label: "Assigned", variant: "blue" },
  in_progress: { label: "In Progress", variant: "yellow" },
  completed: { label: "Completed", variant: "green" },
  cancelled: { label: "Cancelled", variant: "gray" },
  disputed: { label: "Disputed", variant: "red" },
};

// ── Gig Card ─────────────────────────────────────────────────────────────────

function GigCard({
  gig,
  onApply,
}: {
  gig: TeachingGig;
  onApply: (gig: TeachingGig) => void;
}) {
  const st = STATUS_BADGE[gig.status];
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {gig.title}
          </h3>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>

        {gig.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {gig.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Tag size={12} /> {gig.subject}
          </span>
          {gig.level && (
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {gig.level}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} /> {gig.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={12} /> ${gig.budget_usd}
          </span>
        </div>

        {gig.status === "open" && (
          <button
            onClick={() => onApply(gig)}
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Apply Now <ChevronRight size={14} />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Proposal Modal ────────────────────────────────────────────────────────────

function ProposalModal({
  gig,
  onClose,
}: {
  gig: TeachingGig;
  onClose: () => void;
}) {
  const propose = useProposeOnGig();
  const [priceUsd, setPriceUsd] = useState(gig.budget_usd.toString());
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    propose.mutate(
      {
        gigId: gig.id,
        proposed_price_usd: parseFloat(priceUsd),
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Proposal submitted!");
          onClose();
        },
        onError: (err: unknown) =>
          toast.error((err as Error)?.message ?? "Failed to submit proposal"),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Apply for Gig
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{gig.title}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proposed Price (USD)
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Client budget: ${gig.budget_usd}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Introduce yourself and explain why you're the right teacher…"
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={propose.isPending}
              className="flex-1 bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {propose.isPending ? "Submitting…" : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "subjects" | "all" | "proposals";

export default function TeacherGigsPage() {
  const [tab, setTab] = useState<Tab>("subjects");
  const [selectedGig, setSelectedGig] = useState<TeachingGig | null>(null);

  const { data: profileRes } = useFreelancerProfile();
  const subjects: string[] = profileRes?.data?.subjects ?? [];

  const { data: subjectGigsRes, isLoading: loadingSubject } = useTeachingGigs({
    status: "open",
    subject: subjects.join(","),
  });
  const { data: allGigsRes, isLoading: loadingAll } = useTeachingGigs({
    status: "open",
  });
  const { data: proposalsRes, isLoading: loadingProposals } =
    useMyGigProposals();

  const subjectGigs = subjectGigsRes?.data?.data ?? [];
  const allGigs = allGigsRes?.data?.data ?? [];
  const myProposals = proposalsRes?.data?.data ?? [];

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "subjects", label: "My Subjects", count: subjectGigs.length },
    { key: "all", label: "All Open Gigs", count: allGigs.length },
    { key: "proposals", label: "My Proposals", count: myProposals.length },
  ];

  const isLoading =
    (tab === "subjects" && loadingSubject) ||
    (tab === "all" && loadingAll) ||
    (tab === "proposals" && loadingProposals);

  const currentGigs =
    tab === "subjects"
      ? subjectGigs
      : tab === "all"
        ? allGigs
        : (myProposals as unknown as TeachingGig[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Teaching Gigs
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Subject hint */}
      {tab === "subjects" && subjects.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-300">
          You have no subjects set on your profile. Update your{" "}
          <a
            href="/freelancer-teacher/profile"
            className="underline font-medium"
          >
            profile
          </a>{" "}
          to see relevant gigs here.
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading gigs…</div>
      ) : currentGigs.length === 0 ? (
        <div className="text-sm text-gray-500">
          {tab === "proposals"
            ? "You have not submitted any proposals yet."
            : "No open gigs found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} onApply={setSelectedGig} />
          ))}
        </div>
      )}

      {selectedGig && (
        <ProposalModal gig={selectedGig} onClose={() => setSelectedGig(null)} />
      )}
    </div>
  );
}
