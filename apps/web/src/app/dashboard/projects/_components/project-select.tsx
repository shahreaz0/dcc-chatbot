"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dcc-chatbot/ui/components/dropdown-menu";
import { Input } from "@dcc-chatbot/ui/components/input";
import {
  Check,
  ChevronDown,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProjectsStore } from "@/stores/projects-store";
import { useActiveProject } from "../_hooks/use-active-project";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600 text-white",
  "from-blue-500 to-cyan-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-violet-500 to-fuchsia-600 text-white",
];

export function getProjectGradient(name = ""): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function getProjectInitials(name = ""): string {
  if (!name) return "P";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProjectSelect() {
  const { activeProject, projects, setProject, isLoading } = useActiveProject();
  const { setIsCreateProjectDialogOpen, setEditingProject } =
    useProjectsStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut (Cmd+P or Ctrl+P) to open Project Switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  const initials = activeProject ? getProjectInitials(activeProject.name) : "P";
  const activeGradient = activeProject
    ? getProjectGradient(activeProject.name)
    : "from-primary to-primary/80 text-primary-foreground";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="group relative flex h-9 items-center gap-2.5 rounded-lg border-border/60 bg-background/80 px-3 py-1.5 font-medium shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary/30"
            title="Switch Active Project (Cmd+P or Ctrl+P)"
          >
            {/* Avatar Pill */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-linear-to-br font-bold text-[10px] shadow-2xs ${activeGradient}`}
            >
              {initials}
            </div>

            {/* Title & Status */}
            <div className="flex max-w-44 flex-col text-left">
              <span className="truncate font-semibold text-foreground text-xs group-hover:text-foreground">
                {isLoading
                  ? "Loading..."
                  : activeProject?.name || "Select Project"}
              </span>
            </div>

            {/* Keyboard hint & Chevron */}
            <div className="ml-1 flex items-center gap-1 text-muted-foreground">
              <kbd className="hidden rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 sm:inline-block">
                ⌘P
              </kbd>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-data-open:rotate-180" />
            </div>
          </Button>
        }
      />

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-72 overflow-hidden rounded-xl border-border/50 bg-popover/95 p-0 shadow-xl backdrop-blur-xl"
      >
        {/* Search Header */}
        <div className="border-border/40 border-b p-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-none bg-muted/50 pr-7 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Header & Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Workspaces</span>
            <span className="font-mono text-[10px]">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </DropdownMenuLabel>

          {/* Project Items List */}
          <div className="max-h-60 overflow-y-auto px-1 py-0.5">
            {filteredProjects.length === 0 ? (
              <div className="px-3 py-4 text-center text-muted-foreground text-xs">
                {searchQuery
                  ? "No matching projects found"
                  : "No projects created yet"}
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isActive = p.id === activeProject?.id;
                const pInitials = getProjectInitials(p.name);
                const pGradient = getProjectGradient(p.name);

                return (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => {
                      setProject(p.id);
                      setOpen(false);
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-all ${
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      {/* Item Avatar */}
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br font-bold text-[11px] shadow-2xs ${pGradient}`}
                      >
                        {pInitials}
                      </div>

                      {/* Name and Description */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground text-xs">
                          {p.name}
                        </div>
                        {p.description && (
                          <div className="truncate text-[11px] text-muted-foreground">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Checkmark & Edit Action */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
                          setEditingProject(p);
                        }}
                        title="Edit Project"
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      {isActive && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Footer Actions */}
        <div className="space-y-0.5 p-1">
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setIsCreateProjectDialogOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-primary text-xs hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Project</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href="/dashboard/projects" />}
            onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-muted-foreground text-xs hover:bg-muted/70 hover:text-foreground"
          >
            <FolderKanban className="h-4 w-4" />
            <span>Manage Projects Workspace</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
