import { z } from "@hono/zod-openapi";

export const ProjectSchema = z.object({
  id: z.string().openapi({ example: "clx123project" }),
  name: z.string().openapi({ example: "Customer Support Agent" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "Agent handling user queries" }),
  systemPrompt: z
    .string()
    .nullable()
    .openapi({ example: "You are a helpful assistant for DCC." }),
  model: z.string().openapi({ example: "deepseek/deepseek-v4-flash" }),
  userId: z.string().openapi({ example: "clx123user" }),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).openapi({ example: "Customer Support Agent" }),
  description: z
    .string()
    .optional()
    .openapi({ example: "Agent handling user queries" }),
  systemPrompt: z
    .string()
    .optional()
    .openapi({ example: "You are a helpful assistant for DCC." }),
  model: z
    .string()
    .optional()
    .default("deepseek/deepseek-v4-flash")
    .openapi({ example: "deepseek/deepseek-v4-flash" }),
});

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(1)
    .optional()
    .openapi({ example: "Updated Support Agent" }),
  description: z
    .string()
    .optional()
    .openapi({ example: "Updated description" }),
  systemPrompt: z
    .string()
    .optional()
    .openapi({ example: "Updated system prompt" }),
  model: z
    .string()
    .optional()
    .openapi({ example: "deepseek/deepseek-v4-flash" }),
});
