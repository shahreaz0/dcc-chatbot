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
import {
  Calendar,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { usePromptsStore } from "@/stores/prompts-store";
import {
  getProjectGradient,
  getProjectInitials,
} from "../../projects/_components/project-select";
import { useActiveProject } from "../../projects/_hooks/use-active-project";
import { useDeletePrompt } from "../_hooks/use-delete-prompt";
import { useGetPrompts } from "../_hooks/use-get-prompts";
import { CreatePromptDialog } from "./create-prompt-dialog";
import { EditPromptDialog } from "./edit-prompt-dialog";

export function PromptsView() {
  const { activeProjectId, activeProject } = useActiveProject();
  const { data: prompts = [], isLoading } = useGetPrompts(activeProjectId);
  const { mutate: deletePrompt, isPending: isDeleting } = useDeletePrompt();
  const { setIsCreatePromptDialogOpen, setEditingPrompt } = usePromptsStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;
    const q = searchQuery.toLowerCase().trim();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q),
    );
  }, [prompts, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground tracking-tight">
            System Prompts
          </h1>
          <p className="text-muted-foreground text-sm">
            Customize AI behavior instructions for project:{" "}
            <span className="font-semibold text-foreground">
              {activeProject?.name || "No Project Selected"}
            </span>
          </p>
        </div>
        <Button
          onClick={() => setIsCreatePromptDialogOpen(true)}
          disabled={!activeProjectId}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Prompt
        </Button>
      </div>

      {!activeProjectId ? (
        <Card className="border-dashed bg-card/40 p-10 text-center">
          <Terminal className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-40" />
          <h3 className="font-semibold text-lg">No Project Selected</h3>
          <p className="mx-auto max-w-sm text-muted-foreground text-sm">
            Please select or create a project workspace from the header menu to
            manage system prompts.
          </p>
        </Card>
      ) : (
        <>
          {/* Toolbar & Search Bar */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/60 p-3 shadow-2xs backdrop-blur-md">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search prompts by title or instruction..."
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
                {filteredPrompts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {prompts.length}
              </span>{" "}
              prompts
            </div>
          </div>

          {/* Prompts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="h-52 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : filteredPrompts.length === 0 ? (
            <Card className="border-dashed bg-card/40 p-10 text-center">
              <Terminal className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-40" />
              <h3 className="font-semibold text-lg">
                {searchQuery ? "No Matching Prompts" : "No System Prompts"}
              </h3>
              <p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
                {searchQuery
                  ? `No prompts matching "${searchQuery}". Try clearing your search.`
                  : "Create custom system prompts to instruct the AI persona for this project."}
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
                  onClick={() => setIsCreatePromptDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Create System Prompt
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredPrompts.map((p) => {
                const initials = getProjectInitials(p.title);
                const gradient = getProjectGradient(p.title);
                const createdDate = p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <Card
                    key={p.id}
                    className="group relative flex flex-col justify-between border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br font-bold text-xs shadow-sm ${gradient}`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="truncate font-semibold text-base text-foreground transition-colors group-hover:text-primary">
                              {p.title}
                            </CardTitle>
                            {createdDate && (
                              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Calendar className="h-3 w-3 opacity-70" />
                                <span>{createdDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {p.isSystem && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
                            <Sparkles className="h-3 w-3" /> System
                          </span>
                        )}
                      </div>

                      <CardDescription className="text-muted-foreground text-xs">
                        Custom AI Persona & Behavior Instructions
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="py-2">
                      <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/40 bg-muted/40 p-3 font-mono text-foreground/90 text-xs leading-relaxed shadow-inner">
                        {p.content}
                      </pre>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-border/40 border-t pt-3 pb-4">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {p.content.length} chars
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPrompt(p)}
                          title="Edit System Prompt"
                          className="h-8 w-8 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete "${p.title}"?`,
                              )
                            ) {
                              deletePrompt({
                                projectId: activeProjectId,
                                id: p.id,
                              });
                            }
                          }}
                          disabled={isDeleting}
                          title="Delete System Prompt"
                          className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Global Dialog Components */}
      <CreatePromptDialog />
      <EditPromptDialog />
    </div>
  );
}
