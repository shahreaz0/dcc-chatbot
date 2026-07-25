import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function deleteProjectMutationOptions() {
	return mutationOptions({
		mutationKey: ["delete-project"],
		mutationFn: async (id: string) => {
			const res = await xiorInstance.delete<{ data: { success: boolean } }>(
				`/projects/${id}`,
			);
			return res.data.data;
		},
		onSuccess: () => {
			toast.success("Project deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete project");
		},
		onSettled: (_data, _error, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({ queryKey: ["projects"] });
		},
	});
}

export function useDeleteProject() {
	return useMutation(deleteProjectMutationOptions());
}
