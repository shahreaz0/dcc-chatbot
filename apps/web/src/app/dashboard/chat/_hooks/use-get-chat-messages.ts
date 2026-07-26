import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { ChatMessage } from "@/lib/types";

export function chatMessagesQueryOptions(projectId?: string | null) {
  return queryOptions({
    queryKey: ["chat-messages", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await xiorInstance.get<{ data: ChatMessage[] }>(
        `/projects/${projectId}/messages`,
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useGetChatMessages(projectId?: string | null) {
  return useQuery(chatMessagesQueryOptions(projectId));
}
