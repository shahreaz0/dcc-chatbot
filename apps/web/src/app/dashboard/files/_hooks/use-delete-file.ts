import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";

export function deleteFileMutationOptions() {
  return mutationOptions({
    mutationKey: ["delete-file"],
    mutationFn: async ({ id }: { id: string; projectId?: string }) => {
      const res = await xiorInstance.delete<{ data: { success: boolean } }>(
        `/files/${id}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete file");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["files", variables?.projectId],
      });
    },
  });
}

export function useDeleteFile() {
  return useMutation(deleteFileMutationOptions());
}
