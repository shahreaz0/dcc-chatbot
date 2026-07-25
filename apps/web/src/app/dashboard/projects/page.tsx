"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { Input } from "@dcc-chatbot/ui/components/input";
import { Label } from "@dcc-chatbot/ui/components/label";
import { ArrowRight, Check, FolderKanban, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useActiveProject } from "./_hooks/use-active-project";
import { useCreateProject } from "./_hooks/use-create-project";
import { useDeleteProject } from "./_hooks/use-delete-project";
import { useGetProjects } from "./_hooks/use-get-projects";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { activeProjectId, setProject } = useActiveProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject(
      { name, description },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setShowCreate(false);
        },
      },
    );
  };

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
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Create Project Form */}
      {showCreate && (
        <Card className="border-primary/30 bg-primary/5 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Create New Project</CardTitle>
            <CardDescription>
              Group your chat sessions and context files
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proj-name">Project Name</Label>
                <Input
                  id="proj-name"
                  placeholder="e.g. Customer Support Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc">Description (Optional)</Label>
                <Input
                  id="proj-desc"
                  placeholder="Brief description of this project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Save Project"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

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
          <Button onClick={() => setShowCreate(true)} className="gap-2">
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
    </div>
  );
}
