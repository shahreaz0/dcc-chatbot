import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function clearChatMessagesMutationOptions() {
  return mutationOptions({
    mutationKey: ["clear-chat-messages"],
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const res = await xiorInstance.delete<{ status: string }>(
        `/projects/${projectId}/messages`,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Chat history cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear chat history");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["chat-messages", variables?.projectId],
      });
    },
  });
}

export function useClearChatMessages() {
  return useMutation(clearChatMessagesMutationOptions());
}
