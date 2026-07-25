import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { Session } from "@/lib/types";

export function sessionsQueryOptions() {
	return queryOptions({
		queryKey: ["sessions"],
		queryFn: async () => {
			const res = await xiorInstance.get<{ data: Session[] }>("/sessions");
			return res.data.data;
		},
	});
}

export function useGetSessions() {
	return useQuery(sessionsQueryOptions());
}
