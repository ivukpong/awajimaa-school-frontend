"use client";
import React, { useState } from "react";
import { submitComplaint } from "@/lib/complaints";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

export default function ComplaintsPage() {
  const [form, setForm] = useState({
    subject: "",
    details: "",
    evidence: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type, files } = e.target;
    if (type === "file" && files) {
      setForm((f) => ({ ...f, evidence: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitComplaint({
        subject: form.subject,
        details: form.details,
        evidence: form.evidence,
      });
      setSuccess(true);
    } catch (err) {
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <h2 className="text-xl font-bold mb-4">Submit a Complaint</h2>
        {success ? (
          <div className="text-green-600 font-semibold py-6 text-center">
            Complaint submitted! Our team will review and contact you if needed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
            <Textarea
              label="Details"
              name="details"
              value={form.details}
              onChange={handleChange}
              rows={4}
              required
            />
            <Input
              label="Evidence (optional)"
              name="evidence"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
            <Button
              type="submit"
              className="w-full bg-brand text-white hover:bg-brand-dark"
              loading={submitting}
            >
              Submit Complaint
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
