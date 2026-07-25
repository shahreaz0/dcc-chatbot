import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { ChatMessage } from "@/lib/types";

export function chatMessagesQueryOptions(sessionId?: string | null) {
  return queryOptions({
    queryKey: ["chat-messages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await xiorInstance.get<{ data: ChatMessage[] }>(
        `/chat/messages?sessionId=${sessionId}`,
      );
      return res.data.data;
    },
    enabled: !!sessionId,
  });
}

export function useGetChatMessages(sessionId?: string | null) {
  return useQuery(chatMessagesQueryOptions(sessionId));
}
