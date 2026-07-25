import { queryOptions, useQuery } from "@tanstack/react-query";
import { xiorInstance } from "@/configs/xior";
import type { Project } from "@/lib/types";

export function projectsQueryOptions() {
	return queryOptions({
		queryKey: ["projects"],
		queryFn: async () => {
			const res = await xiorInstance.get<{ data: Project[] }>("/projects");
			return res.data.data;
		},
	});
}

export function useGetProjects() {
	return useQuery(projectsQueryOptions());
}
