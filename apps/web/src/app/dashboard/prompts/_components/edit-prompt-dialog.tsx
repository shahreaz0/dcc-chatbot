"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@dcc-chatbot/ui/components/dialog";
import { usePromptsStore } from "@/stores/prompts-store";
import { useActiveProject } from "../../projects/_hooks/use-active-project";
import { PromptUpsertForm } from "./prompt-upsert-form";

export function EditPromptDialog() {
  const { editingPrompt, setEditingPrompt } = usePromptsStore();
  const { activeProjectId } = useActiveProject();

  const handleClose = () => {
    setEditingPrompt(null);
  };

  if (!activeProjectId) return null;

  return (
    <Dialog open={!!editingPrompt} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit System Prompt</DialogTitle>
          <DialogDescription>
            Update persona title and instruction content.
          </DialogDescription>
        </DialogHeader>

        {editingPrompt && (
          <PromptUpsertForm
            key={editingPrompt.id}
            projectId={activeProjectId}
            prompt={editingPrompt}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
