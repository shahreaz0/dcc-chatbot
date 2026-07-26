import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { Project } from "@/lib/types";

export function updateProjectMutationOptions() {
  return mutationOptions({
    mutationKey: ["update-project"],
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      const res = await xiorInstance.patch<{ data: Project }>(
        `/projects/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  return useMutation(updateProjectMutationOptions());
}
