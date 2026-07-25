import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function revokeSessionMutationOptions() {
	return mutationOptions({
		mutationKey: ["revoke-session"],
		mutationFn: async (sessionId: string) => {
			const res = await xiorInstance.delete<{ data: { success: boolean } }>(
				`/sessions/${sessionId}`,
			);
			return res.data.data;
		},
		onSuccess: () => {
			toast.success("Session revoked successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to revoke session");
		},
		onSettled: (_data, _error, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({ queryKey: ["sessions"] });
		},
	});
}

export function useRevokeSession() {
	return useMutation(revokeSessionMutationOptions());
}
