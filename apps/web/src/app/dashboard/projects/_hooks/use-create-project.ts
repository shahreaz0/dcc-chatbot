import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { Project } from "@/lib/types";

export function createProjectMutationOptions() {
	return mutationOptions({
		mutationKey: ["create-project"],
		mutationFn: async (payload: { name: string; description?: string }) => {
			const res = await xiorInstance.post<{ data: Project }>(
				"/projects",
				payload,
			);
			return res.data.data;
		},
		onSuccess: () => {
			toast.success("Project created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create project");
		},
		onSettled: (_data, _error, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useCreateProject() {
	return useMutation(createProjectMutationOptions());
}
