"use client";
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  FileText,
  Clock,
  ExternalLink,
  Upload,
  Building2,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import type { SchoolSubscription, SubscriptionInvoice } from "@/types";

type BillingCycle = "monthly" | "yearly";
type PayMethod = "paystack" | "bank_transfer";

interface PricingData {
  lga_count: number;
  monthly_amount: number;
  yearly_amount: number;
  signup_fee_paid: boolean;
  signup_fee_amount: number;
  branches: { id: number; name: string; lga: string | null }[];
}

interface OfflineForm {
  bank_name: string;
  account_name: string;
  transaction_reference: string;
  transaction_date: string;
  proof: File | null;
}

const emptyOffline: OfflineForm = {
  bank_name: "",
  account_name: "",
  transaction_reference: "",
  transaction_date: "",
  proof: null,
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    expired: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    trial: "bg-blue-50 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    partially_paid: "bg-blue-50 text-blue-700",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function SchoolAdminSubscriptionPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [payMethod, setPayMethod] = useState<PayMethod>("paystack");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [offlineForm, setOfflineForm] = useState<OfflineForm>(emptyOffline);
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);

  // Pricing (LGA-based)
  const { data: pricing, isLoading: loadingPricing } = useQuery<PricingData>({
    queryKey: ["subscription-pricing"],
    queryFn: async () => {
      const res = await api.get("/subscription/pricing");
      return res.data.data ?? res.data;
    },
  });

  // Current subscription
  const { data: mySubscription, isLoading: loadingSub } =
    useQuery<SchoolSubscription>({
      queryKey: ["my-subscription"],
      queryFn: async () => {
        const res = await api.get("/my-subscription");
        return res.data.data ?? res.data;
      },
    });

  // Invoices
  const { data: invoices = [] } = useQuery<SubscriptionInvoice[]>({
    queryKey: ["subscription-invoices"],
    queryFn: async () => {
      const res = await api.get("/subscription-invoices");
      return res.data.data ?? res.data;
    },
  });

  // Initialize subscription (Paystack)
  const initMutation = useMutation({
    mutationFn: (body: {
      billing_cycle: BillingCycle;
      payment_method: PayMethod;
    }) => api.post("/subscription/initialize", body),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      const url = res.data.data?.payment_url ?? res.data.payment_url;
      if (url) window.open(url, "_blank");
      qc.invalidateQueries({ queryKey: ["my-subscription"] });
      qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
      setShowSubscribeModal(false);
    },
  });

  // Start free 7-day trial
  const freeTrialMutation = useMutation({
    mutationFn: () => api.post("/subscription/trial/start"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-subscription"] }),
  });

  // Initialize signup fee payment
  const signupFeeMutation = useMutation({
    mutationFn: () => api.post("/subscription/signup-fee"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      const url = res.data.data?.payment_url ?? res.data.payment_url;
      if (url) window.open(url, "_blank");
    },
  });

  // Offline payment
  const offlineMutation = useMutation({
    mutationFn: async ({
      invoiceId,
      form,
    }: {
      invoiceId: number;
      form: OfflineForm;
    }) => {
      const fd = new FormData();
      fd.append("subscription_invoice_id", String(invoiceId));
      fd.append("amount", "0"); // server calculates from invoice
      fd.append("bank_name", form.bank_name);
      fd.append("account_name", form.account_name);
      fd.append("transaction_reference", form.transaction_reference);
      fd.append("transaction_date", form.transaction_date);
      if (form.proof) fd.append("proof", form.proof);
      return api.post("/offline-payment-requests", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
      setActiveInvoiceId(null);
      setOfflineForm(emptyOffline);
    },
  });

  function handleSubscribeSubmit(e: React.FormEvent) {
    e.preventDefault();
    initMutation.mutate({ billing_cycle: cycle, payment_method: payMethod });
  }

  function handleOfflineSubmit(e: React.FormEvent, invoiceId: number) {
    e.preventDefault();
    offlineMutation.mutate({ invoiceId, form: offlineForm });
  }

  const hasActiveSub =
    mySubscription?.status === "active" || mySubscription?.status === "trial";

  const monthlyAmount = pricing?.monthly_amount ?? 0;
  const yearlyAmount = pricing?.yearly_amount ?? 0;
  const displayAmount = cycle === "monthly" ? monthlyAmount : yearlyAmount;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your school&apos;s platform subscription
        </p>
      </div>

      {/* Signup fee banner */}
      {pricing && !pricing.signup_fee_paid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              One-time signup fee required
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              A one-time fee of{" "}
              <strong>
                ₦{Number(pricing.signup_fee_amount / 100).toLocaleString()}
              </strong>{" "}
              covers your domain name and hosting setup.
            </p>
          </div>
          <button
            onClick={() => signupFeeMutation.mutate()}
            disabled={signupFeeMutation.isPending}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60 flex items-center gap-1.5"
          >
            {signupFeeMutation.isPending && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            Pay Now
          </button>
        </div>
      )}

      {/* Current subscription card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Current Subscription
        </h2>
        {loadingSub ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : mySubscription ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </p>
                <div className="mt-0.5">
                  {statusBadge(mySubscription.status)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Billing
                </p>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">
                  {mySubscription.billing_cycle}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Expires
                </p>
                <p className="font-medium text-gray-900 mt-0.5">
                  {mySubscription.end_date
                    ? new Date(mySubscription.end_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              {(mySubscription as any).trial_ends_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Trial ends
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {new Date(
                      (mySubscription as any).trial_ends_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            No active subscription. Choose a plan below to get started.
          </div>
        )}
      </div>

      {/* LGA-based pricing + subscribe */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">
          Subscription Pricing
        </h2>

        {loadingPricing ? (
          <p className="text-sm text-gray-500">Loading pricing…</p>
        ) : pricing ? (
          <>
            {/* LGA breakdown */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-brand" />
                Pricing is based on LGA coverage
              </div>
              <p className="text-xs text-gray-500">
                ₦20,000 × {pricing.lga_count} LGA
                {pricing.lga_count !== 1 ? "s" : ""} ={" "}
                <strong>
                  ₦{(pricing.monthly_amount / 100).toLocaleString()}/month
                </strong>
              </p>

              {pricing.branches.length > 0 && (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wide">
                        <th className="text-left pb-1">Branch</th>
                        <th className="text-left pb-1">LGA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pricing.branches.map((b) => (
                        <tr key={b.id}>
                          <td className="py-1 pr-4 flex items-center gap-1.5 text-gray-700">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            {b.name}
                          </td>
                          <td className="py-1 text-gray-500">{b.lga ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trial options — only when no active sub */}
            {!hasActiveSub && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    7-day Free Trial
                  </p>
                  <p className="text-xs text-gray-500">
                    No card required. Get instant access for 7 days.
                  </p>
                  <button
                    onClick={() => freeTrialMutation.mutate()}
                    disabled={freeTrialMutation.isPending}
                    className="mt-2 w-full rounded-lg border border-brand px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/5 disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {freeTrialMutation.isPending && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Start Free Trial
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    30-day Trial with Card
                  </p>
                  <p className="text-xs text-gray-500">
                    Verify your card with a ₦100 charge. Card is saved for
                    auto-renewal.
                  </p>
                  <button
                    onClick={() => {
                      api
                        .post("/subscription/trial/initialize-card-verify")
                        .then((res: any) => {
                          const url =
                            res.data.data?.payment_url ?? res.data.payment_url;
                          if (url) window.open(url, "_blank");
                        });
                    }}
                    className="mt-2 w-full rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="h-3 w-3" />
                    Verify Card &amp; Start
                  </button>
                </div>
              </div>
            )}

            {/* Subscribe button */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
                  <label
                    key={c}
                    className={`flex-1 flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer transition ${
                      cycle === c
                        ? "border-brand bg-brand/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cycle"
                      value={c}
                      checked={cycle === c}
                      onChange={() => setCycle(c)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {c}
                    </span>
                    <span className="text-sm font-bold text-brand">
                      ₦
                      {c === "monthly"
                        ? (pricing.monthly_amount / 100).toLocaleString()
                        : (pricing.yearly_amount / 100).toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
              {cycle === "yearly" && (
                <p className="text-xs text-green-600 mb-3">
                  🎉 2 months free — save ₦
                  {((pricing.monthly_amount * 2) / 100).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => setShowSubscribeModal(true)}
                disabled={!pricing.signup_fee_paid}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pricing.signup_fee_paid
                  ? "Subscribe Now"
                  : "Pay signup fee first to subscribe"}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Subscription Invoices
        </h2>
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Due Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <React.Fragment key={inv.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {inv.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(inv.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(inv.amount_paid ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {invoiceStatusBadge(inv.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(inv.status === "unpaid" ||
                          inv.status === "partial") && (
                          <div className="flex items-center justify-end gap-2">
                            {inv.payment_url && (
                              <a
                                href={inv.payment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Pay Online
                              </a>
                            )}
                            <button
                              onClick={() =>
                                setActiveInvoiceId(
                                  activeInvoiceId === inv.id ? null : inv.id,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Upload className="h-3 w-3" />
                              Bank Transfer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Inline offline payment form */}
                    {activeInvoiceId === inv.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <form
                            onSubmit={(e) => handleOfflineSubmit(e, inv.id)}
                            className="grid grid-cols-2 gap-3 max-w-2xl"
                          >
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Bank Name *
                              </label>
                              <input
                                required
                                value={offlineForm.bank_name}
                                onChange={(e) =>
                                  setOfflineForm({
                                    ...offlineForm,
                                    bank_name: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Account Name *
                              </label>
                              <input
                                required
                                value={offlineForm.account_name}
                                onChange={(e) =>
                                  setOfflineForm({
                                    ...offlineForm,
                                    account_name: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Transaction Reference *
                              </label>
                              <input
                                required
                                value={offlineForm.transaction_reference}
                                onChange={(e) =>
                                  setOfflineForm({
                                    ...offlineForm,
                                    transaction_reference: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Transaction Date *
                              </label>
                              <input
                                required
                                type="date"
                                value={offlineForm.transaction_date}
                                onChange={(e) =>
                                  setOfflineForm({
                                    ...offlineForm,
                                    transaction_date: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Proof of Payment
                              </label>
                              <input
                                ref={fileRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  setOfflineForm({
                                    ...offlineForm,
                                    proof: e.target.files?.[0] ?? null,
                                  })
                                }
                                className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand hover:file:bg-brand/20"
                              />
                            </div>
                            <div className="col-span-2 flex gap-2">
                              <button
                                type="submit"
                                disabled={offlineMutation.isPending}
                                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
                              >
                                {offlineMutation.isPending
                                  ? "Submitting…"
                                  : "Submit Payment"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveInvoiceId(null)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscribe modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Subscription
              </h2>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubscribeSubmit}
              className="px-6 py-5 space-y-5"
            >
              {/* Payment method */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        value: "paystack",
                        label: "Pay Online",
                        icon: <CreditCard className="h-4 w-4" />,
                      },
                      {
                        value: "bank_transfer",
                        label: "Bank Transfer",
                        icon: <Clock className="h-4 w-4" />,
                      },
                    ] as {
                      value: PayMethod;
                      label: string;
                      icon: React.ReactNode;
                    }[]
                  ).map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition ${
                        payMethod === m.value
                          ? "border-brand bg-brand/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value={m.value}
                        checked={payMethod === m.value}
                        onChange={() => setPayMethod(m.value)}
                        className="sr-only"
                      />
                      {m.icon}
                      <span className="text-sm font-medium text-gray-900">
                        {m.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">LGAs covered</span>
                  <span className="font-medium">{pricing?.lga_count ?? 1}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Cycle</span>
                  <span className="font-medium capitalize">{cycle}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-brand">
                    ₦{(displayAmount / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {payMethod === "bank_transfer" && (
                <p className="text-xs text-gray-500 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
                  After submitting, you will be able to upload proof of payment
                  from your invoices below. Your subscription will be activated
                  after review.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={initMutation.isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
                >
                  {initMutation.isPending
                    ? "Processing…"
                    : payMethod === "paystack"
                      ? "Proceed to Payment"
                      : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
