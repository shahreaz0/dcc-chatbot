"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
import {
  Attachment,
  AttachmentAction,
  AttachmentContent,
  AttachmentGroup,
  AttachmentTitle,
} from "@dcc-chatbot/ui/components/attachment";
import { Bubble, BubbleContent } from "@dcc-chatbot/ui/components/bubble";
import { Button } from "@dcc-chatbot/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dcc-chatbot/ui/components/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@dcc-chatbot/ui/components/empty";
import {
  InputGroup,
  InputGroupTextarea,
} from "@dcc-chatbot/ui/components/input-group";
import { Marker } from "@dcc-chatbot/ui/components/marker";
import { Message } from "@dcc-chatbot/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@dcc-chatbot/ui/components/message-scroller";
import { DefaultChatTransport } from "ai";
import Cookies from "js-cookie";
import {
  Bot,
  FileText,
  Paperclip,
  RotateCcw,
  Send,
  StopCircle,
  Terminal,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { useGetPrompts } from "../../prompts/_hooks/use-get-prompts";
import { useClearChatMessages } from "../_hooks/use-clear-chat-messages";
import { useGetChatMessages } from "../_hooks/use-get-chat-messages";

interface ChatInterfaceProps {
  projectId: string | null;
}

function getMessageText(m: UIMessage): string {
  if (typeof (m as any).content === "string" && (m as any).content) {
    return (m as any).content;
  }
  if (m.parts && Array.isArray(m.parts)) {
    return m.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const { data: prompts = [] } = useGetPrompts(projectId);
  const { data: initialMessages = [] } = useGetChatMessages(projectId);
  const { mutate: clearMessages, isPending: isClearing } =
    useClearChatMessages();

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: projectId
          ? `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000"}/projects/${projectId}/chat`
          : "/api/chat",
        headers: (): Record<string, string> => {
          const token =
            typeof window !== "undefined" ? Cookies.get("dcc_jwt_token") : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [projectId],
  );

  const { messages, setMessages, sendMessage, stop, regenerate, status } =
    useChat({
      transport,
      body: {
        systemPrompt: selectedPrompt?.content,
      },
    } as any);

  useEffect(() => {
    if (initialMessages) {
      setMessages(
        initialMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
        })),
      );
    }
  }, [initialMessages, setMessages]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearHistory = () => {
    if (!projectId) return;
    if (window.confirm("Are you sure you want to clear this chat history?")) {
      clearMessages(
        { projectId },
        {
          onSuccess: () => {
            setMessages([]);
          },
        },
      );
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    sendMessage(
      {
        text: input,
        files: attachments.length > 0 ? attachments : undefined,
      } as any,
      {
        body: {
          systemPrompt: selectedPrompt?.content,
        },
      },
    );
    setInput("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty className="max-w-md text-center">
          <EmptyTitle>No Project Selected</EmptyTitle>
          <EmptyDescription>
            Select a project from the header menu or create a new project to
            start chatting.
          </EmptyDescription>
        </Empty>
      </div>
    );
  }

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-md">
        {/* Top Toolbar */}
        <div className="flex h-12 items-center justify-between border-border/40 border-b bg-muted/30 px-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground text-xs uppercase">
              Persona:
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 font-medium text-xs"
                  />
                }
              >
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>{selectedPrompt?.title || "Default Assistant"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedPromptId(null)}>
                  Default Assistant
                </DropdownMenuItem>
                {prompts.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setSelectedPromptId(p.id)}
                  >
                    {p.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    regenerate({
                      body: {
                        systemPrompt: selectedPrompt?.content,
                      },
                    } as any)
                  }
                  disabled={isLoading}
                  className="gap-1.5 text-muted-foreground text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  disabled={isClearing || isLoading}
                  className="gap-1.5 text-muted-foreground text-xs hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear History
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="relative min-h-0 flex-1">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Continuous Project Chat</h3>
              <p className="max-w-sm text-muted-foreground text-sm">
                Type your message below. All user and assistant messages will
                stream and build a continuous thread for this project.
              </p>
            </div>
          ) : (
            <MessageScroller className="h-full">
              <MessageScrollerViewport>
                <MessageScrollerContent
                  aria-busy={isLoading}
                  className="space-y-4 p-4"
                >
                  {messages.map((m) => {
                    const isUser = m.role === "user";
                    const textContent = getMessageText(m);
                    return (
                      <MessageScrollerItem
                        key={m.id}
                        messageId={m.id}
                        scrollAnchor={isUser}
                      >
                        <Message
                          align={isUser ? "end" : "start"}
                          className="flex gap-3"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full font-semibold text-xs ${
                              isUser
                                ? "bg-primary text-primary-foreground"
                                : "border border-border/40 bg-muted text-foreground"
                            }`}
                          >
                            {isUser ? (
                              <UserIcon className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          <Bubble
                            align={isUser ? "end" : "start"}
                            variant={isUser ? "default" : "muted"}
                          >
                            <BubbleContent className="p-3 text-sm">
                              {isUser ? (
                                <div className="whitespace-pre-wrap">
                                  {textContent}
                                </div>
                              ) : (
                                <Streamdown>{textContent}</Streamdown>
                              )}
                            </BubbleContent>
                          </Bubble>
                        </Message>
                      </MessageScrollerItem>
                    );
                  })}

                  {isLoading &&
                    messages[messages.length - 1]?.role !== "assistant" && (
                      <MessageScrollerItem>
                        <Message align="start" className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                            <Bot className="h-4 w-4" />
                          </div>
                          <Bubble align="start" variant="muted">
                            <BubbleContent className="p-3">
                              <Marker className="h-4 w-4 animate-spin text-primary" />
                            </BubbleContent>
                          </Bubble>
                        </Message>
                      </MessageScrollerItem>
                    )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </div>

        {/* Input Area */}
        <div className="border-border/40 border-t bg-card/60 p-3">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <AttachmentGroup className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <Attachment key={idx} size="sm">
                  <AttachmentContent className="flex items-center gap-1.5 px-2 py-1">
                    <FileText className="h-3.5 w-3.5" />
                    <AttachmentTitle className="text-xs">
                      {file.name}
                    </AttachmentTitle>
                    <AttachmentAction onClick={() => removeAttachment(idx)}>
                      <X className="h-3 w-3" />
                    </AttachmentAction>
                  </AttachmentContent>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}

          <form onSubmit={onFormSubmit} className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.txt,.md,.doc,.docx,.csv,.json"
              className="hidden"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              title="Attach images or documents"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <InputGroup className="flex-1">
              <InputGroupTextarea
                placeholder="Type your message or attach files..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onFormSubmit(e);
                  }
                }}
                rows={1}
                className="max-h-32 min-h-[40px] resize-none bg-transparent"
              />
            </InputGroup>

            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => stop()}
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() && attachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}
