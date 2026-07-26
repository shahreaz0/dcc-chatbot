import { createStore } from "stan-js";

export const { useStore: useProjectsStore, reset: resetProjectsStore } =
  createStore({
    isCreateProjectDialogOpen: false,
    activeProjectId:
      typeof window !== "undefined"
        ? localStorage.getItem("dcc_active_project")
        : (null as string | null),
  });
