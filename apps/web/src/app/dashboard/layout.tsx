"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dcc-chatbot/ui/components/dropdown-menu";
import {
  ChevronDown,
  FolderKanban,
  LogOut,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { useProjectsStore } from "@/stores/projects-store";
import { getCurrentUser, useLogout } from "../(auth)/_hooks/use-auth";
import { CreateProjectDialog } from "./projects/_components/create-project-dialog";
import { useActiveProject } from "./projects/_hooks/use-active-project";

const navItems = [
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "System Prompts", href: "/dashboard/prompts", icon: Terminal },
  { name: "Active Sessions", href: "/dashboard/sessions", icon: ShieldCheck },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { activeProject, projects, setProject } = useActiveProject();
  const { mutate: logout } = useLogout();
  const currentUser = getCurrentUser();
  const { setIsCreateProjectDialogOpen } = useProjectsStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col justify-between border-border/40 border-r bg-card/50 p-4 shadow-sm backdrop-blur-xl">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-primary/60 text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">
                DCC Chatbot
              </h1>
              <p className="text-muted-foreground text-xs">
                AI Knowledge Platform
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-3 border-border/40 border-t pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <p className="truncate font-semibold text-sm">
                {currentUser?.name || "User"}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {currentUser?.email || ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Sign Out"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-border/40 border-b bg-card/30 px-6 backdrop-blur-md">
          {/* Active Project Switcher */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Project:
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-medium"
                  >
                    <span className="max-w-40 truncate">
                      {activeProject?.name || "Select Project"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start" className="w-56">
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setProject(p.id)}
                    className={
                      p.id === activeProject?.id
                        ? "bg-muted/60 font-semibold"
                        : ""
                    }
                  >
                    {p.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setIsCreateProjectDialogOpen(true)}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" /> New Project
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/projects" />}>
                  <FolderKanban className="mr-2 h-3.5 w-3.5" /> Manage Projects
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>

      {/* Global Project Creation Dialog */}
      <CreateProjectDialog />
    </div>
  );
}
