import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { SystemPrompt } from "@/lib/types";

export function updatePromptMutationOptions() {
  return mutationOptions({
    mutationKey: ["update-prompt"],
    mutationFn: async ({
      projectId,
      id,
      title,
      content,
      isSystem,
    }: {
      projectId: string;
      id: string;
      title?: string;
      content?: string;
      isSystem?: boolean;
    }) => {
      const res = await xiorInstance.patch<{ data: SystemPrompt }>(
        `/projects/${projectId}/prompts/${id}`,
        { title, content, isSystem },
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("System prompt updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update prompt");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["prompts", variables?.projectId],
      });
    },
  });
}

export function useUpdatePrompt() {
  return useMutation(updatePromptMutationOptions());
}
