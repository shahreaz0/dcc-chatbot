import { createStore } from "stan-js";

export const { useStore: useProjectsStore, reset: resetProjectsStore } =
  createStore({
    isCreateProjectDialogOpen: false,
  });
