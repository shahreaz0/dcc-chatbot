"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@dcc-chatbot/ui/components/dialog";
import { resetProjectsStore, useProjectsStore } from "@/stores/projects-store";
import { ProjectUpsertForm } from "./project-upsert-form";

export function CreateProjectDialog() {
  const { isCreateProjectDialogOpen, setIsCreateProjectDialogOpen } =
    useProjectsStore();

  const handleClose = () => {
    resetProjectsStore("isCreateProjectDialogOpen");
    setIsCreateProjectDialogOpen(false);
  };

  return (
    <Dialog open={isCreateProjectDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to organize your continuous chat history, prompts,
            and context.
          </DialogDescription>
        </DialogHeader>

        <ProjectUpsertForm onSuccess={handleClose} onCancel={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
