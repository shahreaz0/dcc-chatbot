import prisma from "@dcc-chatbot/db";
import { env } from "@dcc-chatbot/env/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { createAILogger } from "evlog/ai";
import { HTTPException } from "hono/http-exception";
import { buildPagination } from "../../lib/common-schemas";
import type { AppRouteHandler } from "../../lib/types";
import type {
  ChatStreamRoute,
  ClearProjectChatMessagesRoute,
  GetProjectChatMessagesRoute,
} from "./chat.routes";

function extractMessageContent(m?: {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!m) return "";
  if (typeof m.content === "string" && m.content) {
    return m.content;
  }
  if (m.parts && Array.isArray(m.parts)) {
    return m.parts
      .map((p) => (p.type === "text" && p.text ? p.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export const chatStream: AppRouteHandler<ChatStreamRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId } = c.req.valid("param");
  const body = c.req.valid("json");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
    include: { prompts: true },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const lastUserMessage = body.messages?.[body.messages.length - 1];
  if (lastUserMessage && lastUserMessage.role === "user") {
    const userText = extractMessageContent(lastUserMessage);
    if (userText) {
      await prisma.chatMessage.create({
        data: {
          projectId,
          role: "user",
          content: userText,
        },
      });
    }
  }

  const promptInstructions: string[] = [];
  if (project.systemPrompt) {
    promptInstructions.push(project.systemPrompt);
  }
  if (body.systemPrompt) {
    promptInstructions.push(body.systemPrompt);
  }
  for (const p of project.prompts) {
    promptInstructions.push(`[Prompt: ${p.title}]\n${p.content}`);
  }
  const systemInstruction =
    promptInstructions.length > 0 ? promptInstructions.join("\n\n") : undefined;

  const modelMessages = await convertToModelMessages(body.messages);

  const rawModel = project.model ?? "deepseek/deepseek-v4-flash";
  const modelName = rawModel.includes("/") ? rawModel : `deepseek/${rawModel}`;

  const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
  const ai = createAILogger(c.get("log"));
  const model = ai.wrap(openrouter.chat(modelName));

  const result = streamText({
    model,
    system: systemInstruction,
    messages: modelMessages,
    telemetry: { isEnabled: true },
    onFinish: async ({ text }) => {
      if (text) {
        await prisma.chatMessage.create({
          data: {
            projectId,
            role: "assistant",
            content: text,
          },
        });
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};

export const getProjectChatMessages: AppRouteHandler<
  GetProjectChatMessagesRoute
> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId } = c.req.valid("param");
  const { page, perPage } = c.req.valid("query");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const pagination = buildPagination(page, perPage);

  const messages = await prisma.chatMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    ...(pagination.take !== undefined ? pagination : {}),
  });

  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
    createdAt: m.createdAt,
  }));

  return c.json({ status: "success" as const, data: formattedMessages }, 200);
};

export const clearProjectChatMessages: AppRouteHandler<
  ClearProjectChatMessagesRoute
> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId } = c.req.valid("param");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  await prisma.chatMessage.deleteMany({
    where: { projectId },
  });

  return c.json({ status: "success" as const }, 200);
};
