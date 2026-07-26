"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@dcc-chatbot/ui/components/dialog";
import { useProjectsStore } from "@/stores/projects-store";
import { ProjectUpsertForm } from "./project-upsert-form";

export function EditProjectDialog() {
  const { editingProject, setEditingProject } = useProjectsStore();

  const handleClose = () => {
    setEditingProject(null);
  };

  return (
    <Dialog open={!!editingProject} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project name, description, or settings.
          </DialogDescription>
        </DialogHeader>

        {editingProject && (
          <ProjectUpsertForm
            key={editingProject.id}
            project={editingProject}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
