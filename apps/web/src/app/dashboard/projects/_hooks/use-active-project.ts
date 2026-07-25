import { useEffect, useState } from "react";
import { useGetProjects } from "./use-get-projects";

export function useActiveProject() {
	const { data: projects = [], isLoading } = useGetProjects();
	const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

	useEffect(() => {
		const savedId =
			typeof window !== "undefined"
				? localStorage.getItem("dcc_active_project")
				: null;
		if (savedId && projects.some((p) => p.id === savedId)) {
			setActiveProjectId(savedId);
		} else if (projects.length > 0) {
			setActiveProjectId(projects[0].id);
			localStorage.setItem("dcc_active_project", projects[0].id);
		}
	}, [projects]);

	const setProject = (id: string) => {
		setActiveProjectId(id);
		if (typeof window !== "undefined") {
			localStorage.setItem("dcc_active_project", id);
		}
	};

	const activeProject =
		projects.find((p) => p.id === activeProjectId) || projects[0] || null;

	return {
		activeProject,
		activeProjectId: activeProject?.id || null,
		projects,
		setProject,
		isLoading,
	};
}
