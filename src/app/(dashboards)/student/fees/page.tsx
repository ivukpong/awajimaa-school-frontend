"use client";

import { useState } from "react";
import { DollarSign, Link2, Copy, Check, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useStudentFees } from "@/hooks/useFees";
import type { InvoiceWithFee } from "@/types/finance";

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray"> = {
    paid: "green",
    partial: "yellow",
    unpaid: "red",
    waived: "gray",
};

function formatCurrency(n: number) {
    return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function InvoiceRow({ invoice }: { invoice: InvoiceWithFee }) {
    const [open, setOpen] = useState(false);
    const paid = invoice.amount - invoice.balance;

    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                        {invoice.fee?.name ?? `Invoice #${invoice.id}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {invoice.fee?.term?.name} · {invoice.fee?.category}
                    </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                    <Badge variant={statusVariant[invoice.status] ?? "gray"}>
                        {invoice.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.balance)} remaining
                    </span>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Total</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Paid</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(paid)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Balance</p>
                            <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(invoice.balance)}</p>
                        </div>
                    </div>

                    {invoice.payments && invoice.payments.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Payment History
                            </p>
                            <div className="space-y-1.5">
                                {invoice.payments.map(p => (
                                    <div key={p.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 rounded px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {p.payer_name ?? "Student"} · {p.payer_type === "third_party" ? "Third Party" : "Self"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400">{new Date(p.paid_at).toLocaleDateString()}</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function StudentFeesPage() {
    const { data, isLoading } = useStudentFees();
    const [copied, setCopied] = useState(false);

    const paymentLink = data
        ? `${window.location.origin}/s/${data.student.public_token}`
        : "";

    function copyLink() {
        if (!paymentLink) return;
        navigator.clipboard.writeText(paymentLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Loading fees…
            </div>
        );
    }

    if (!data) return null;

    const { summary, grouped } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Fees</h1>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Fees"
                    value={formatCurrency(summary.total)}
                    icon={<DollarSign size={20} />}
                    color="blue"
                />
                <StatCard
                    title="Amount Paid"
                    value={formatCurrency(summary.paid)}
                    icon={<DollarSign size={20} />}
                    color="green"
                />
                <StatCard
                    title="Outstanding Balance"
                    value={formatCurrency(summary.balance)}
                    icon={<DollarSign size={20} />}
                    color={summary.balance > 0 ? "red" : "green"}
                />
            </div>

            {/* Shareable payment link */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 size={18} />
                        Payment Link
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Share this link so friends, family, or sponsors can pay your fees directly.
                    </p>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
                            {paymentLink}
                        </span>
                        <button
                            onClick={copyLink}
                            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Fees grouped by academic year */}
            {grouped.map(group => (
                <Card key={group.academic_year}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{group.academic_year}</CardTitle>
                            <div className="flex gap-4 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Total: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(group.total)}</span>
                                </span>
                                <span className="text-green-600 dark:text-green-400">
                                    Paid: <span className="font-semibold">{formatCurrency(group.paid)}</span>
                                </span>
                                <span className="text-red-600 dark:text-red-400">
                                    Due: <span className="font-semibold">{formatCurrency(group.balance)}</span>
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {group.invoices.map(inv => (
                            <InvoiceRow key={inv.id} invoice={inv} />
                        ))}
                    </CardContent>
                </Card>
            ))}

            {grouped.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                        No fee invoices found for your account.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
