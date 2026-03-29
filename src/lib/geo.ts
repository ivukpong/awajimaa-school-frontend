// Utility for fetching states and LGAs for school forms
import { get } from "@/lib/api";

export interface State {
    id: number;
    name: string;
}
export interface Lga {
    id: number;
    name: string;
}

export async function fetchStates(): Promise<State[]> {
    const res = await get<{ data: State[] }>("/states");
    return res.data ?? [];
}

export async function fetchLgas(stateId: number): Promise<Lga[]> {
    const res = await get<{ data: Lga[] }>(`/lgas?state_id=${stateId}`);
    return res.data ?? [];
}
