"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@dcc-chatbot/ui/components/dialog";
import { resetPromptsStore, usePromptsStore } from "@/stores/prompts-store";
import { useActiveProject } from "../../projects/_hooks/use-active-project";
import { PromptUpsertForm } from "./prompt-upsert-form";

export function CreatePromptDialog() {
  const { isCreatePromptDialogOpen, setIsCreatePromptDialogOpen } =
    usePromptsStore();
  const { activeProjectId } = useActiveProject();

  const handleClose = () => {
    resetPromptsStore("isCreatePromptDialogOpen");
    setIsCreatePromptDialogOpen(false);
  };

  if (!activeProjectId) return null;

  return (
    <Dialog open={isCreatePromptDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create System Prompt</DialogTitle>
          <DialogDescription>
            Add system instructions to customize AI persona and responses for
            this project.
          </DialogDescription>
        </DialogHeader>

        <PromptUpsertForm
          projectId={activeProjectId}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
