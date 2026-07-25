import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { ChatSession } from "@/lib/types";

export function createChatSessionMutationOptions() {
  return mutationOptions({
    mutationKey: ["create-chat-session"],
    mutationFn: async (payload: {
      projectId: string;
      title: string;
      promptId?: string;
    }) => {
      const res = await xiorInstance.post<{ data: ChatSession }>(
        "/chat/sessions",
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("New chat session started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create chat session");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["chat-sessions", variables?.projectId],
      });
    },
  });
}

export function useCreateChatSession() {
  return useMutation(createChatSessionMutationOptions());
}
