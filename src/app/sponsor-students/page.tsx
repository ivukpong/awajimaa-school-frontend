"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  School,
  CheckCircle2,
  ShoppingCart,
  ArrowLeft,
  Loader2,
  HeartHandshake,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
  useFeaturedStudents,
  type FeaturedStudent,
} from "@/hooks/useSponsorshipCart";
import { useSponsorshipCartStore } from "@/store/sponsorshipCartStore";
import toast from "react-hot-toast";

const FMT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

// ─── Student Card ─────────────────────────────────────────────────────────────

function StudentCard({
  student,
  selected,
  onToggle,
}: {
  student: FeaturedStudent;
  selected: boolean;
  onToggle: (s: FeaturedStudent) => void;
}) {
  const initials = student.gender === "female" ? "F" : "M";
  const firstNameMasked = student.user?.name
    ? student.user.name.split(" ")[0].charAt(0).toUpperCase() + "****"
    : initials + "****";

  return (
    <button
      onClick={() => onToggle(student)}
      className={`relative text-left rounded-2xl border-2 p-4 transition-all focus:outline-none ${
        selected
          ? "border-brand bg-brand/5 shadow-md"
          : "border-gray-100 bg-white hover:border-brand/40 hover:shadow-sm"
      }`}
    >
      {/* Checkmark */}
      {selected && (
        <span className="absolute top-3 right-3 text-brand">
          <CheckCircle2 size={20} fill="currentColor" />
        </span>
      )}

      {/* Photo / avatar */}
      <div className="relative mx-auto mb-3 h-20 w-20 rounded-full overflow-hidden bg-gray-100">
        {student.profile_photo ? (
          <Image
            src={student.profile_photo}
            alt="Student"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <User size={36} />
          </div>
        )}
      </div>

      {/* Name (masked) */}
      <p className="font-semibold text-gray-900 text-center truncate">
        {firstNameMasked}
      </p>

      {/* School */}
      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
        <School size={12} />
        <span className="truncate">{student.school?.name}</span>
      </div>

      {/* Class */}
      {student.current_class && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <GraduationCap size={12} />
          <span>{student.current_class.name}</span>
        </div>
      )}

      {/* State */}
      {student.school?.state && (
        <p className="mt-0.5 text-xs text-gray-400">
          {student.school.state.name}
        </p>
      )}

      {/* Reason excerpt */}
      {student.needy_reason && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
          "{student.needy_reason}"
        </p>
      )}

      {/* Amount */}
      <p className="mt-3 text-sm font-bold text-brand">
        {FMT.format(student.suggested_amount || 5000)}
      </p>
    </button>
  );
}

// ─── Cart Bottom Bar ──────────────────────────────────────────────────────────

function CartBar({
  count,
  total,
  onCheckout,
}: {
  count: number;
  total: number;
  onCheckout: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-3">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white font-bold text-sm">
            {count}
          </span>
          <div>
            <p className="text-xs text-gray-500">Students selected</p>
            <p className="font-bold text-gray-900">{FMT.format(total)}</p>
          </div>
        </div>
        <Button
          onClick={onCheckout}
          size="lg"
          leftIcon={<ShoppingCart size={18} />}
        >
          Sponsor Now
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SponsorStudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useFeaturedStudents({
    page,
    per_page: 12,
  });

  const {
    items,
    addStudent,
    removeStudent,
    totalStudents,
    subtotal,
    isExpired,
    clearCart,
  } = useSponsorshipCartStore();

  // Clear expired cart on mount
  useEffect(() => {
    if (isExpired()) clearCart();
  }, []);

  const selectedIds = new Set(items.map((i) => i.student.id));

  const filteredStudents = (data?.data?.data ?? []).filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.school?.name?.toLowerCase().includes(q) ||
      s.school?.state?.name?.toLowerCase().includes(q) ||
      s.current_class?.name?.toLowerCase().includes(q) ||
      s.needy_reason?.toLowerCase().includes(q)
    );
  });

  function handleToggle(student: FeaturedStudent) {
    if (selectedIds.has(student.id)) {
      removeStudent(student.id);
    } else {
      addStudent(student);
      toast.success("Added to your sponsorship cart");
    }
  }

  function handleCheckout() {
    if (totalStudents() === 0) return;
    router.push("/sponsor-students/checkout");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            {totalStudents() > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
                {totalStudents()}
              </span>
            )}
            <ShoppingCart size={20} className="text-gray-500" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand/90 to-brand-dark px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <HeartHandshake size={40} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-extrabold">Sponsor a Student</h1>
          <p className="mt-2 text-brand-100 max-w-xl mx-auto text-sm">
            Select one or more students to sponsor their education. Your
            contribution goes directly to their school fees.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 pb-32">
        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter by school, state, class…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-gray-500">
              Could not load students. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <GraduationCap size={40} className="text-gray-300" />
            <p className="text-gray-500">No featured students found.</p>
          </div>
        )}

        {/* Grid */}
        {filteredStudents.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-4">
              Showing {filteredStudents.length} student
              {filteredStudents.length !== 1 ? "s" : ""}
              {data?.data && ` of ${data.data.total} total`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  selected={selectedIds.has(student.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {data?.data && data.data.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {data.data.last_page}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.data.last_page, p + 1))
                  }
                  disabled={page === data.data.last_page}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky cart */}
      <CartBar
        count={totalStudents()}
        total={subtotal()}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
