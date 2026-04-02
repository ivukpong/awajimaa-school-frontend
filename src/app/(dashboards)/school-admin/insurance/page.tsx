"use client";
import React, { useState } from "react";
import {
    useInsuranceOperators,
    useInsurancePackages,
    useSubscribeInsurancePolicy,
} from "@/hooks/useInsurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import type { InsurancePackage, InsuranceOperator } from "@/types";

export default function SchoolInsurancePage() {
    const { data: operatorsData, isLoading: loadingOperators } = useInsuranceOperators();
    const { data: packagesData, isLoading: loadingPackages } = useInsurancePackages();
    const subscribe = useSubscribeInsurancePolicy();

    const operators = (operatorsData?.data as InsuranceOperator[] | undefined) ?? [];
    const packages = (packagesData?.data as InsurancePackage[] | undefined) ?? [];

    const [preview, setPreview] = useState<InsurancePackage | null>(null);
    const [confirming, setConfirming] = useState<InsurancePackage | null>(null);

    function handleSubscribe() {
        if (!confirming) return;
        const today = new Date().toISOString().slice(0, 10);
        const endDate = confirming.duration_months
            ? new Date(
                  new Date().setMonth(new Date().getMonth() + confirming.duration_months)
              )
                  .toISOString()
                  .slice(0, 10)
            : undefined;
        subscribe.mutate(
            {
                insurance_scheme_id: confirming.id,
                start_date: today,
                end_date: endDate,
                premium_paid: confirming.premium,
            },
            { onSuccess: () => setConfirming(null) }
        );
    }

    const operatorColumns: Column<InsuranceOperator>[] = [
        { key: "name", header: "Company Name" },
        { key: "email", header: "Email" },
        {
            key: "packages_count",
            header: "Packages",
            render: (r) => (
                <Badge variant="gray">{r.packages_count ?? 0} package(s)</Badge>
            ),
        },
    ];

    const packageColumns: Column<InsurancePackage>[] = [
        { key: "name", header: "Package Name" },
        {
            key: "operator",
            header: "Provider",
            render: (r) => r.operator?.name ?? "—",
        },
        {
            key: "premium",
            header: "Premium",
            render: (r) => formatCurrency(r.premium),
        },
        {
            key: "subscription_type",
            header: "Type",
            render: (r) => (
                <Badge variant={r.subscription_type === "recurring" ? "blue" : "green"}>
                    {r.subscription_type}
                </Badge>
            ),
        },
        {
            key: "duration_months",
            header: "Duration",
            render: (r) =>
                r.duration_months ? `${r.duration_months} months` : "N/A",
        },
        {
            key: "coverage_type",
            header: "Coverage",
            render: (r) => r.coverage_type ?? "—",
        },
        {
            key: "id",
            header: "Actions",
            render: (r) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPreview(r)}>
                        Details
                    </Button>
                    <Button size="sm" onClick={() => setConfirming(r)}>
                        Subscribe
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">Insurance</h1>

            {/* Insurance Companies */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Insurance Companies</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table
                        columns={operatorColumns}
                        data={operators}
                        keyField="id"
                        loading={loadingOperators}
                    />
                </CardContent>
            </Card>

            {/* Available Packages */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Packages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table
                        columns={packageColumns}
                        data={packages}
                        keyField="id"
                        loading={loadingPackages}
                    />
                </CardContent>
            </Card>

            {/* Package Detail Modal */}
            <Modal
                open={!!preview}
                onClose={() => setPreview(null)}
                title={preview?.name ?? "Package Details"}
            >
                {preview && (
                    <div className="space-y-4">
                        {preview.media_url && (
                            <div className="rounded-lg overflow-hidden">
                                {preview.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video
                                        src={preview.media_url}
                                        controls
                                        className="w-full max-h-48 object-cover"
                                    />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={preview.media_url}
                                        alt={preview.name}
                                        className="w-full max-h-48 object-cover"
                                    />
                                )}
                            </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {preview.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium">Premium:</span>{" "}
                                {formatCurrency(preview.premium)}
                            </div>
                            <div>
                                <span className="font-medium">Type:</span>{" "}
                                {preview.subscription_type}
                            </div>
                            <div>
                                <span className="font-medium">Duration:</span>{" "}
                                {preview.duration_months
                                    ? `${preview.duration_months} months`
                                    : "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Coverage:</span>{" "}
                                {preview.coverage_type ?? "—"}
                            </div>
                            <div>
                                <span className="font-medium">Provider:</span>{" "}
                                {preview.operator?.name ?? "—"}
                            </div>
                        </div>
                        {preview.benefits && preview.benefits.length > 0 && (
                            <div>
                                <p className="font-medium text-sm mb-1">Benefits:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
                                    {preview.benefits.map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setPreview(null)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setPreview(null);
                                    setConfirming(preview);
                                }}
                            >
                                Subscribe
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Subscribe Confirm Modal */}
            <Modal
                open={!!confirming}
                onClose={() => setConfirming(null)}
                title="Confirm Subscription"
            >
                {confirming && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            You are about to subscribe to{" "}
                            <span className="font-semibold">{confirming.name}</span> for{" "}
                            <span className="font-semibold">
                                {formatCurrency(confirming.premium)}
                            </span>{" "}
                            ({confirming.subscription_type}).
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setConfirming(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubscribe}
                                disabled={subscribe.isPending}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
