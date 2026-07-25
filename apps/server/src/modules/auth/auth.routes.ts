import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import {
	createHttpErrorSchema,
	createSuccessSchema,
} from "../../lib/common-schemas";
import {
	AuthUserSchema,
	LoginResponseSchema,
	LoginSchema,
	RegisterSchema,
} from "./auth.schemas";

const tags = ["Auth"];

export const register = createRoute({
	tags,
	method: "post",
	path: "/auth/register",
	summary: "Register a new user account",
	description: "Create a new user account with email and password.",
	request: {
		body: {
			description: "User registration payload",
			content: {
				"application/json": {
					schema: RegisterSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Created — User registered successfully",
			content: {
				"application/json": {
					schema: createSuccessSchema(AuthUserSchema),
				},
			},
		},
		409: {
			description: "Conflict — email already exists",
			content: {
				"application/json": {
					schema: createHttpErrorSchema({ statusCode: "409" }),
				},
			},
		},
		422: {
			description: "Unprocessable Entity — validation failed",
			content: {
				"application/json": {
					schema: createErrorSchema(RegisterSchema),
				},
			},
		},
	},
});

export const login = createRoute({
	tags,
	method: "post",
	path: "/auth/login",
	summary: "Log in as user",
	description:
		"Authenticate user using email and password. Returns session token, JWT token, and user info.",
	request: {
		body: {
			description: "Login payload",
			content: {
				"application/json": {
					schema: LoginSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "OK — Login successful",
			content: {
				"application/json": {
					schema: LoginResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized — Invalid credentials",
			content: {
				"application/json": {
					schema: createHttpErrorSchema({ statusCode: "401" }),
				},
			},
		},
		422: {
			description: "Unprocessable Entity — validation failed",
			content: {
				"application/json": {
					schema: createErrorSchema(LoginSchema),
				},
			},
		},
	},
});

export const getToken = createRoute({
	tags,
	method: "post",
	path: "/auth/token",
	summary: "Exchange session token for JWT token",
	description: "Generate a new JWT bearer token using session token.",
	request: {
		headers: z.object({
			token: z
				.string()
				.openapi({ description: "Session token for authentication" }),
		}),
	},
	responses: {
		200: {
			description: "OK — JWT generated",
			content: {
				"application/json": {
					schema: createSuccessSchema(
						z.object({
							token: z.string().openapi({ example: "eyJhbGciOiJIUzUxMi..." }),
						}),
					),
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

export const logout = createRoute({
	tags,
	method: "post",
	path: "/auth/logout",
	summary: "Logout user",
	description: "Destroy session token.",
	request: {
		headers: z.object({
			token: z.string().openapi({ description: "Session token to revoke" }),
		}),
	},
	responses: {
		200: {
			description: "OK — Logout successful",
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

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;
export type GetTokenRoute = typeof getToken;
export type LogoutRoute = typeof logout;
