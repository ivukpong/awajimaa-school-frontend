"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Dummy data for demonstration
const DUMMY_COMPLAINTS = [
  {
    id: 1,
    subject: "Gig not paid",
    status: "untreated",
    submitted_at: "2026-04-25",
    user: "John Doe",
  },
  {
    id: 2,
    subject: "Teacher did not show up",
    status: "treated",
    submitted_at: "2026-04-24",
    user: "Jane Smith",
  },
];

export default function ComplaintsDashboard() {
  const [complaints] = useState(DUMMY_COMPLAINTS);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <h2 className="text-xl font-bold mb-4">Complaints Dashboard</h2>
        <div className="grid grid-cols-1 gap-4">
          {complaints.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No complaints found.
            </div>
          )}
          {complaints.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
            >
              <div>
                <div className="font-semibold text-gray-900">{c.subject}</div>
                <div className="text-xs text-gray-500">
                  By {c.user} on {c.submitted_at}
                </div>
              </div>
              <Badge variant={c.status === "treated" ? "green" : "yellow"}>
                {c.status === "treated" ? "Treated" : "Untreated"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
