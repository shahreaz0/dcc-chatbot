import { createRoute, z } from "@hono/zod-openapi";
import {
	createHttpErrorSchema,
	createSuccessSchema,
	IdParamsSchema,
} from "../../lib/common-schemas";
import { SessionSchema } from "./sessions.schemas";

const tags = ["Sessions"];

export const listSessions = createRoute({
	tags,
	method: "get",
	path: "/sessions/me",
	summary: "List user active sessions",
	description:
		"Retrieve all active sessions for the current authenticated user.",
	responses: {
		200: {
			description: "OK — Sessions listed",
			content: {
				"application/json": {
					schema: createSuccessSchema(z.array(SessionSchema)),
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
	},
});

export const revokeSession = createRoute({
	tags,
	method: "delete",
	path: "/sessions/{id}",
	summary: "Revoke a session",
	description: "Revoke and delete a user session by session ID.",
	request: {
		params: IdParamsSchema,
	},
	responses: {
		200: {
			description: "OK — Session revoked",
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
	},
});

export type ListSessionsRoute = typeof listSessions;
export type RevokeSessionRoute = typeof revokeSession;
