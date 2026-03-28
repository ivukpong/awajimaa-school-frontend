import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onFund: (amount: number) => void;
};

const GigFundModal: React.FC<Props> = ({ open, onClose, onFund }) => {
  const [amount, setAmount] = useState(0);
  return (
    <Modal open={open} onClose={onClose} title="Fund Gig">
      <div className="space-y-4">
        <input
          type="number"
          className="border rounded px-3 py-2 w-full"
          placeholder="Enter amount"
          value={amount}
          min={0}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <Button onClick={() => onFund(amount)} disabled={amount <= 0}>
          Fund
        </Button>
      </div>
    </Modal>
  );
};

export default GigFundModal;
