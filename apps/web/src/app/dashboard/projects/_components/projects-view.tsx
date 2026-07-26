"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { Input } from "@dcc-chatbot/ui/components/input";
import {
  ArrowRight,
  Calendar,
  Check,
  FolderKanban,
  MessageSquare,
  Plus,
  Search,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProjectsStore } from "@/stores/projects-store";
import { useActiveProject } from "../_hooks/use-active-project";
import { useDeleteProject } from "../_hooks/use-delete-project";
import { useGetProjects } from "../_hooks/use-get-projects";
import { CreateProjectDialog } from "./create-project-dialog";
import { getProjectGradient, getProjectInitials } from "./project-select";

export function ProjectsView() {
  const { data: projects = [], isLoading } = useGetProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { activeProjectId, setProject } = useActiveProject();
  const { setIsCreateProjectDialogOpen } = useProjectsStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground tracking-tight">
            Projects Workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            Organize, search, and manage your AI continuous chat environments
          </p>
        </div>
        <Button
          onClick={() => setIsCreateProjectDialogOpen(true)}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Toolbar & Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/60 p-3 shadow-2xs backdrop-blur-md">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-background/80 pr-8 pl-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-muted-foreground text-xs">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredProjects.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {projects.length}
          </span>{" "}
          projects
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-52 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed bg-card/40 p-10 text-center">
          <FolderKanban className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-40" />
          <h3 className="font-semibold text-lg">
            {searchQuery ? "No Matching Projects" : "No Projects Found"}
          </h3>
          <p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
            {searchQuery
              ? `No projects matching "${searchQuery}". Try clearing your search.`
              : "Create your first project workspace to start building custom AI prompts and continuous chats."}
          </p>
          {searchQuery ? (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="gap-2 text-xs"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              onClick={() => setIsCreateProjectDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const initials = getProjectInitials(proj.name);
            const gradient = getProjectGradient(proj.name);
            const createdDate = proj.createdAt
              ? new Date(proj.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <Card
                key={proj.id}
                className={`group relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isActive
                    ? "border-primary/80 bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <CardHeader className="space-y-3 pb-3">
                  {/* Top Bar: Avatar + Active Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br font-bold text-sm shadow-sm ${gradient}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate font-semibold text-base text-foreground transition-colors group-hover:text-primary">
                          {proj.name}
                        </CardTitle>
                        {createdDate && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3 opacity-70" />
                            <span>{createdDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground text-xs shadow-2xs">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>

                  <CardDescription className="line-clamp-2 min-h-8 text-muted-foreground text-xs">
                    {proj.description ||
                      "No description provided for this project."}
                  </CardDescription>
                </CardHeader>

                {/* Quick Navigation Links & Actions */}
                <div className="flex items-center gap-2 border-border/30 border-t bg-muted/20 px-6 py-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProject(proj.id)}
                    render={<Link href="/dashboard/chat" />}
                    className="h-7 gap-1.5 px-2 text-muted-foreground text-xs hover:text-foreground"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
                    <span>Chat</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProject(proj.id)}
                    render={<Link href="/dashboard/prompts" />}
                    className="h-7 gap-1.5 px-2 text-muted-foreground text-xs hover:text-foreground"
                  >
                    <Terminal className="h-3.5 w-3.5 text-primary/70" />
                    <span>Prompts</span>
                  </Button>
                </div>

                <CardFooter className="flex items-center justify-between border-border/40 border-t pt-3 pb-4">
                  <Button
                    variant={isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setProject(proj.id)}
                    className={`gap-1.5 font-medium text-xs ${
                      isActive
                        ? "bg-primary/15 text-primary hover:bg-primary/20"
                        : ""
                    }`}
                  >
                    {isActive ? "Currently Active" : "Set as Active"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${proj.name}"? This action cannot be undone.`,
                        )
                      ) {
                        deleteProject(proj.id);
                      }
                    }}
                    disabled={isDeleting}
                    title="Delete Project"
                    className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Global Project Dialog Component */}
      <CreateProjectDialog />
    </div>
  );
}
