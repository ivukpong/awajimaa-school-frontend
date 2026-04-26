"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

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

export default function TeacherSearch() {
  const [filters, setFilters] = useState({
    subject: "",
    state: "",
    country: "",
    name: "",
    nearMe: false,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type, checked } = e.target;
    setFilters((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Call backend API to search teachers
    alert("Search submitted! (Backend integration needed)");
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <h2 className="text-xl font-bold mb-4">Find a Teacher</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <Select
            label="Subject"
            name="subject"
            value={filters.subject}
            onChange={handleChange}
          >
            <option value="">Any subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="State"
            name="state"
            value={filters.state}
            onChange={handleChange}
            placeholder="e.g. Lagos"
          />
          <Input
            label="Country"
            name="country"
            value={filters.country}
            onChange={handleChange}
            placeholder="e.g. Nigeria"
          />
          <Input
            label="Name"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Teacher name"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="nearMe"
              checked={filters.nearMe}
              onChange={handleChange}
            />
            <span>Show teachers near me</span>
          </label>
          <Button
            type="submit"
            className="w-full bg-brand text-white hover:bg-brand-dark"
          >
            Search
          </Button>
        </form>
      </Card>
    </div>
  );
}
