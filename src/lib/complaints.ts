import { postForm } from "@/lib/api";

export interface ComplaintPayload {
    subject: string;
    details: string;
    evidence?: File | null;
}

export async function submitComplaint(payload: ComplaintPayload) {
    const formData = new FormData();
    formData.append("subject", payload.subject);
    formData.append("details", payload.details);
    if (payload.evidence) {
        formData.append("evidence", payload.evidence);
    }
    return postForm<{ success: boolean; message: string }>("/complaints", formData);
}
