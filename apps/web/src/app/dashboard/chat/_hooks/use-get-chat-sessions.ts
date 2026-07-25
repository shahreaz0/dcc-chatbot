import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { ChatSession } from "@/lib/types";

export function chatSessionsQueryOptions(projectId?: string | null) {
	return queryOptions({
		queryKey: ["chat-sessions", projectId],
		queryFn: async () => {
			if (!projectId) return [];
			const res = await xiorInstance.get<{ data: ChatSession[] }>(
				`/chat/sessions?projectId=${projectId}`,
			);
			return res.data.data;
		},
		enabled: !!projectId,
	});
}

export function useGetChatSessions(projectId?: string | null) {
	return useQuery(chatSessionsQueryOptions(projectId));
}
