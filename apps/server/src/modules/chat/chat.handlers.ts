import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import prisma from "@dcc-chatbot/db";
import {
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream,
	wrapLanguageModel,
} from "ai";
import { createAILogger, createEvlogIntegration } from "evlog/ai";
import { HTTPException } from "hono/http-exception";
import type { AppRouteHandler } from "../../lib/types";
import type {
	ChatStreamRoute,
	GetChatMessagesRoute,
	ListChatSessionsRoute,
} from "./chat.routes";

export const chatStream: AppRouteHandler<ChatStreamRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { projectId } = c.req.valid("param");
	const body = c.req.valid("json");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
		include: {
			prompts: true,
		},
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const promptInstructions: string[] = [];
	if (project.systemPrompt) {
		promptInstructions.push(project.systemPrompt);
	}
	for (const p of project.prompts) {
		promptInstructions.push(`[Prompt: ${p.title}]\n${p.content}`);
	}

	const systemInstruction =
		promptInstructions.length > 0 ? promptInstructions.join("\n\n") : undefined;

	let chatSessionId = body.chatSessionId;
	if (!chatSessionId) {
		const session = await prisma.chatSession.create({
			data: {
				projectId,
				title: body.messages[0]?.content.slice(0, 50) ?? "New Chat",
			},
		});
		chatSessionId = session.id;
	}

	const userMessage = body.messages[body.messages.length - 1];
	if (userMessage && userMessage.role === "user") {
		await prisma.chatMessage.create({
			data: {
				chatSessionId,
				role: userMessage.role,
				content: userMessage.content,
			},
		});
	}

	const modelName = project.model || "gemini-2.5-flash";
	const ai = createAILogger(c.get("log"));
	const model = wrapLanguageModel({
		model: google(modelName),
		middleware: devToolsMiddleware(),
	});

	const result = streamText({
		model: ai.wrap(model),
		system: systemInstruction,
		messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
		telemetry: {
			isEnabled: true,
			integrations: [createEvlogIntegration(ai)],
		},
		onFinish: async ({ text }) => {
			if (text && chatSessionId) {
				await prisma.chatMessage.create({
					data: {
						chatSessionId,
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

export const listChatSessions: AppRouteHandler<ListChatSessionsRoute> = async (
	c,
) => {
	const userId = c.get("userId") as string;
	const { projectId } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const sessions = await prisma.chatSession.findMany({
		where: { projectId },
		orderBy: { updatedAt: "desc" },
	});

	return c.json({ status: "success" as const, data: sessions }, 200);
};

export const getChatMessages: AppRouteHandler<GetChatMessagesRoute> = async (
	c,
) => {
	const userId = c.get("userId") as string;
	const { projectId, chatSessionId } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const messages = await prisma.chatMessage.findMany({
		where: { chatSessionId },
		orderBy: { createdAt: "asc" },
	});

	const formattedMessages = messages.map((m) => ({
		id: m.id,
		role: m.role as "user" | "assistant" | "system",
		content: m.content,
		createdAt: m.createdAt,
	}));

	return c.json({ status: "success" as const, data: formattedMessages }, 200);
};
