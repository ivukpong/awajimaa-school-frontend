import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";

export function useSubjects() {
    return useQuery({
        queryKey: ["subjects"],
        queryFn: () => get<{ id: number; name: string; code: string }[]>("/subjects"),
    });
}
