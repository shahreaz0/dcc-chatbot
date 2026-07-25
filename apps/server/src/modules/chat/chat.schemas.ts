import { z } from "@hono/zod-openapi";

export const ChatMessageSchema = z.object({
	id: z.string().openapi({ example: "msg_123" }),
	role: z.enum(["user", "assistant", "system"]).openapi({ example: "user" }),
	content: z.string().openapi({ example: "Hello, agent!" }),
	createdAt: z.date().or(z.string()),
});

export const ChatSessionSchema = z.object({
	id: z.string().openapi({ example: "cs_123" }),
	title: z.string().nullable().openapi({ example: "General Chat" }),
	projectId: z.string().openapi({ example: "clx123project" }),
	createdAt: z.date().or(z.string()),
	updatedAt: z.date().or(z.string()),
});

export const SendMessageSchema = z.object({
	chatSessionId: z
		.string()
		.optional()
		.openapi({ description: "Optional existing chat session ID" }),
	messages: z
		.array(
			z.object({
				role: z.enum(["user", "assistant", "system"]),
				content: z.string(),
			}),
		)
		.openapi({ description: "Array of chat messages" }),
});
