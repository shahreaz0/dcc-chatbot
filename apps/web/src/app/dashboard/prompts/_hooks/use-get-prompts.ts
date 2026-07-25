import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { SystemPrompt } from "@/lib/types";

export function promptsQueryOptions() {
	return queryOptions({
		queryKey: ["prompts"],
		queryFn: async () => {
			const res = await xiorInstance.get<{ data: SystemPrompt[] }>("/prompts");
			return res.data.data;
		},
	});
}

export function useGetPrompts() {
	return useQuery(promptsQueryOptions());
}
