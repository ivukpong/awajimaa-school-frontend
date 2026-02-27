"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Search, Filter, Download, MapPin } from "lucide-react";

interface SchoolRow extends Record<string, unknown> {
  id: number;
  name: string;
  lga: string;
  town: string;
  type: string;
  ownership: string;
  students: number;
  status: string;
  reg_number: string;
}

const mockSchools: SchoolRow[] = [
  {
    id: 1,
    name: "Govt. Secondary School, Uyo",
    lga: "Uyo",
    town: "Uyo",
    type: "secondary",
    ownership: "public",
    students: 1240,
    status: "active",
    reg_number: "AKS/SS/001",
  },
  {
    id: 2,
    name: "Greenfield Academy",
    lga: "Ikot Ekpene",
    town: "Ikot Ekpene",
    type: "secondary",
    ownership: "private",
    students: 520,
    status: "active",
    reg_number: "AKS/SS/002",
  },
  {
    id: 3,
    name: "Heritage Nursery & Primary",
    lga: "Eket",
    town: "Eket",
    type: "primary",
    ownership: "private",
    students: 310,
    status: "pending",
    reg_number: "AKS/PR/027",
  },
  {
    id: 4,
    name: "Star of the Sea College",
    lga: "Uyo",
    town: "Uyo",
    type: "secondary",
    ownership: "mission",
    students: 890,
    status: "active",
    reg_number: "AKS/SS/015",
  },
  {
    id: 5,
    name: "Sunrise Nursery School",
    lga: "Abak",
    town: "Abak",
    type: "nursery",
    ownership: "private",
    students: 120,
    status: "active",
    reg_number: "AKS/NR/043",
  },
];

const columns: Column<SchoolRow>[] = [
  {
    key: "name",
    header: "School Name",
    sortable: true,
    render: (r) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {r.name}
      </span>
    ),
  },
  { key: "lga", header: "LGA", sortable: true },
  { key: "town", header: "Town" },
  {
    key: "type",
    header: "Type",
    render: (r) => <Badge variant="blue">{r.type}</Badge>,
  },
  {
    key: "ownership",
    header: "Ownership",
    render: (r) => (
      <Badge
        variant={
          r.ownership === "public"
            ? "gray"
            : r.ownership === "mission"
              ? "purple"
              : "green"
        }
      >
        {r.ownership}
      </Badge>
    ),
  },
  {
    key: "students",
    header: "Students",
    sortable: true,
    render: (r) => r.students.toLocaleString(),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "active" ? "green" : "yellow"}>
        {r.status}
      </Badge>
    ),
  },
  { key: "reg_number", header: "Reg. No." },
];

export default function RegulatorSchoolsPage() {
  const [search, setSearch] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");

  const filtered = mockSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (lgaFilter ? s.lga === lgaFilter : true),
  );

  const lgas = Array.from(new Set(mockSchools.map((s) => s.lga)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schools
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All schools under your regulatory jurisdiction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          <Button size="sm" leftIcon={<MapPin className="h-4 w-4" />}>
            View Map
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search schools..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="flex-1"
          />
          <select
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
          >
            <option value="">All LGAs</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Filter className="h-4 w-4" />}
          >
            More Filters
          </Button>
        </div>
      </Card>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap text-sm">
        {["All", "Active", "Pending", "Suspended"].map((s) => (
          <button
            key={s}
            className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {s}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyField="id"
        emptyMessage="No schools found."
        onRowClick={(row) => console.log("View school", row.id)}
      />
    </div>
  );
}
