// Utility for fetching states and LGAs for school forms
import { get } from "@/lib/api";
import type { State, LGA, ApiResponse } from "@/types";

export async function fetchStates(country?: string): Promise<State[]> {
    let url = "/states";
    if (country) {
        url += `?country=${encodeURIComponent(country)}`;
    }
    const res = await get<State[]>(url);
    return Array.isArray(res.data) ? res.data : [];
}

export async function fetchLgas(stateId: number): Promise<LGA[]> {
    const res = await get<LGA[]>(`/lgas?state_id=${stateId}`);
    return Array.isArray(res.data) ? res.data : [];
}
