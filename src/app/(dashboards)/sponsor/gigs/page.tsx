"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import GigProposalsModal from "./GigProposalsModal";
import GigFundModal from "./GigFundModal";

export default function SponsorGigsPage() {
  const [gigs, setGigs] = useState([
    {
      id: 1,
      title: "Math Tutor Needed",
      funded: false,
      status: "open",
      proposals: [
        {
          id: 101,
          teacherName: "Jane Doe",
          message: "I have 5 years experience.",
          status: "pending",
        },
        {
          id: 102,
          teacherName: "John Smith",
          message: "Certified Math teacher.",
          status: "pending",
        },
      ],
    },
    {
      id: 2,
      title: "English Tutor",
      funded: true,
      status: "active",
      proposals: [],
    },
  ]);
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [showFund, setShowFund] = useState(false);

  const handleViewProposals = (gig: any) => {
    setSelectedGig(gig);
    setShowProposals(true);
  };
  const handleFund = (gig: any) => {
    setSelectedGig(gig);
    setShowFund(true);
  };
  const handleFundGig = (amount: number) => {
    setGigs(
      gigs.map((gig) =>
        gig.id === selectedGig.id ? { ...gig, funded: true } : gig,
      ),
    );
    setShowFund(false);
  };
  const handleAcceptProposal = (proposalId: number) => {
    setGigs(
      gigs.map((gig) =>
        gig.id === selectedGig.id
          ? {
              ...gig,
              proposals: gig.proposals.map((p: any) =>
                p.id === proposalId ? { ...p, status: "accepted" } : p,
              ),
            }
          : gig,
      ),
    );
  };
  const handleRejectProposal = (proposalId: number) => {
    setGigs(
      gigs.map((gig) =>
        gig.id === selectedGig.id
          ? {
              ...gig,
              proposals: gig.proposals.map((p: any) =>
                p.id === proposalId ? { ...p, status: "rejected" } : p,
              ),
            }
          : gig,
      ),
    );
  };
  const handleStatusUpdate = (gigId: number, status: string) => {
    setGigs(gigs.map((gig) => (gig.id === gigId ? { ...gig, status } : gig)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Gigs</h1>
      <div className="grid gap-4">
        {gigs.map((gig) => (
          <div key={gig.id} className="border rounded p-4 flex flex-col gap-2">
            <div className="font-semibold">{gig.title}</div>
            <div>
              Status: <span className="capitalize">{gig.status}</span>
            </div>
            <div>
              Funded:{" "}
              {gig.funded ? (
                <span className="text-green-600">Yes</span>
              ) : (
                <span className="text-red-600">No</span>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleViewProposals(gig)}
              >
                View Proposals
              </button>
              {!gig.funded && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleFund(gig)}
                >
                  Fund
                </button>
              )}
              {gig.status === "open" && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleStatusUpdate(gig.id, "active")}
                >
                  Mark Active
                </button>
              )}
              {gig.status === "active" && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleStatusUpdate(gig.id, "completed")}
                >
                  Mark Completed
                </button>
              )}
              {gig.status !== "disputed" && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleStatusUpdate(gig.id, "disputed")}
                >
                  Dispute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedGig && (
        <GigProposalsModal
          open={showProposals}
          onClose={() => setShowProposals(false)}
          proposals={selectedGig.proposals}
          onAccept={handleAcceptProposal}
          onReject={handleRejectProposal}
        />
      )}
      <GigFundModal
        open={showFund}
        onClose={() => setShowFund(false)}
        onFund={handleFundGig}
      />
    </div>
  );
}
