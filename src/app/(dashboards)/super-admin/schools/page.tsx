"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";

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

export default function SchoolsPage() {
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
          <Card className="relative w-full max-w-lg mx-4 z-10">
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
                  saveMutation.mutate(Object.fromEntries(fd) as any);
                }}
                className="space-y-4"
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
