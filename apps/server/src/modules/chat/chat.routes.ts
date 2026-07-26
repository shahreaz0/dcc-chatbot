import { createRoute, z } from "@hono/zod-openapi";
import {
  createHttpErrorSchema,
  createSuccessSchema,
  PaginationQuerySchema,
  ProjectIdParamsSchema,
} from "../../lib/common-schemas";
import { ChatMessageSchema, SendMessageSchema } from "./chat.schemas";

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

export const getProjectChatMessages = createRoute({
  tags,
  method: "get",
  path: "/projects/{projectId}/messages",
  summary: "Get continuous project chat messages",
  description: "Retrieve all continuous message history for a project.",
  request: {
    params: ProjectIdParamsSchema,
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
      description: "Project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const clearProjectChatMessages = createRoute({
  tags,
  method: "delete",
  path: "/projects/{projectId}/messages",
  summary: "Clear continuous project chat messages",
  description: "Clear continuous chat history for a project.",
  request: {
    params: ProjectIdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — Messages cleared",
      content: {
        "application/json": {
          schema: z.object({ status: z.literal("success") }),
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

export type ChatStreamRoute = typeof chatStream;
export type GetProjectChatMessagesRoute = typeof getProjectChatMessages;
export type ClearProjectChatMessagesRoute = typeof clearProjectChatMessages;
