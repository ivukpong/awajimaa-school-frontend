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

export async function fetchLgas(country: string, stateName: string): Promise<LGA[]> {
    if (!country || !stateName) return [];
    const url = `/lgas?country=${encodeURIComponent(country)}&state_name=${encodeURIComponent(stateName)}`;
    const res = await get<LGA[]>(url);
    return Array.isArray(res.data) ? res.data : [];
}
