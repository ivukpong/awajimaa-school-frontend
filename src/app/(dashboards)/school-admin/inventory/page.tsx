"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Table, type Column } from "@/components/ui/Table";
import { useInventory, useInventoryCategories } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/inventory";
import {
  Plus,
  AlertTriangle,
  Package,
  Layers,
  ArrowDownUp,
} from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const { items, summary, loading, createItem, recordTransaction } =
    useInventory();
  const { categories } = useInventoryCategories();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    quantity: "",
    reorder_level: "",
    unit_cost: "",
  });
  const [txnForm, setTxnForm] = useState({
    type: "stock_in",
    quantity: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const rows = (items?.data ?? []).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.name || !form.category_id)
      return toast.error("Name and category required");
    setSaving(true);
    try {
      await createItem({
        name: form.name,
        category_id: Number(form.category_id),
        unit: form.unit,
        quantity: Number(form.quantity) || 0,
        reorder_level: Number(form.reorder_level) || 5,
        unit_cost: Number(form.unit_cost) || 0,
      });
      toast.success("Item added");
      setShowCreateModal(false);
    } catch {
      toast.error("Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  const handleTransaction = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await recordTransaction(selectedItem.id, {
        type: txnForm.type,
        quantity: Number(txnForm.quantity),
        notes: txnForm.notes || undefined,
      });
      toast.success("Transaction recorded");
      setShowTxnModal(false);
    } catch {
      toast.error("Failed to record transaction");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: "name",
      header: "Item",
      sortable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "category_id",
      header: "Category",
      render: (r) => (
        <Badge variant="gray">
          {categories.find((c) => c.id === r.category_id)?.name ?? "—"}
        </Badge>
      ),
    },
    { key: "quantity", header: "Qty", sortable: true },
    { key: "unit", header: "Unit" },
    { key: "reorder_level", header: "Reorder Level" },
    {
      key: "quantity" as keyof InventoryItem,
      header: "Stock Status",
      render: (r) =>
        r.quantity <= r.reorder_level ? (
          <Badge variant="red">
            <AlertTriangle className="h-3 w-3 mr-1 inline" />
            Low Stock
          </Badge>
        ) : (
          <Badge variant="green">OK</Badge>
        ),
    },
    {
      key: "id" as keyof InventoryItem,
      header: "Actions",
      render: (r) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedItem(r);
            setTxnForm({ type: "stock_in", quantity: "", notes: "" });
            setShowTxnModal(true);
          }}
        >
          <ArrowDownUp className="h-3 w-3 mr-1" />
          Stock
        </Button>
      ),
    },
  ];

  const s = summary as Record<string, number> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track school assets and consumables
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={s?.total_items ?? 0}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Value"
          value={`₦${(s?.total_value ?? 0).toLocaleString()}`}
          icon={<Layers className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={s?.low_stock_count ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={<Layers className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={
              rows as unknown as (InventoryItem & Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Add Inventory Item</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. pcs"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Initial Qty</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Level</label>
                <Input
                  type="number"
                  value={form.reorder_level}
                  onChange={(e) =>
                    setForm({ ...form, reorder_level: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Unit Cost (₦)</label>
                <Input
                  type="number"
                  value={form.unit_cost}
                  onChange={(e) =>
                    setForm({ ...form, unit_cost: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Add Item"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTxnModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">
              Stock Transaction — {selectedItem.name}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={txnForm.type}
                  onChange={(e) =>
                    setTxnForm({ ...txnForm, type: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="stock_in">Stock In</option>
                  <option value="stock_out">Stock Out</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="damaged">Damaged/Lost</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  value={txnForm.quantity}
                  onChange={(e) =>
                    setTxnForm({ ...txnForm, quantity: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={txnForm.notes}
                  onChange={(e) =>
                    setTxnForm({ ...txnForm, notes: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowTxnModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleTransaction} disabled={saving}>
                {saving ? "Saving…" : "Record"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
