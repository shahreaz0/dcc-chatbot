"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { ArrowRight, Check, FolderKanban, Plus, Trash2 } from "lucide-react";
import { useProjectsStore } from "@/stores/projects-store";
import { CreateProjectDialog } from "./_components/create-project-dialog";
import { useActiveProject } from "./_hooks/use-active-project";
import { useDeleteProject } from "./_hooks/use-delete-project";
import { useGetProjects } from "./_hooks/use-get-projects";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { activeProjectId, setProject } = useActiveProject();
  const { setIsCreateProjectDialogOpen } = useProjectsStore();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">
            Projects Workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your AI knowledge bases and conversation environments
          </p>
        </div>
        <Button
          onClick={() => setIsCreateProjectDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <FolderKanban className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="font-semibold text-lg">No Projects Found</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Create your first project to start chatting
          </p>
          <Button
            onClick={() => setIsCreateProjectDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <Card
                key={proj.id}
                className={`relative flex flex-col justify-between transition-all hover:shadow-md ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                    : "border-border/60"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="max-w-45 truncate font-semibold text-base">
                      {proj.name}
                    </CardTitle>
                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground text-xs">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {proj.description || "No description provided"}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="flex items-center justify-between border-border/40 border-t pt-3">
                  <Button
                    variant={isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setProject(proj.id)}
                    className="gap-1.5 text-xs"
                  >
                    {isActive ? "Selected" : "Set Active"}{" "}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProject(proj.id)}
                    disabled={isDeleting}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Global Dialog Component */}
      <CreateProjectDialog />
    </div>
  );
}
