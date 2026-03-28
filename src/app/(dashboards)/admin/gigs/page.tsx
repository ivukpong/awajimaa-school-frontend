import React, { useState } from "react";

// Dummy data for demonstration
const dummyGigs = [
  {
    id: 1,
    title: "Math Tutor Needed",
    sponsor: "Parent A",
    status: "open",
    disputed: false,
  },
  {
    id: 2,
    title: "English Tutor",
    sponsor: "Parent B",
    status: "active",
    disputed: true,
  },
  {
    id: 3,
    title: "Science Tutor",
    sponsor: "Parent C",
    status: "completed",
    disputed: false,
  },
];

const dummyDisputes = [
  { id: 2, gigTitle: "English Tutor", reason: "Payment issue", status: "open" },
];

const AdminGigsPage = () => {
  const [gigs, setGigs] = useState(dummyGigs);
  const [disputes, setDisputes] = useState(dummyDisputes);

  const handleResolveDispute = (disputeId: number) => {
    // TODO: Call API to resolve dispute
    setDisputes(
      disputes.map((d) =>
        d.id === disputeId ? { ...d, status: "resolved" } : d,
      ),
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Gig Monitoring</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">All Gigs</h2>
        <div className="grid gap-3">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="border rounded p-3 flex flex-col gap-1"
            >
              <div className="font-semibold">{gig.title}</div>
              <div>Sponsor: {gig.sponsor}</div>
              <div>
                Status: <span className="capitalize">{gig.status}</span>
              </div>
              {gig.disputed && (
                <span className="text-red-600 font-bold">Disputed</span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Disputes</h2>
        <div className="grid gap-3">
          {disputes.length === 0 ? (
            <div className="text-gray-500">No disputes.</div>
          ) : (
            disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="border rounded p-3 flex flex-col gap-1"
              >
                <div className="font-semibold">{dispute.gigTitle}</div>
                <div>Reason: {dispute.reason}</div>
                <div>
                  Status: <span className="capitalize">{dispute.status}</span>
                </div>
                {dispute.status === "open" && (
                  <button
                    className="btn btn-sm btn-success mt-2"
                    onClick={() => handleResolveDispute(dispute.id)}
                  >
                    Resolve Dispute
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminGigsPage;
