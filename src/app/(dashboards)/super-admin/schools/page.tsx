"use client";

import React, { useState, useEffect } from "react";
import { fetchStates, fetchLgas } from "@/lib/geo";
import type { State, LGA } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";
import { COUNTRIES } from "@/lib/countries";

const SCHOOL_TYPES = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
  { value: "nursery", label: "Pre-primary" },
  { value: "learning_center", label: "Learning Center" },
];
const SCHOOL_MODES = [
  { value: "hybrid", label: "Hybrid" },
  { value: "online", label: "Online" },
  { value: "onsite", label: "OnSite" },
];
const OWNERSHIPS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
  { value: "mission", label: "Mission" },
];

export default function SchoolsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [stateId, setStateId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [mode, setMode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [stateProvince, setStateProvince] = useState("");
  const [slogan, setSlogan] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [cacReg, setCacReg] = useState("");
  const [nin, setNin] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [ninDetails, setNinDetails] = useState<any>(null);
  const [ownership, setOwnership] = useState("");
  const [regNumber, setRegNumber] = useState("");

  useEffect(() => {
    fetchStates().then(setStates);
  }, []);
  useEffect(() => {
    if (stateId) fetchLgas(Number(stateId)).then(setLgas);
    else setLgas([]);
  }, [stateId]);

  interface School extends Record<string, unknown> {
    id: number;
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    is_active: boolean;
    created_at: string;
    branches_count?: number;
    students_count?: number;
  }

  const EMPTY: School = {
    id: 0,
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    is_active: true,
    created_at: "",
  };

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [selected, setSelected] = useState<School>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: () =>
      get<{ data: School[] }>("/schools").then(
        (r) => (r.data as any)?.data ?? r.data ?? [],
      ),
  });

  const schools: School[] = Array.isArray(data) ? data : [];

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<School>) =>
      modal === "edit"
        ? put(`/schools/${selected.id}`, payload)
        : post("/schools", payload),
    onSuccess: () => {
      toast.success(modal === "edit" ? "School updated" : "School created");
      qc.invalidateQueries({ queryKey: ["schools"] });
      setModal(null);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/schools/${id}`),
    onSuccess: () => {
      toast.success("School deleted");
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
    onError: () => toast.error("Failed to delete school"),
  });

  function openEdit(school: School) {
    setSelected(school);
    setModal("edit");
  }

  function openCreate() {
    setSelected(EMPTY);
    setModal("create");
  }

  const columns: Column<School>[] = [
    {
      key: "name",
      header: "School",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.name}
          </p>
          <p className="text-xs text-gray-500">{row.code}</p>
        </div>
      ),
    },
    { key: "email", header: "Email", sortable: true },
    { key: "phone", header: "Phone" },
    {
      key: "branches_count",
      header: "Branches",
      render: (row) => (
        <span className="font-medium">{row.branches_count ?? 0}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "green" : "red"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${row.name}"?`))
                deleteMutation.mutate(row.id);
            }}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schools
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {schools.length} school{schools.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          Add School
        </Button>
      </div>

      {/* Table card */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            placeholder="Search schools…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="max-w-sm"
          />
        </div>
        <Table
          keyField="id"
          columns={columns}
          data={filtered as any}
          loading={isLoading}
          emptyMessage="No schools found."
        />
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModal(null)}
          />
          <Card className="relative w-full max-w-xl mx-4 z-10">
            <CardHeader>
              <CardTitle>
                {modal === "edit" ? "Edit School" : "Add School"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = Object.fromEntries(fd) as any;
                  payload.state_id = stateId;
                  payload.lga_id = lgaId;
                  payload.types = schoolTypes;
                  payload.mode = mode;
                  payload.country = country;
                  payload.slogan = slogan;
                  payload.ownership = ownership;
                  payload.registration_number = regNumber;
                  payload.cac_registration_number = cacReg;
                  payload.nin = nin;
                  payload.nin_verified = ninVerified;
                  payload.nin_details = ninDetails;
                  if (logo) {
                    // handle logo upload (pseudo, replace with actual upload logic)
                    payload.logo = logo;
                  }
                  saveMutation.mutate(payload);
                }}
                className="space-y-4 max-h-[80vh] overflow-y-auto pr-2"
                style={{ minWidth: 400 }}
              >
                <Input
                  label="School Name"
                  name="name"
                  defaultValue={selected.name}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Code"
                    name="code"
                    defaultValue={selected.code}
                    required
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    defaultValue={selected.phone}
                  />
                </div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={selected.email}
                />
                <Input
                  label="Address"
                  name="address"
                  defaultValue={selected.address}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Country
                    </label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setStateId("");
                        setLgaId("");
                      }}
                      required
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      State
                    </label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={stateId}
                      onChange={(e) => setStateId(e.target.value)}
                      required
                      disabled={!country}
                    >
                      <option value="">Select state</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      LGA
                    </label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={lgaId}
                      onChange={(e) => setLgaId(e.target.value)}
                      required
                      disabled={!stateId}
                    >
                      <option value="">Select LGA</option>
                      {lgas.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Type (multi-select)
                    </label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={schoolTypes}
                      onChange={(e) => {
                        const opts = Array.from(e.target.selectedOptions).map(
                          (o) => o.value,
                        );
                        setSchoolTypes(opts);
                      }}
                      multiple
                      required
                    >
                      {SCHOOL_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Mode
                    </label>
                    <select
                      className="w-full rounded border px-3 py-2"
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      required
                    >
                      <option value="">Select mode</option>
                      {SCHOOL_MODES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Slogan"
                  name="slogan"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="School slogan"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogo(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      CAC Registration Number (optional)
                    </label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      value={cacReg}
                      onChange={(e) => setCacReg(e.target.value)}
                      placeholder="RC 123456"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      NIN of Proprietor/Key Promoter
                    </label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                      placeholder="Enter 11-digit NIN"
                      maxLength={11}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!nin || nin.length !== 11) {
                          toast.error("Enter a valid 11-digit NIN");
                          return;
                        }
                        // Simulate NIN validation and extraction
                        setNinVerified(false);
                        setNinDetails(null);
                        toast.loading("Validating NIN...");
                        // Replace with actual API call
                        setTimeout(() => {
                          setNinVerified(true);
                          setNinDetails({
                            name: "John Doe",
                            gender: "male",
                            dob: "1980-01-01",
                          });
                          toast.dismiss();
                          toast.success("NIN verified and details extracted");
                        }, 1200);
                      }}
                      disabled={ninVerified}
                    >
                      {ninVerified ? "Verified" : "Validate NIN"}
                    </Button>
                  </div>
                </div>
                {ninVerified && ninDetails && (
                  <div className="rounded border p-2 text-sm text-green-700 bg-green-50 mt-2">
                    <div>
                      <b>Name:</b> {ninDetails.name}
                    </div>
                    <div>
                      <b>Gender:</b> {ninDetails.gender}
                    </div>
                    <div>
                      <b>Date of Birth:</b> {ninDetails.dob}
                    </div>
                  </div>
                )}
                <Input
                  label="Registration Number"
                  name="registration_number"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="RC 123456"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={saveMutation.isPending}>
                    {modal === "edit" ? "Save Changes" : "Create School"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
