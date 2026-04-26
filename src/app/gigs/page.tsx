"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Literature",
  "Geography",
  "ICT",
  // ...add more
];

export default function GigsPage() {
  const [form, setForm] = useState({
    subject: "",
    duration: "",
    amount: "",
    currency: "NGN",
    type: "physical",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Submit gig to backend
    alert("Gig submitted! (Backend integration needed)");
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <h2 className="text-xl font-bold mb-4">Engage a Subject Teacher</h2>
        <div className="mb-4">
          <a
            href="/gigs/search"
            className="text-brand underline hover:text-brand-dark text-sm"
          >
            Or search for teachers by subject, location, or name
          </a>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="Duration (weeks)"
            name="duration"
            type="number"
            min={1}
            value={form.duration}
            onChange={handleChange}
            required
          />
          <Input
            label="Amount"
            name="amount"
            type="number"
            min={0}
            value={form.amount}
            onChange={handleChange}
            required
          />
          <Select
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            required
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </Select>
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="physical">Physical</option>
            <option value="virtual">Virtual</option>
          </Select>
          <Textarea
            label="Description (optional)"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
          <Button
            type="submit"
            className="w-full bg-brand text-white hover:bg-brand-dark"
          >
            Submit Gig
          </Button>
        </form>
      </Card>
    </div>
  );
}
