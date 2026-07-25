import { createRoute, z } from "@hono/zod-openapi";
import {
  createHttpErrorSchema,
  createSuccessSchema,
  ProjectIdParamsSchema,
} from "../../lib/common-schemas";
import {
  CreatePromptSchema,
  PromptSchema,
  UpdatePromptSchema,
} from "./prompts.schemas";

const tags = ["Prompts"];

export const createPrompt = createRoute({
  tags,
  method: "post",
  path: "/projects/{projectId}/prompts",
  summary: "Create/Add prompt to a project",
  description: "Store and associate a prompt with a project/agent.",
  request: {
    params: ProjectIdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: CreatePromptSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created — Prompt added to project",
      content: {
        "application/json": {
          schema: createSuccessSchema(PromptSchema),
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

export const listPrompts = createRoute({
  tags,
  method: "get",
  path: "/projects/{projectId}/prompts",
  summary: "List prompts associated with a project",
  description: "Retrieve all stored prompts associated with a project/agent.",
  request: {
    params: ProjectIdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — Prompts listed",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(PromptSchema)),
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

export const updatePrompt = createRoute({
  tags,
  method: "patch",
  path: "/projects/{projectId}/prompts/{id}",
  summary: "Update a prompt",
  description: "Update the title, content, or type of an existing prompt.",
  request: {
    params: z.object({
      projectId: z.string().openapi({ description: "ID of project" }),
      id: z.string().openapi({ description: "ID of prompt" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePromptSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — Prompt updated",
      content: {
        "application/json": {
          schema: createSuccessSchema(PromptSchema),
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
      description: "Prompt or project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export const deletePrompt = createRoute({
  tags,
  method: "delete",
  path: "/projects/{projectId}/prompts/{id}",
  summary: "Delete a prompt from a project",
  description: "Remove a prompt from a project.",
  request: {
    params: z.object({
      projectId: z.string().openapi({ description: "ID of project" }),
      id: z.string().openapi({ description: "ID of prompt" }),
    }),
  },
  responses: {
    200: {
      description: "OK — Prompt deleted",
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal("success"),
          }),
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
      description: "Prompt or project not found",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({ statusCode: "404" }),
        },
      },
    },
  },
});

export type CreatePromptRoute = typeof createPrompt;
export type ListPromptsRoute = typeof listPrompts;
export type UpdatePromptRoute = typeof updatePrompt;
export type DeletePromptRoute = typeof deletePrompt;
