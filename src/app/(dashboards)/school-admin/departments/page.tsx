"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useDepartments } from "@/hooks/useHR";
import type { Department } from "@/types/hr";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
  const {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    head_id: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", head_id: "" });
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description ?? "",
      head_id: dept.head_id?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        head_id: form.head_id
          ? Number(form.head_id)
          : undefined,
      };
      if (editing) {
        await updateDepartment(editing.id, payload);
        toast.success("Department updated");
      } else {
        await createDepartment(payload);
        toast.success("Department created");
      }
      setShowModal(false);
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Delete "${dept.name}"?`)) return;
    try {
      await deleteDepartment(dept.id);
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete department");
    }
  };

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Department",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {r.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-gray-500 text-sm">{r.description ?? "—"}</span>
      ),
    },
    {
      key: "teachers_count",
      header: "Teachers",
      render: (r) => <Badge variant="blue">{r.teachers_count ?? 0}</Badge>,
    },
    {
      key: "actions" as keyof Department,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage school departments and their heads
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={
              filtered as unknown as (Department & Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? "Edit Department" : "New Department"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sciences"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional description"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
