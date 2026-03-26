"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  useFreelancerProfile,
  useCreateFreelancerProfile,
  useUpdateFreelancerProfile,
} from "@/hooks/useFreelancer";

const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "History",
  "Geography",
  "Literature",
  "Computer Science",
  "Further Mathematics",
  "Agricultural Science",
];

export default function FreelancerProfilePage() {
  const { data: profileRes, isLoading } = useFreelancerProfile();
  const createProfile = useCreateFreelancerProfile();
  const updateProfile = useUpdateFreelancerProfile();

  const profile = profileRes?.data;
  const isNew = !profile;

  const [form, setForm] = useState({
    hourly_rate_usd: "",
    hourly_rate_ngn: "",
    bio: "",
    qualification: "",
    specialization: "",
    state: "",
    lga: "",
    is_available: true,
    subjects: [] as string[],
    google_scholar_url: "",
    publons_url: "",
    researchgate_url: "",
    orcid_url: "",
    scopus_url: "",
  });

  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        hourly_rate_usd: String(profile.hourly_rate_usd ?? ""),
        hourly_rate_ngn: String(profile.hourly_rate_ngn ?? ""),
        bio: profile.bio ?? "",
        qualification: profile.qualification ?? "",
        specialization: profile.specialization ?? "",
        state: profile.state ?? "",
        lga: profile.lga ?? "",
        is_available: profile.is_available ?? true,
        subjects: profile.subjects ?? [],
        google_scholar_url: profile.google_scholar_url ?? "",
        publons_url: profile.publons_url ?? "",
        researchgate_url: profile.researchgate_url ?? "",
        orcid_url: profile.orcid_url ?? "",
        scopus_url: profile.scopus_url ?? "",
      });
    }
  }, [profile]);

  function addSubject(subject: string) {
    const trimmed = subject.trim();
    if (trimmed && !form.subjects.includes(trimmed)) {
      setForm((prev) => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
    }
    setSubjectInput("");
  }

  function removeSubject(subject: string) {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      hourly_rate_usd: parseFloat(form.hourly_rate_usd) || 0,
      hourly_rate_ngn: parseFloat(form.hourly_rate_ngn) || 0,
    };
    try {
      if (isNew) {
        await createProfile.mutateAsync(payload);
        toast.success("Profile created successfully!");
      } else {
        await updateProfile.mutateAsync(payload);
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-400">Loading profile…</div>
    );
  }

  const isPending = createProfile.isPending || updateProfile.isPending;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Freelancer Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Rates &amp; Availability</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hourly Rate (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.hourly_rate_usd}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hourly_rate_usd: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hourly Rate (NGN)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.hourly_rate_ngn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hourly_rate_ngn: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                id="is_available"
                checked={form.is_available}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_available: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label
                htmlFor="is_available"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Available for engagements
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects You Teach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {form.subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSubject(s)}
                    className="ml-1 text-blue-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a subject"
                list="subject-suggestions"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubject(subjectInput);
                  }
                }}
              />
              <datalist id="subject-suggestions">
                {SUBJECT_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <Button
                type="button"
                variant="outline"
                onClick={() => addSubject(subjectInput)}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle>Bio &amp; Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell parents and schools about yourself…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Qualification
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.qualification}
                onChange={(e) =>
                  setForm((p) => ({ ...p, qualification: e.target.value }))
                }
                placeholder="e.g. B.Ed, M.Sc, PhD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialization
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.specialization}
                onChange={(e) =>
                  setForm((p) => ({ ...p, specialization: e.target.value }))
                }
                placeholder="e.g. STEM Education"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.state}
                onChange={(e) =>
                  setForm((p) => ({ ...p, state: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LGA
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.lga}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lga: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Scholar Links */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Profile Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                { key: "google_scholar_url", label: "Google Scholar" },
                { key: "publons_url", label: "Publons / Web of Science" },
                { key: "researchgate_url", label: "ResearchGate" },
                { key: "orcid_url", label: "ORCID" },
                { key: "scopus_url", label: "Scopus" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={`https://...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : isNew ? "Create Profile" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
