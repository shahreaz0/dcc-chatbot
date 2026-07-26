import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { SystemPrompt } from "@/lib/types";

export function createPromptMutationOptions() {
  return mutationOptions({
    mutationKey: ["create-prompt"],
    mutationFn: async ({
      projectId,
      title,
      content,
      isSystem = false,
    }: {
      projectId: string;
      title: string;
      content: string;
      isSystem?: boolean;
    }) => {
      const res = await xiorInstance.post<{ data: SystemPrompt }>(
        `/projects/${projectId}/prompts`,
        { title, content, isSystem },
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("System prompt created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create prompt");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["prompts", variables?.projectId],
      });
    },
  });
}

export function useCreatePrompt() {
  return useMutation(createPromptMutationOptions());
}
