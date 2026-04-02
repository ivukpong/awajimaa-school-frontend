"use client";
import React, { useState } from "react";
import {
  useMyInsurancePolicies,
  useInsuranceClaims,
  useSubmitInsuranceClaim,
} from "@/hooks/useInsurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/utils";
import type { InsurancePolicy, InsuranceClaim } from "@/types";

const CLAIM_STATUS_VARIANTS: Record<
  string,
  "blue" | "yellow" | "green" | "red" | "gray"
> = {
  pending: "yellow",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  paid: "green",
};

const POLICY_STATUS_VARIANTS: Record<
  string,
  "green" | "yellow" | "red" | "gray"
> = {
  active: "green",
  pending: "yellow",
  expired: "red",
  cancelled: "gray",
};

export default function MyInsurancePoliciesPage() {
  const { data: policiesData, isLoading: loadingPolicies } =
    useMyInsurancePolicies();
  const { data: claimsData, isLoading: loadingClaims } = useInsuranceClaims();
  const submitClaim = useSubmitInsuranceClaim();

  const policies = (policiesData?.data as InsurancePolicy[] | undefined) ?? [];
  const claims = (claimsData?.data as InsuranceClaim[] | undefined) ?? [];

  const [claimOpen, setClaimOpen] = useState(false);
  const [form, setForm] = useState({
    insurance_scheme_id: "",
    claim_type: "",
    description: "",
    evidence_urls: "",
    amount_claimed: "",
  });

  function handleSubmitClaim() {
    submitClaim.mutate(
      {
        insurance_scheme_id: Number(form.insurance_scheme_id),
        claim_type: form.claim_type,
        description: form.description,
        evidence_urls: form.evidence_urls
          ? form.evidence_urls
              .split(",")
              .map((u) => u.trim())
              .filter(Boolean)
          : undefined,
        amount_claimed: Number(form.amount_claimed),
      },
      {
        onSuccess: () => {
          setClaimOpen(false);
          setForm({
            insurance_scheme_id: "",
            claim_type: "",
            description: "",
            evidence_urls: "",
            amount_claimed: "",
          });
        },
      },
    );
  }

  const policyColumns: Column<InsurancePolicy>[] = [
    {
      key: "scheme",
      header: "Package",
      render: (r) => r.scheme?.name ?? "—",
    },
    {
      key: "provider",
      header: "Provider",
      render: (r) => r.scheme?.operator?.name ?? "—",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={POLICY_STATUS_VARIANTS[r.status] ?? "gray"}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: "start_date",
      header: "Start",
      render: (r) => r.start_date?.slice(0, 10) ?? "—",
    },
    {
      key: "end_date",
      header: "Expires",
      render: (r) => r.end_date?.slice(0, 10) ?? "—",
    },
    {
      key: "premium_paid",
      header: "Premium",
      render: (r) => (r.premium_paid ? formatCurrency(r.premium_paid) : "—"),
    },
  ];

  const claimColumns: Column<InsuranceClaim>[] = [
    { key: "claim_type", header: "Type" },
    {
      key: "scheme",
      header: "Package",
      render: (r) => r.scheme?.name ?? "—",
    },
    {
      key: "amount_claimed",
      header: "Claimed",
      render: (r) => formatCurrency(r.amount_claimed),
    },
    {
      key: "amount_approved",
      header: "Approved",
      render: (r) =>
        r.amount_approved != null ? formatCurrency(r.amount_approved) : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={CLAIM_STATUS_VARIANTS[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Filed",
      render: (r) => r.created_at.slice(0, 10),
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Insurance Policies</h1>
        <Button onClick={() => setClaimOpen(true)}>File a Claim</Button>
      </div>

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribed Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={policyColumns}
            data={policies}
            keyField="id"
            loading={loadingPolicies}
          />
        </CardContent>
      </Card>

      {/* Claims History */}
      <Card>
        <CardHeader>
          <CardTitle>Claims History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={claimColumns}
            data={claims}
            keyField="id"
            loading={loadingClaims}
          />
        </CardContent>
      </Card>

      {/* File a Claim Modal */}
      <Modal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        title="File an Insurance Claim"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Policy
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.insurance_scheme_id}
              onChange={(e) =>
                setForm({ ...form, insurance_scheme_id: e.target.value })
              }
            >
              <option value="">-- Select a policy --</option>
              {policies
                .filter((p) => p.status === "active")
                .map((p) => (
                  <option key={p.id} value={String(p.insurance_scheme_id)}>
                    {p.scheme?.name ?? `Policy #${p.id}`}
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Claim Type"
            placeholder="e.g. Fire, Flood, Theft"
            value={form.claim_type}
            onChange={(e) => setForm({ ...form, claim_type: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="Describe the incident and damages…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />

          <Input
            label="Evidence URLs (comma-separated)"
            placeholder="https://…, https://…"
            value={form.evidence_urls}
            onChange={(e) =>
              setForm({ ...form, evidence_urls: e.target.value })
            }
          />

          <Input
            label="Amount Claimed (₦)"
            type="number"
            value={form.amount_claimed}
            onChange={(e) =>
              setForm({ ...form, amount_claimed: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setClaimOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClaim}
              disabled={
                submitClaim.isPending ||
                !form.insurance_scheme_id ||
                !form.claim_type ||
                !form.description ||
                !form.amount_claimed
              }
            >
              Submit Claim
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
