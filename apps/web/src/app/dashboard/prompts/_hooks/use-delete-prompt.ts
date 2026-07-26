import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function deletePromptMutationOptions() {
  return mutationOptions({
    mutationKey: ["delete-prompt"],
    mutationFn: async ({
      projectId,
      id,
    }: {
      projectId: string;
      id: string;
    }) => {
      const res = await xiorInstance.delete<{ data: { success: boolean } }>(
        `/projects/${projectId}/prompts/${id}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Prompt deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete prompt");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["prompts", variables?.projectId],
      });
    },
  });
}

export function useDeletePrompt() {
  return useMutation(deletePromptMutationOptions());
}
