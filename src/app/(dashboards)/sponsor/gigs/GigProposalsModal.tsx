import React from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type Proposal = {
  id: number;
  teacherName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
};

type Props = {
  open: boolean;
  onClose: () => void;
  proposals: Proposal[];
  onAccept: (proposalId: number) => void;
  onReject: (proposalId: number) => void;
};

const GigProposalsModal: React.FC<Props> = ({
  open,
  onClose,
  proposals,
  onAccept,
  onReject,
}) => (
  <Modal open={open} onClose={onClose} title="Gig Proposals">
    <div className="space-y-4">
      {proposals.length === 0 ? (
        <div className="text-gray-500">No proposals yet.</div>
      ) : (
        proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="border rounded p-3 flex flex-col gap-2"
          >
            <div className="font-semibold">{proposal.teacherName}</div>
            <div className="text-sm text-gray-700">{proposal.message}</div>
            <div className="flex gap-2 items-center">
              <span
                className={`text-xs px-2 py-1 rounded ${proposal.status === "pending" ? "bg-yellow-100 text-yellow-800" : proposal.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {proposal.status}
              </span>
              {proposal.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAccept(proposal.id)}
                    variant="success"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onReject(proposal.id)}
                    variant="danger"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </Modal>
);

export default GigProposalsModal;
