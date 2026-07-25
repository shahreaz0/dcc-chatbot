import { z } from "@hono/zod-openapi";

export const ProjectFileSchema = z.object({
  id: z.string().openapi({ example: "clx123file" }),
  name: z.string().openapi({ example: "document.pdf" }),
  fileUrl: z
    .string()
    .nullable()
    .openapi({ example: "/uploads/proj123/document.pdf" }),
  fileSize: z.number().int().nullable().openapi({ example: 204800 }),
  mimeType: z.string().nullable().openapi({ example: "application/pdf" }),
  providerRef: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: '{"openai":"file-xyz123"}' }),
  projectId: z.string().openapi({ example: "clx123project" }),
  createdAt: z.date().or(z.string()),
});
