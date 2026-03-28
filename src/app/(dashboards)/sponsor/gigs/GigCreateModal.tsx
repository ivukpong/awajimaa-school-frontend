"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import toast from "react-hot-toast";

interface GigCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GigCreateModal({ open, onClose }: GigCreateModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    subject: "",
    area_of_concentration: "",
    description: "",
    requirements: "",
    duration_value: "",
    duration_unit: "hours",
    start_date: "",
    end_date: "",
    proposed_budget: "",
    currency: "NGN",
    milestones: [],
  });
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: any) => post("/teaching-gigs", payload),
    onSuccess: () => {
      toast.success("Gig created");
      qc.invalidateQueries({ queryKey: ["sponsor-gigs"] });
      onClose();
    },
    onError: () => toast.error("Failed to create gig"),
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
    <Modal open={open} onClose={onClose} title="Create Teaching Gig">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Input
          name="subject"
          label="Subject"
          value={form.subject}
          onChange={handleChange}
          required
        />
        <Input
          name="area_of_concentration"
          label="Area of Concentration"
          value={form.area_of_concentration}
          onChange={handleChange}
        />
        <Textarea
          name="description"
          label="Description"
          value={form.description}
          onChange={handleChange}
        />
        <Textarea
          name="requirements"
          label="Requirements"
          value={form.requirements}
          onChange={handleChange}
        />
        <Input
          name="duration_value"
          label="Duration Value"
          value={form.duration_value}
          onChange={handleChange}
          type="number"
          min={1}
        />
        <Input
          name="duration_unit"
          label="Duration Unit"
          value={form.duration_unit}
          onChange={handleChange}
        />
        <Input
          name="start_date"
          label="Start Date"
          value={form.start_date}
          onChange={handleChange}
          type="date"
        />
        <Input
          name="end_date"
          label="End Date"
          value={form.end_date}
          onChange={handleChange}
          type="date"
        />
        <Input
          name="proposed_budget"
          label="Proposed Budget"
          value={form.proposed_budget}
          onChange={handleChange}
          type="number"
          min={1}
          required
        />
        <Input
          name="currency"
          label="Currency"
          value={form.currency}
          onChange={handleChange}
        />
        {/* TODO: Add milestones UI */}
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
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
