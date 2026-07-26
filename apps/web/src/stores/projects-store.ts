import { createStore } from "stan-js";
import type { Project } from "@/lib/types";

export const { useStore: useProjectsStore, reset: resetProjectsStore } =
  createStore({
    isCreateProjectDialogOpen: false,
    editingProject: null as Project | null,
    activeProjectId:
      typeof window !== "undefined"
        ? localStorage.getItem("dcc_active_project")
        : (null as string | null),
  });
