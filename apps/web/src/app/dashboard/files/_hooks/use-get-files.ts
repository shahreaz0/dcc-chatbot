import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { ProjectFile } from "@/lib/types";

export function filesQueryOptions(projectId?: string | null) {
  return queryOptions({
    queryKey: ["files", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await xiorInstance.get<{ data: ProjectFile[] }>(
        `/files?projectId=${projectId}`,
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useGetFiles(projectId?: string | null) {
  return useQuery(filesQueryOptions(projectId));
}
