"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import GigProposalModal from "./GigProposalModal";
import { formatDate } from "@/lib/utils";

export default function TeacherGigsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-gigs"],
    queryFn: () =>
      get<any>("/teaching-gigs?scope=available").then(
        (r) => r.data?.data?.data ?? [],
      ),
  });
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [showProposal, setShowProposal] = useState(false);
  const gigs = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available Teaching Gigs</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading…</p>
        ) : gigs.length === 0 ? (
          <p>No gigs available.</p>
        ) : (
          gigs.map((gig: any) => (
            <Card key={gig.id}>
              <CardHeader>
                <CardTitle>{gig.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="font-medium">Subject:</span> {gig.subject}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span>{" "}
                    {gig.proposed_budget} {gig.currency}
                  </div>
                  <div>
                    <span className="font-medium">Start:</span>{" "}
                    {gig.start_date ? formatDate(gig.start_date) : "-"}
                  </div>
                  <div>
                    <span className="font-medium">End:</span>{" "}
                    {gig.end_date ? formatDate(gig.end_date) : "-"}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedGig(gig);
                      setShowProposal(true);
                    }}
                  >
                    Submit Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {showProposal && selectedGig && (
        <GigProposalModal
          gig={selectedGig}
          open={showProposal}
          onClose={() => setShowProposal(false)}
        />
      )}
    </div>
  );
}
