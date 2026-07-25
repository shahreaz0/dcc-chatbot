import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../../lib/create-app";

export const index = createRouter().openapi(
	createRoute({
		tags: ["Index"],
		method: "get",
		path: "/",
		summary: "Health check",
		description: "Check if the server API is running properly.",
		responses: {
			200: {
				description: "OK",
				content: {
					"application/json": {
						schema: z.object({
							status: z.literal("OK"),
							timestamp: z.string(),
						}),
					},
				},
			},
		},
	}),
	(c) => {
		return c.json(
			{ status: "OK" as const, timestamp: new Date().toISOString() },
			200,
		);
	},
);
