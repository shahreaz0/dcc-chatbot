import { z } from "@hono/zod-openapi";

export const ChatMessageSchema = z.object({
  id: z.string().openapi({ example: "msg_123" }),
  role: z.enum(["user", "assistant", "system"]).openapi({ example: "user" }),
  content: z.string().openapi({ example: "Hello, agent!" }),
  createdAt: z.date().or(z.string()),
});

export const SendMessageSchema = z.object({
  systemPrompt: z
    .string()
    .optional()
    .openapi({ description: "Optional system prompt override" }),
  messages: z
    .array(z.any())
    .openapi({ description: "Array of UI chat messages from AI SDK" }),
});
