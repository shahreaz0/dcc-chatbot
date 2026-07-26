import { createStore } from "stan-js";
import type { SystemPrompt } from "@/lib/types";

export const { useStore: usePromptsStore, reset: resetPromptsStore } =
  createStore({
    isCreatePromptDialogOpen: false,
    editingPrompt: null as SystemPrompt | null,
  });
