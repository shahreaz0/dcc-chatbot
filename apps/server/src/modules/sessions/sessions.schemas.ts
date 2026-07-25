import { z } from "@hono/zod-openapi";

export const SessionSchema = z.object({
	id: z.string().openapi({ example: "clx123session" }),
	token: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
	expiresAt: z.date().or(z.string()),
	ipAddress: z.string().nullable().optional(),
	userAgent: z.string().nullable().optional(),
	createdAt: z.date().or(z.string()),
});
