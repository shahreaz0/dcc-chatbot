import { useEffect } from "react";
import { useProjectsStore } from "@/stores/projects-store";
import { useGetProjects } from "./use-get-projects";

export function useActiveProject() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { activeProjectId, setActiveProjectId } = useProjectsStore();

  useEffect(() => {
    const savedId =
      typeof window !== "undefined"
        ? localStorage.getItem("dcc_active_project")
        : null;

    if (savedId && projects.some((p) => p.id === savedId)) {
      if (activeProjectId !== savedId) {
        setActiveProjectId(savedId);
      }
    } else if (projects.length > 0) {
      if (!activeProjectId || !projects.some((p) => p.id === activeProjectId)) {
        setActiveProjectId(projects[0].id);
        if (typeof window !== "undefined") {
          localStorage.setItem("dcc_active_project", projects[0].id);
        }
      }
    } else if (!isLoading && projects.length === 0) {
      if (activeProjectId !== null) {
        setActiveProjectId(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("dcc_active_project");
        }
      }
    }
  }, [projects, activeProjectId, setActiveProjectId, isLoading]);

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
