import { readFile } from "node:fs/promises";
import path from "node:path";
import prisma from "@dcc-chatbot/db";
import { env } from "@dcc-chatbot/env/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
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
	GetChatMessagesRoute,
	ListChatSessionsRoute,
} from "./chat.routes";

/** Resolve stored fileUrl (e.g. "/uploads/proj/file.png") to an absolute path */
function resolveFilePath(fileUrl: string): string {
	const relative = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
	return path.join(process.cwd(), relative);
}

type TextPart = { type: "text"; text: string };
type ImagePart = {
	type: "image";
	image: string;
	mimeType?: string;
};
type FilePart = {
	type: "file";
	data: string;
	mediaType: string;
};

type MessagePart = TextPart | ImagePart | FilePart;

/** Build AI SDK message parts for project files to inject into context */
async function buildFileParts(projectId: string): Promise<MessagePart[]> {
	const files = await prisma.projectFile.findMany({
		where: { projectId },
		orderBy: { createdAt: "desc" },
		take: 5,
	});

	const parts: MessagePart[] = [];

	for (const file of files) {
		if (!file.fileUrl) continue;

		try {
			const filePath = resolveFilePath(file.fileUrl);
			const buffer = await readFile(filePath);

			if (file.mimeType?.startsWith("image/")) {
				parts.push({
					type: "image",
					image: buffer.toString("base64"),
					mimeType: file.mimeType,
				});
			} else if (
				file.mimeType === "application/pdf" ||
				file.mimeType?.startsWith("text/") ||
				file.name.endsWith(".md") ||
				file.name.endsWith(".txt") ||
				file.name.endsWith(".csv") ||
				file.name.endsWith(".json")
			) {
				const text = buffer.toString("utf-8").slice(0, 8000);
				parts.push({
					type: "text",
					text: `[Attached file: ${file.name}]\n\`\`\`\n${text}\n\`\`\``,
				});
			} else {
				parts.push({
					type: "file",
					data: buffer.toString("base64"),
					mediaType: file.mimeType ?? "application/octet-stream",
				});
			}
		} catch {
			// File missing on disk — skip silently
		}
	}

	return parts;
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

	const fileParts = await buildFileParts(projectId);

	const mappedMessages = body.messages.map((m, i) => {
		const isLastUser =
			i === body.messages.length - 1 &&
			m.role === "user" &&
			fileParts.length > 0;

		if (isLastUser) {
			return {
				role: "user" as const,
				content: [{ type: "text" as const, text: m.content }, ...fileParts],
			};
		}

		return {
			role: m.role as "user" | "assistant" | "system",
			content: m.content,
		};
	});

	const rawModel = project.model ?? "google/gemini-2.5-flash";
	const modelName = rawModel.includes("/") ? rawModel : `google/${rawModel}`;

	const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
	const ai = createAILogger(c.get("log"));
	const model = ai.wrap(openrouter.chat(modelName));

	const result = streamText({
		model,
		system: systemInstruction,
		messages: mappedMessages,
		telemetry: { isEnabled: true },
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
		headers: {
			"X-Chat-Session-Id": chatSessionId,
		},
	});
};

export const listChatSessions: AppRouteHandler<ListChatSessionsRoute> = async (
	c,
) => {
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

	const sessions = await prisma.chatSession.findMany({
		where: { projectId },
		orderBy: { updatedAt: "desc" },
		...(pagination.take !== undefined ? pagination : {}),
	});

	return c.json({ status: "success" as const, data: sessions }, 200);
};

export const getChatMessages: AppRouteHandler<GetChatMessagesRoute> = async (
	c,
) => {
	const userId = c.get("userId") as string;
	const { projectId, chatSessionId } = c.req.valid("param");
	const { page, perPage } = c.req.valid("query");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const pagination = buildPagination(page, perPage);

	const messages = await prisma.chatMessage.findMany({
		where: { chatSessionId },
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
