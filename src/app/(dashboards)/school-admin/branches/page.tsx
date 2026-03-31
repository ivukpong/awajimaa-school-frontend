"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";
import type { SchoolBranch } from "@/types/school";

const EMPTY: Partial<SchoolBranch> = {
  name: "",
  address: "",
  phone: "",
  email: "",
  is_active: true,
};

export default function BranchesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | "create" | "edit">(null);
  const [selected, setSelected] = useState<Partial<SchoolBranch>>(EMPTY);

  // Fetch branches for current school
  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () =>
      get<{ data: SchoolBranch[] }>("/branches").then(
        (r) => r.data?.data ?? r.data ?? [],
      ),
  });
  const branches: SchoolBranch[] = Array.isArray(data) ? data : [];

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<SchoolBranch>) =>
      modal === "edit"
        ? put(`/branches/${selected.id}`, payload)
        : post("/branches", payload),
    onSuccess: () => {
      toast.success(modal === "edit" ? "Branch updated" : "Branch created");
      qc.invalidateQueries({ queryKey: ["branches"] });
      setModal(null);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/branches/${id}`),
    onSuccess: () => {
      toast.success("Branch deleted");
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => toast.error("Failed to delete branch"),
  });

  function openEdit(branch: SchoolBranch) {
    setSelected(branch);
    setModal("edit");
  }
  function openCreate() {
    setSelected(EMPTY);
    setModal("create");
  }

  const columns: Column<SchoolBranch>[] = [
    { key: "name", header: "Branch Name", sortable: true },
    { key: "address", header: "Address" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <span
          className={`font-medium ${row.is_active ? "text-green-600" : "text-red-600"}`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteMutation.mutate(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Branches
        </h1>
        <Button onClick={openCreate}>Add Branch</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={branches}
            loading={isLoading}
            emptyMessage="No branches found."
          />
        </CardContent>
      </Card>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {modal === "edit" ? "Edit Branch" : "Add Branch"}
            </h2>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload = Object.fromEntries(fd) as any;
                payload.is_active = Boolean(fd.get("is_active"));
                saveMutation.mutate(payload);
              }}
            >
              <Input
                label="Branch Name"
                name="name"
                required
                defaultValue={selected.name}
                placeholder="e.g. Main Campus"
              />
              <Input
                label="Address"
                name="address"
                required
                defaultValue={selected.address}
                placeholder="e.g. 12 Education Road, Lagos"
              />
              <Input
                label="Phone"
                name="phone"
                defaultValue={selected.phone}
                placeholder="e.g. +234 800 000 0000"
              />
              <Input
                label="Email"
                name="email"
                defaultValue={selected.email}
                placeholder="e.g. branch@school.edu.ng"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={selected.is_active}
                />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saveMutation.isPending}>
                  {modal === "edit" ? "Save Changes" : "Create Branch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
