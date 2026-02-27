"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Shield,
  Plus,
  OctagonX,
  CheckCircle2,
  Clock,
  Phone,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PickupCode {
  id: number;
  student: string;
  pickup_person: string;
  relationship: string;
  phone: string;
  valid_until: string;
  code: string;
  is_used: boolean;
}

const mockCodes: PickupCode[] = [
  {
    id: 1,
    student: "Chidinma Nwosu",
    pickup_person: "Aunt Grace Okonkwo",
    relationship: "Aunt",
    phone: "+234 803 000 1111",
    valid_until: "2026-02-27T18:00:00",
    code: "PKP-8421",
    is_used: false,
  },
  {
    id: 2,
    student: "Emeka Nwosu",
    pickup_person: "Mr. Femi Adeyemi",
    relationship: "Uncle",
    phone: "+234 806 555 9988",
    valid_until: "2026-02-26T17:00:00",
    code: "PKP-3309",
    is_used: true,
  },
];

export default function ParentPickupPage() {
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pickup Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Authorize who can pick up your child from school. Security staff
            will verify with an OTP.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowModal(true)}
        >
          Generate Pickup Code
        </Button>
      </div>

      {/* Security info box */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-300">
            How it works
          </p>
          <p className="text-blue-700 dark:text-blue-400 mt-0.5">
            When you generate a pickup code, the designated person presents the
            code at the security gate. You&apos;ll receive an OTP to approve the
            release on the spot.
          </p>
        </div>
      </div>

      {/* Code Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockCodes.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {c.student}
                </p>
              </div>
              <Badge
                variant={
                  c.is_used
                    ? "gray"
                    : new Date(c.valid_until) < new Date()
                      ? "red"
                      : "green"
                }
              >
                {c.is_used
                  ? "Used"
                  : new Date(c.valid_until) < new Date()
                    ? "Expired"
                    : "Active"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {c.pickup_person} ({c.relationship})
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  Valid until{" "}
                  {new Date(c.valid_until).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-2">
              <span className="font-mono text-lg font-bold tracking-widest text-brand">
                {c.code}
              </span>
              {!c.is_used && (
                <button className="text-xs text-red-600 hover:underline flex items-center gap-1">
                  <OctagonX className="h-3.5 w-3.5" /> Revoke
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Generate Pickup Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Generate Pickup Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Child
                  </label>
                  <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option>Chidinma Nwosu - SS 1A</option>
                    <option>Emeka Nwosu - Primary 4B</option>
                  </select>
                </div>
                <Input
                  label="Pickup Person Full Name"
                  placeholder="e.g. Grace Okonkwo"
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+234 803 000 1111"
                  type="tel"
                  required
                />
                <Input
                  label="Relationship"
                  placeholder="e.g. Aunt, Family Driver, Uncle"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Valid From" type="datetime-local" required />
                  <Input label="Valid Until" type="datetime-local" required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Generate</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
