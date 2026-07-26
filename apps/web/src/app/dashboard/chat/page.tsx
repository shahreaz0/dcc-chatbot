"use client";

import { useActiveProject } from "../projects/_hooks/use-active-project";
import { ChatInterface } from "./_components/chat-interface";

export default function ChatPage() {
  const { activeProjectId } = useActiveProject();

  return (
    <div className="h-[calc(100vh-6rem)] w-full overflow-hidden">
      <ChatInterface
        key={activeProjectId ?? "none"}
        projectId={activeProjectId}
      />
    </div>
  );
}
