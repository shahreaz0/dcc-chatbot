import { z } from "@hono/zod-openapi";

export const PromptSchema = z.object({
  id: z.string().openapi({ example: "clx123prompt" }),
  title: z.string().openapi({ example: "Friendly Greeting" }),
  content: z.string().openapi({
    example: "Always start responses by warmly greeting the user.",
  }),
  isSystem: z.boolean().openapi({ example: false }),
  projectId: z.string().openapi({ example: "clx123project" }),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const CreatePromptSchema = z.object({
  title: z.string().min(1).openapi({ example: "Friendly Greeting" }),
  content: z.string().min(1).openapi({
    example: "Always start responses by warmly greeting the user.",
  }),
  isSystem: z.boolean().optional().default(false).openapi({ example: false }),
});

export const UpdatePromptSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: "Updated Title" }),
  content: z
    .string()
    .min(1)
    .optional()
    .openapi({ example: "Updated prompt content." }),
  isSystem: z.boolean().optional().openapi({ example: false }),
});
