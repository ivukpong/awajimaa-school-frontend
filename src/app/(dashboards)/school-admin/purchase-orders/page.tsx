"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { usePurchaseOrders } from "@/hooks/useInventory";
import { useInventory } from "@/hooks/useInventory";
import type { PurchaseOrder } from "@/types/inventory";
import { Plus, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import toast from "react-hot-toast";

const statusVariant: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  draft: "gray",
  submitted: "yellow",
  approved: "blue",
  received: "green",
  cancelled: "red",
};

export default function PurchaseOrdersPage() {
  const {
    orders,
    loading,
    createOrder,
    approveOrder,
    receiveOrder,
    cancelOrder,
  } = usePurchaseOrders();
  const { items: inventoryItems } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    supplier_name: "",
    supplier_contact: "",
    expected_delivery_date: "",
    notes: "",
  });
  const [orderItems, setOrderItems] = useState([
    { inventory_item_id: "", quantity: "", unit_cost: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addLine = () =>
    setOrderItems([
      ...orderItems,
      { inventory_item_id: "", quantity: "", unit_cost: "" },
    ]);
  const removeLine = (i: number) =>
    setOrderItems(orderItems.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!form.supplier_name) return toast.error("Supplier name required");
    setSaving(true);
    try {
      await createOrder({
        ...form,
        items: orderItems.map((i) => ({
          inventory_item_id: Number(i.inventory_item_id),
          quantity: Number(i.quantity),
          unit_cost: Number(i.unit_cost),
        })),
      });
      toast.success("Purchase order created");
      setShowModal(false);
    } catch {
      toast.error("Failed to create PO");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "po_number",
      header: "PO Number",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-medium">{r.po_number}</span>
      ),
    },
    { key: "supplier_name", header: "Supplier", sortable: true },
    {
      key: "total_amount",
      header: "Total",
      render: (r) => `₦${Number(r.total_amount).toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusVariant[r.status] ?? "gray"}>
          {r.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    { key: "expected_delivery_date", header: "Expected Delivery" },
    {
      key: "id" as keyof PurchaseOrder,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          {r.status === "submitted" && (
            <Button
              size="sm"
              onClick={() =>
                approveOrder(r.id)
                  .then(() => toast.success("Approved"))
                  .catch(() => toast.error("Failed"))
              }
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          {r.status === "approved" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                receiveOrder(r.id, {})
                  .then(() => toast.success("Received"))
                  .catch(() => toast.error("Failed"))
              }
            >
              <PackageCheck className="h-3 w-3" />
            </Button>
          )}
          {["draft", "submitted"].includes(r.status) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                cancelOrder(r.id)
                  .then(() => toast.success("Cancelled"))
                  .catch(() => toast.error("Failed"))
              }
            >
              <XCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage procurement and stock replenishment
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            keyField="id"
            columns={columns}
            data={
              (orders?.data ?? []) as unknown as (PurchaseOrder &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">New Purchase Order</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Supplier Name *</label>
                <Input
                  value={form.supplier_name}
                  onChange={(e) =>
                    setForm({ ...form, supplier_name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Supplier Contact</label>
                <Input
                  value={form.supplier_contact}
                  onChange={(e) =>
                    setForm({ ...form, supplier_contact: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Expected Delivery Date
                </label>
                <Input
                  type="date"
                  value={form.expected_delivery_date}
                  onChange={(e) =>
                    setForm({ ...form, expected_delivery_date: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Order Items</h3>
                <Button size="sm" variant="secondary" onClick={addLine}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Line
                </Button>
              </div>
              {orderItems.map((line, i) => (
                <div key={i} className="grid grid-cols-10 gap-2 items-end">
                  <div className="col-span-4">
                    <select
                      value={line.inventory_item_id}
                      onChange={(e) => {
                        const c = [...orderItems];
                        c[i].inventory_item_id = e.target.value;
                        setOrderItems(c);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select item…</option>
                      {(inventoryItems?.data ?? []).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => {
                        const c = [...orderItems];
                        c[i].quantity = e.target.value;
                        setOrderItems(c);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Unit cost"
                      value={line.unit_cost}
                      onChange={(e) => {
                        const c = [...orderItems];
                        c[i].unit_cost = e.target.value;
                        setOrderItems(c);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeLine(i)}
                    className="text-red-500 hover:text-red-700 text-xl leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating…" : "Create PO"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
