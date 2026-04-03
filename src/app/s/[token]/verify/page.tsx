"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Download,
  GraduationCap,
} from "lucide-react";
import { useSquadVerify } from "@/hooks/useFees";
import type { ReceiptData } from "@/types/finance";

function formatCurrency(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function ReceiptCard({ receipt }: { receipt: ReceiptData }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Payment Receipt</title>
      <style>
        body { font-family: sans-serif; padding: 32px; color: #111; }
        h1 { margin-bottom: 4px; font-size: 1.4rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 6px 0; border-bottom: 1px solid #eee; }
        td:last-child { text-align: right; font-weight: 600; }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full mx-auto">
      <div ref={printRef} className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {receipt.school_logo ? (
              <img
                src={receipt.school_logo}
                alt="logo"
                className="h-12 w-12 object-contain rounded-lg"
              />
            ) : (
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-blue-600" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {receipt.school_name}
              </p>
              <p className="text-xs text-gray-500">{receipt.school_email}</p>
              <p className="text-xs text-gray-500">{receipt.school_phone}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">
            RECEIPT
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Receipt No.</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {receipt.receipt_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {new Date(receipt.paid_at).toLocaleDateString("en-NG", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>

        <table className="w-full text-sm mb-4">
          <tbody>
            {[
              { label: "Payer Name", value: receipt.payer_name ?? "—" },
              { label: "Payer Email", value: receipt.payer_email ?? "—" },
              { label: "Payer Phone", value: receipt.payer_phone ?? "—" },
              { label: "Student", value: receipt.student_name },
              { label: "Admission No.", value: receipt.student_number },
              { label: "Fee", value: receipt.fee_name },
              ...(receipt.academic_year
                ? [{ label: "Academic Year", value: receipt.academic_year }]
                : []),
              ...(receipt.term ? [{ label: "Term", value: receipt.term }] : []),
              ...(receipt.narration
                ? [{ label: "Narration", value: receipt.narration }]
                : []),
              { label: "Reference", value: receipt.reference },
            ].map(({ label, value }) => (
              <tr
                key={label}
                className="border-b border-gray-100 dark:border-gray-700"
              >
                <td className="py-2 text-gray-500">{label}</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {value}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 font-bold text-gray-900 dark:text-white text-base">
                Amount Paid
              </td>
              <td className="py-3 font-bold text-green-600 text-right text-base">
                {formatCurrency(receipt.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-center text-xs text-gray-400 mt-4">
          Thank you for your payment · {receipt.school_address}
        </p>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          <Download size={16} /> Download / Print Receipt
        </button>
      </div>
    </div>
  );
}

export default function SquadVerifyPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const transactionRef = searchParams.get("transaction_ref");

  const { mutate: verify } = useSquadVerify();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const called = useRef(false);

  useEffect(() => {
    if (!transactionRef || called.current) return;
    called.current = true;

    verify(transactionRef, {
      onSuccess: (res) => {
        // The verify endpoint returns { success, data } — if the backend
        // also returns a receipt object, use it; otherwise show generic success.
        const receipt = (res as any)?.receipt as ReceiptData | undefined;
        if (receipt) {
          setReceipt(receipt);
        }
        setStatus("success");
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.error ??
            err?.message ??
            "We could not confirm your payment. Please contact support.",
        );
        setStatus("error");
      },
    });
  }, [transactionRef, verify]);

  if (!transactionRef) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <GraduationCap size={48} className="text-gray-300" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          Invalid payment link.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          No transaction reference was found in the URL.
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">
          Confirming your payment…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <XCircle size={52} className="text-red-500" />
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          Payment Not Confirmed
        </p>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {errorMessage}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          Ref: {transactionRef}
        </p>
        <a
          href={`/s/${token}`}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          ← Back to payment page
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle size={52} className="text-green-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Successful!
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your payment has been confirmed and recorded.
          </p>
        </div>

        {receipt ? (
          <ReceiptCard receipt={receipt} />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reference:{" "}
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {transactionRef}
              </span>
            </p>
            <a
              href={`/s/${token}`}
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              View Fee Summary →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
