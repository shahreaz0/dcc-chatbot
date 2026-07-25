import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { SystemPrompt } from "@/lib/types";

export function createPromptMutationOptions() {
  return mutationOptions({
    mutationKey: ["create-prompt"],
    mutationFn: async (payload: {
      name: string;
      prompt: string;
      description?: string;
    }) => {
      const res = await xiorInstance.post<{ data: SystemPrompt }>(
        "/prompts",
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("System prompt created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create prompt");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

export function useCreatePrompt() {
  return useMutation(createPromptMutationOptions());
}
