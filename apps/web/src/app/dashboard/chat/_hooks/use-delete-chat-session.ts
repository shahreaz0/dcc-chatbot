import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function deleteChatSessionMutationOptions() {
  return mutationOptions({
    mutationKey: ["delete-chat-session"],
    mutationFn: async ({
      sessionId,
    }: {
      sessionId: string;
      projectId?: string;
    }) => {
      const res = await xiorInstance.delete<{ data: { success: boolean } }>(
        `/chat/sessions/${sessionId}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Chat session deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete chat session");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["chat-sessions", variables?.projectId],
      });
    },
  });
}

export function useDeleteChatSession() {
  return useMutation(deleteChatSessionMutationOptions());
}
