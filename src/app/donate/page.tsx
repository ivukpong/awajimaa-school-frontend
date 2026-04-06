"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  TrendingUp,
  Users,
  HandHeart,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useDonationStats,
  useDonations,
  useCreateDonation,
  type DonationPayload,
} from "@/hooks/useDonation";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";

// ─── Stat tile ────────────────────────────────────────────────────────────────

function BigStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div
        className={`h-12 w-12 rounded-2xl ${accent} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Donor row ────────────────────────────────────────────────────────────────

function DonorRow({
  name,
  amount,
  currency,
  message,
  date,
}: {
  name: string | null;
  amount: number;
  currency: string;
  message: string | null;
  date: string;
}) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "A";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {name || "Anonymous"}
          </span>
          <span className="text-green-600 font-bold text-sm shrink-0">
            {currency.toUpperCase()} {Number(amount).toLocaleString()}
          </span>
        </div>
        {message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Status banner (uses useSearchParams → must be in Suspense) ──────────────

function StatusBanners() {
  const searchParams = useSearchParams();
  const justSucceeded = searchParams.get("success") === "1";
  const wasCancelled = searchParams.get("cancelled") === "1";

  if (!justSucceeded && !wasCancelled) return null;

  return (
    <>
      {justSucceeded && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
          <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">
              Thank you for your donation!
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              Your payment was successful. Our team will allocate the funds to
              a student in need. You&apos;ll receive a confirmation by email.
            </p>
          </div>
        </div>
      )}
      {wasCancelled && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-700">
            Your donation was not completed. Feel free to try again whenever
            you&apos;re ready.
          </p>
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DonatePage() {
  const { data: stats, isLoading: statsLoading } = useDonationStats();
  const { data: donationsRes } = useDonations();
  const { mutateAsync: createDonation, isPending } = useCreateDonation();

  const [form, setForm] = useState<DonationPayload>({
    donor_name: "",
    donor_email: "",
    amount: 25,
    currency: "USD",
    message: "",
    is_anonymous: false,
  });

  const donations = donationsRes?.data?.data ?? [];

  const fmt = (n?: number) =>
    n == null
      ? "—"
      : n >= 1_000_000
        ? `$${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
          ? `$${(n / 1_000).toFixed(1)}k`
          : `$${n.toLocaleString()}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.amount || form.amount < 1) {
      toast.error("Please enter a valid donation amount.");
      return;
    }

    try {
      const res = await createDonation(form);
      const payload = (res as any)?.data ?? res;
      if (payload?.checkout_url) {
        window.location.href = payload.checkout_url;
      } else {
        toast.success(
          payload?.message || "Donation recorded! We will follow up shortly."
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Mini Nav ─── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Logo height={30} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ─── Status banners ─── */}
        <Suspense fallback={null}>
          <StatusBanners />
        </Suspense>

        {/* ─── Hero headline ─── */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-green-500 fill-green-500" />
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">
              Donation Wallet
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Fund a Student&apos;s Education
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">
            Your contribution goes directly to paying school fees for students
            who cannot afford it. Every naira and dollar makes a real
            difference.
          </p>
        </div>

        {/* ─── Stats grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <BigStat
            label="Total Donated"
            value={statsLoading ? "..." : fmt(stats?.data?.total_donated)}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            accent="bg-green-500"
          />
          <BigStat
            label="Available Balance"
            value={statsLoading ? "..." : fmt(stats?.data?.balance_remaining)}
            icon={<Heart className="h-6 w-6 text-white" />}
            accent="bg-brand"
          />
          <BigStat
            label="Students Helped"
            value={statsLoading ? "..." : String(stats?.data?.students_paid ?? "—")}
            icon={<Users className="h-6 w-6 text-white" />}
            accent="bg-blue-500"
          />
          <BigStat
            label="Total Donations"
            value={statsLoading ? "..." : String(stats?.data?.sponsors_count ?? "—")}
            icon={<HandHeart className="h-6 w-6 text-white" />}
            accent="bg-purple-500"
          />
        </div>

        {/* ─── Two-column layout: form + donors ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Donation Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Make a Donation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick amount selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose an amount
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[10, 25, 50, 100, 250].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, amount: preset }))}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                        form.amount === preset
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Custom amount"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        currency: e.target.value as "USD" | "NGN",
                      }))
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="USD">USD</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_anonymous}
                  onClick={() =>
                    setForm((f) => ({ ...f, is_anonymous: !f.is_anonymous }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
                    form.is_anonymous ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.is_anonymous ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  Donate anonymously
                </span>
              </div>

              {/* Name & Email — shown only if not anonymous */}
              {!form.is_anonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.donor_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, donor_name: e.target.value }))
                      }
                      placeholder="John Doe"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.donor_email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, donor_email: e.target.value }))
                      }
                      placeholder="john@example.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Share a word of encouragement..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Donate {form.currency === "USD" ? "$" : "₦"}
                    {Number(form.amount || 0).toLocaleString()} →
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Payments are processed securely via Stripe. Your donation is
                non-refundable.
              </p>
            </form>
          </div>

          {/* Donors list */}
          <div
            id="donors"
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Donors
            </h2>
            {donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <HandHeart className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">
                  No donations yet. Be the first to give!
                </p>
              </div>
            ) : (
              <div>
                {donations.map((d) => (
                  <DonorRow
                    key={d.id}
                    name={d.is_anonymous ? null : d.donor_name}
                    amount={d.amount}
                    currency={d.currency}
                    message={d.message}
                    date={d.created_at}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
