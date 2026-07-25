import { createRoute, z } from "@hono/zod-openapi";
import {
  createHttpErrorSchema,
  createSuccessSchema,
  PaginationQuerySchema,
  ProjectIdParamsSchema,
} from "../../lib/common-schemas";
import {
  ChatMessageSchema,
  ChatSessionSchema,
  SendMessageSchema,
} from "./chat.schemas";

const tags = ["Chat"];

export const chatStream = createRoute({
  tags,
  method: "post",
  path: "/projects/{projectId}/chat",
  summary: "Chat with project/agent (AI Streaming)",
  description:
    "Stream completions from LLM service using stored project agent system prompts and associated context.",
  request: {
    params: ProjectIdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SendMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Stream response",
      content: {
        "text/event-stream": {
          schema: z.string(),
        },
        "application/json": {
          schema: z.any(),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const listChatSessions = createRoute({
  tags,
  method: "get",
  path: "/projects/{projectId}/chats",
  summary: "List chat sessions for a project",
  description: "Retrieve all chat sessions for a given project.",
  request: {
    params: ProjectIdParamsSchema,
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: "OK — Chat sessions listed",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(ChatSessionSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const getChatMessages = createRoute({
  tags,
  method: "get",
  path: "/projects/{projectId}/chats/{chatSessionId}/messages",
  summary: "Get chat session message history",
  description:
    "Get stored conversation message history for a specific chat session.",
  request: {
    params: z.object({
      projectId: z.string().openapi({ description: "ID of project" }),
      chatSessionId: z.string().openapi({ description: "ID of chat session" }),
    }),
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: "OK — Messages history retrieved",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(ChatMessageSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "401" }),
        },
      },
    },
    404: {
      description: "Chat session or project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export type ChatStreamRoute = typeof chatStream;
export type ListChatSessionsRoute = typeof listChatSessions;
export type GetChatMessagesRoute = typeof getChatMessages;
