"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  HeartHandshake,
  Trash2,
  AlertCircle,
  Lock,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSponsorshipCartStore } from "@/store/sponsorshipCartStore";
import {
  useCreateSponsorshipOrder,
  useCheckoutOrder,
  useVerifySponsorshipOrder,
  type SponsorshipOrder,
} from "@/hooks/useSponsorshipCart";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const FMT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const GATEWAYS = [
  {
    id: "paystack",
    label: "Paystack",
    description: "Card, Bank Transfer, USSD",
  },
  { id: "squad", label: "Squad", description: "Card, Bank Transfer" },
  { id: "interswitch", label: "Interswitch", description: "Card (WebPay)" },
];

const FEE_INFO: Record<string, string> = {
  paystack: "1.5% + ₦100 (capped at ₦2,000)",
  squad: "1.5%",
  interswitch: "1.5% + ₦100",
};

// ─── Gateway fee preview (client-side approximation) ─────────────────────────

function estimateFee(subtotal: number, gateway: string): number {
  if (gateway === "paystack") {
    const fee = subtotal * 0.015 + 100;
    return Math.min(fee, 2000);
  }
  if (gateway === "squad") return subtotal * 0.015;
  if (gateway === "interswitch") return Math.max(subtotal * 0.015 + 100, 22);
  return 0;
}

// ─── Verification result screen ───────────────────────────────────────────────

function VerifyScreen({ reference }: { reference: string }) {
  const { data, isLoading } = useVerifySponsorshipOrder(reference);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader2 size={40} className="animate-spin text-brand" />
        <p className="text-gray-500">Confirming your payment…</p>
      </div>
    );
  }

  const order = data?.data?.order;
  const isPaid = order?.status === "paid";

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      {isPaid ? (
        <>
          <CheckCircle2 size={56} className="text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Confirmed!
          </h2>
          <p className="text-gray-500 max-w-sm">
            Thank you! A confirmation email has been sent to{" "}
            <strong>{order.sponsor_email}</strong>.
          </p>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow p-5 text-left space-y-2">
            <Row label="Reference" value={order.reference} />
            <Row label="Gateway" value={order.gateway} />
            <Row label="Total" value={FMT.format(order.total)} />
            <Row label="Students" value={String(order.items?.length ?? 0)} />
          </div>
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </>
      ) : (
        <>
          <XCircle size={56} className="text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Unsuccessful
          </h2>
          <p className="text-gray-500">
            We couldn't confirm your payment. Please try again.
          </p>
          <Link href="/sponsor-students/checkout">
            <Button size="lg">Try Again</Button>
          </Link>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 capitalize">{value}</span>
    </div>
  );
}

// ─── Checkout inner component (uses useSearchParams) ─────────────────────────

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceParam = searchParams.get("ref");

  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    removeStudent,
    updateAmount,
    clearCart,
    subtotal,
    totalStudents,
    isExpired,
  } = useSponsorshipCartStore();

  const [gateway, setGateway] = useState("paystack");
  const [pendingOrder, setPendingOrder] = useState<SponsorshipOrder | null>(
    null,
  );
  const [step, setStep] = useState<"cart" | "contact" | "pay">("cart");
  const [contact, setContact] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [contactErrors, setContactErrors] = useState<Partial<typeof contact>>(
    {},
  );

  const createOrder = useCreateSponsorshipOrder();
  const checkoutOrder = useCheckoutOrder(pendingOrder?.id ?? 0);

  // If URL has a verification reference — show verify screen
  if (referenceParam) {
    return <VerifyScreen reference={referenceParam} />;
  }

  // If cart is empty/expired
  if (isExpired()) {
    clearCart();
  }
  if (totalStudents() === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <HeartHandshake size={48} className="text-gray-300" />
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/sponsor-students">
          <Button>Browse Students</Button>
        </Link>
      </div>
    );
  }

  const sub = subtotal();
  const fee = estimateFee(sub, gateway);
  const total = sub + fee;

  function validateContact() {
    const errs: Partial<typeof contact> = {};
    if (!contact.name.trim()) errs.name = "Required";
    if (
      !contact.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
    ) {
      errs.email = "Valid email required";
    }
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreateAndCheckout() {
    if (!validateContact()) return;

    try {
      // Create order
      const orderRes = await createOrder.mutateAsync({
        student_ids: items.map((i) => i.student.id),
        sponsor_name: contact.name,
        sponsor_email: contact.email,
        sponsor_phone: contact.phone || undefined,
        gateway,
        currency: "NGN",
      });

      const order = orderRes.data as SponsorshipOrder;
      setPendingOrder(order);

      // Checkout immediately
      const checkoutRes = await checkoutOrder.mutateAsync({ gateway });
      const checkoutData = checkoutRes.data as {
        checkout_url: string;
        reference: string;
      };

      clearCart();
      window.location.href = checkoutData.checkout_url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  }

  const isSubmitting = createOrder.isPending || checkoutOrder.isPending;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 pb-16">
      {/* Cart summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Your Cart ({totalStudents()} student
            {totalStudents() !== 1 ? "s" : ""})
          </h2>
          <button
            onClick={() => {
              clearCart();
              router.push("/sponsor-students");
            }}
            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>

        <ul className="divide-y divide-gray-50">
          {items.map(({ student, amount }) => (
            <li key={student.id} className="flex items-center gap-3 px-5 py-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {student.profile_photo ? (
                  <Image
                    src={student.profile_photo}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm font-bold">
                    {student.gender === "female" ? "F" : "M"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {student.user?.name?.split(" ")[0].charAt(0)}**** —{" "}
                  {student.school?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {student.current_class?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) =>
                    updateAmount(student.id, Number(e.target.value))
                  }
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                  onClick={() => removeStudent(student.id)}
                  className="text-gray-300 hover:text-red-400"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Sponsor info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User size={16} /> Sponsor Details
        </h2>
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-2 text-sm">
            <Lock size={14} />
            Signed in as <strong>{user.email}</strong>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="Your full name"
            value={contact.name}
            onChange={(e) =>
              setContact((c) => ({ ...c, name: e.target.value }))
            }
            error={contactErrors.name}
            leftIcon={<User size={14} />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={contact.email}
            onChange={(e) =>
              setContact((c) => ({ ...c, email: e.target.value }))
            }
            error={contactErrors.email}
            leftIcon={<Mail size={14} />}
            required
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+234 800 000 0000"
            value={contact.phone}
            onChange={(e) =>
              setContact((c) => ({ ...c, phone: e.target.value }))
            }
            leftIcon={<Phone size={14} />}
          />
        </div>
        {!isAuthenticated && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <AlertCircle size={12} />
            You can pay as a guest, or{" "}
            <Link
              href={`/login?next=/sponsor-students/checkout`}
              className="text-brand underline"
            >
              sign in
            </Link>{" "}
            to track your sponsorships.
          </p>
        )}
      </div>

      {/* Gateway selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard size={16} /> Payment Method
        </h2>
        <div className="space-y-2">
          {GATEWAYS.map((gw) => (
            <label
              key={gw.id}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                gateway === gw.id
                  ? "border-brand bg-brand/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="gateway"
                value={gw.id}
                checked={gateway === gw.id}
                onChange={() => setGateway(gw.id)}
                className="accent-brand"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {gw.label}
                </p>
                <p className="text-xs text-gray-400">{gw.description}</p>
              </div>
              {gateway === gw.id && (
                <CheckCircle2
                  size={18}
                  className="text-brand"
                  fill="currentColor"
                />
              )}
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-400 flex items-center gap-1">
          <AlertCircle size={12} />
          Gateway fee: {FEE_INFO[gateway]}
        </p>
      </div>

      {/* Bolt-style receipt / order summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Order Summary</h2>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              Sponsorship ({totalStudents()} student
              {totalStudents() !== 1 ? "s" : ""})
            </span>
            <span>{FMT.format(sub)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Gateway fee ({gateway})</span>
            <span>+ {FMT.format(Math.round(fee))}</span>
          </div>
          <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
            <span>Total charged</span>
            <span className="text-brand">{FMT.format(Math.round(total))}</span>
          </div>
          <p className="text-xs text-gray-400">
            The gateway fee is added so the full {FMT.format(sub)} reaches the
            students.
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleCreateAndCheckout}
        size="lg"
        className="w-full"
        loading={isSubmitting}
        leftIcon={isSubmitting ? undefined : <CreditCard size={18} />}
      >
        {isSubmitting
          ? "Redirecting to payment…"
          : `Pay ${FMT.format(Math.round(total))}`}
      </Button>
    </div>
  );
}

// ─── Page wrapper (Suspense for useSearchParams) ──────────────────────────────

export default function SponsorCheckoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <Logo />
          <span className="ml-2 text-sm font-medium text-gray-600">
            Checkout
          </span>
        </div>
      </nav>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        }
      >
        <CheckoutInner />
      </Suspense>
    </div>
  );
}
