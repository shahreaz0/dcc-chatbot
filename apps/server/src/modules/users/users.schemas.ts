import { z } from "@hono/zod-openapi";

export const UserProfileSchema = z.object({
	id: z.string().openapi({ example: "clx123user" }),
	email: z.string().email().openapi({ example: "user@example.com" }),
	name: z.string().nullable(),
	activeProjectId: z.string().nullable(),
	createdAt: z.date().or(z.string()),
});

export const UpdateUserSchema = z.object({
	name: z.string().optional().openapi({ example: "Jane Doe" }),
	activeProjectId: z.string().optional().openapi({ example: "clx123project" }),
});
