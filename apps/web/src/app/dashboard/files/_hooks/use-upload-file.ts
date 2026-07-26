import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { ProjectFile } from "@/lib/types";

export function uploadFileMutationOptions() {
  return mutationOptions({
    mutationKey: ["upload-file"],
    mutationFn: async ({
      projectId,
      file,
    }: {
      projectId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await xiorInstance.post<{ data: ProjectFile }>(
        `/projects/${projectId}/files`,
        formData,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload file");
    },
    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["files", variables?.projectId],
      });
    },
  });
}

export function useUploadFile() {
  return useMutation(uploadFileMutationOptions());
}
