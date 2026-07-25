"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useActiveProject } from "../projects/_hooks/use-active-project";
import { ChatInterface } from "./_components/chat-interface";
import { useCreateChatSession } from "./_hooks/use-create-chat-session";
import { useDeleteChatSession } from "./_hooks/use-delete-chat-session";
import { useGetChatSessions } from "./_hooks/use-get-chat-sessions";

export default function ChatPage() {
	const { activeProjectId } = useActiveProject();
	const { data: sessions = [], isLoading } =
		useGetChatSessions(activeProjectId);
	const { mutate: createSession, isPending: isCreating } =
		useCreateChatSession();
	const { mutate: deleteSession, isPending: isDeleting } =
		useDeleteChatSession();
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	const handleNewSession = () => {
		if (!activeProjectId) return;
		createSession(
			{
				projectId: activeProjectId,
				title: `Chat Session ${sessions.length + 1}`,
			},
			{
				onSuccess: (newSession) => {
					if (newSession) setSelectedSessionId(newSession.id);
				},
			},
		);
	};

	return (
		<div className="flex h-[calc(100vh-6rem)] gap-4 overflow-hidden">
			{/* Sessions Sidebar */}
			<div className="flex w-64 flex-col justify-between rounded-xl border border-border/40 bg-card/40 p-3 backdrop-blur-md">
				<div className="space-y-3">
					<Button
						onClick={handleNewSession}
						disabled={!activeProjectId || isCreating}
						className="w-full justify-start gap-2 text-xs"
					>
						<Plus className="h-4 w-4" /> New Chat
					</Button>

					<div className="px-2 font-semibold text-muted-foreground text-xs uppercase">
						History
					</div>

					<div className="max-h-[calc(100vh-14rem)] space-y-1 overflow-y-auto">
						{isLoading ? (
							<div className="space-y-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="h-9 animate-pulse rounded-lg bg-muted/40"
									/>
								))}
							</div>
						) : sessions.length === 0 ? (
							<p className="px-2 py-4 text-center text-muted-foreground text-xs">
								No past chat sessions.
							</p>
						) : (
							sessions.map((s) => {
								const isSelected = s.id === selectedSessionId;
								return (
									<div
										key={s.id}
										className={`group relative flex items-center rounded-lg transition-all ${
											isSelected
												? "border border-primary/20 bg-primary/10"
												: "hover:bg-muted/50"
										}`}
									>
										<button
											type="button"
											className={`flex flex-1 items-center gap-2 truncate px-2.5 py-2 text-left font-medium text-xs ${
												isSelected
													? "font-semibold text-primary"
													: "text-muted-foreground hover:text-foreground"
											}`}
											onClick={() => setSelectedSessionId(s.id)}
										>
											<MessageSquare className="h-3.5 w-3.5 shrink-0" />
											<span className="truncate">{s.title}</span>
										</button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation();
												deleteSession({
													sessionId: s.id,
													projectId: activeProjectId || undefined,
												});
											}}
											disabled={isDeleting}
											className="mr-1 h-6 w-6 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>

			{/* Main Chat Interface */}
			<div className="flex-1">
				<ChatInterface
					projectId={activeProjectId}
					sessionId={selectedSessionId}
				/>
			</div>
		</div>
	);
}
