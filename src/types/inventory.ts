// ─── Inventory ─────────────────────────────────────────────────────────────

export interface InventoryCategory {
    id: number;
    school_id: number;
    name: string;
    description?: string;
    items_count?: number;
}

export interface InventoryItem {
    id: number;
    school_id: number;
    branch_id?: number;
    category_id?: number;
    name: string;
    sku?: string;
    description?: string;
    unit: string;
    unit_cost: number;
    quantity_in_stock: number;
    reorder_level: number;
    condition: "new" | "good" | "fair" | "poor";
    status: "active" | "discontinued" | "disposed";
    location?: string;
    barcode?: string;
    expiry_date?: string;
    is_low_stock?: boolean;
    category?: InventoryCategory;
    created_at: string;
}

export interface InventoryTransaction {
    id: number;
    inventory_item_id: number;
    type: "stock_in" | "stock_out" | "adjustment" | "disposal" | "transfer";
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    reference?: string;
    notes?: string;
    performed_by: number;
    destination_branch_id?: number;
    performer?: { id: number; name: string };
    created_at: string;
}

export interface PurchaseOrder {
    id: number;
    school_id: number;
    branch_id?: number;
    po_number: string;
    supplier_name: string;
    supplier_email?: string;
    supplier_phone?: string;
    total_amount: number;
    status: "draft" | "submitted" | "approved" | "received" | "cancelled";
    expected_delivery_date?: string;
    received_date?: string;
    notes?: string;
    created_by: number;
    approved_by?: number;
    approved_at?: string;
    items?: PurchaseOrderItem[];
    creator?: { id: number; name: string };
    created_at: string;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    inventory_item_id?: number;
    item_name: string;
    quantity: number;
    unit_cost: number;
    total_cost?: number;
    quantity_received: number;
    inventory_item?: InventoryItem;
}

// ─── Admissions ────────────────────────────────────────────────────────────

export interface AdmissionSession {
    id: number;
    school_id: number;
    academic_year_id?: number;
    name: string;
    description?: string;
    open_date: string;
    close_date: string;
    slots?: number;
    application_fee: number;
    required_documents?: string[];
    admission_classes?: string[];
    is_active: boolean;
    applications_count?: number;
}

export type AdmissionStatus =
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "entrance_exam"
    | "admitted"
    | "rejected"
    | "withdrawn";

export interface AdmissionApplication {
    id: number;
    admission_session_id: number;
    school_id: number;
    application_number: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female";
    nationality?: string;
    state_of_origin?: string;
    lga_of_origin?: string;
    address?: string;
    previous_school?: string;
    last_class_attended?: string;
    applying_for_class: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email?: string;
    guardian_relationship?: string;
    status: AdmissionStatus;
    review_notes?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    exam_date?: string;
    exam_score?: number;
    payment_reference?: string;
    fee_paid: boolean;
    documents?: string[];
    student_id?: number;
    session?: AdmissionSession;
    full_name?: string;
    created_at: string;
}
