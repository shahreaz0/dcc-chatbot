import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { SystemPrompt } from "@/lib/types";

export function promptsQueryOptions(projectId?: string | null) {
  return queryOptions({
    queryKey: ["prompts", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await xiorInstance.get<{ data: SystemPrompt[] }>(
        `/projects/${projectId}/prompts`,
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useGetPrompts(projectId?: string | null) {
  return useQuery(promptsQueryOptions(projectId));
}
