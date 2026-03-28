"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import toast from "react-hot-toast";

interface GigProposalModalProps {
  gig: any;
  open: boolean;
  onClose: () => void;
}

export default function GigProposalModal({
  gig,
  open,
  onClose,
}: GigProposalModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    proposed_price: gig.proposed_budget,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      post(`/teaching-gigs/${gig.id}/propose`, payload),
    onSuccess: () => {
      toast.success("Proposal submitted");
      qc.invalidateQueries({ queryKey: ["teacher-gigs"] });
      onClose();
    },
    onError: () => toast.error("Failed to submit proposal"),
  });

  const handleChange = (e: any) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    mutation.mutate(form, {
      onSettled: () => setLoading(false),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Submit Proposal for ${gig.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="proposed_price"
          label="Proposed Price"
          value={form.proposed_price}
          onChange={handleChange}
          type="number"
          min={1}
          required
        />
        <Textarea
          name="message"
          label="Message"
          value={form.message}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
