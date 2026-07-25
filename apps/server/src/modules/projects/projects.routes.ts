import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import {
	createHttpErrorSchema,
	createSuccessSchema,
	IdParamsSchema,
	PaginationQuerySchema,
} from "../../lib/common-schemas";
import {
	CreateProjectSchema,
	ProjectSchema,
	UpdateProjectSchema,
} from "./projects.schemas";

const tags = ["Projects"];

export const createProject = createRoute({
	tags,
	method: "post",
	path: "/projects",
	summary: "Create a new project/agent",
	description: "Create a project or agent entity under the authenticated user.",
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateProjectSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Created — Project created successfully",
			content: {
				"application/json": {
					schema: createSuccessSchema(ProjectSchema),
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
		422: {
			description: "Validation failed",
			content: {
				"application/json": {
					schema: createErrorSchema(CreateProjectSchema),
				},
			},
		},
	},
});

export const listProjects = createRoute({
	tags,
	method: "get",
	path: "/projects",
	summary: "List user projects/agents",
	description: "Get all projects/agents created by the authenticated user.",
	request: {
		query: PaginationQuerySchema,
	},
	responses: {
		200: {
			description: "OK — Projects listed",
			content: {
				"application/json": {
					schema: createSuccessSchema(z.array(ProjectSchema)),
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

export const getProject = createRoute({
	tags,
	method: "get",
	path: "/projects/{id}",
	summary: "Get project details",
	description: "Retrieve details of a specific project by ID.",
	request: {
		params: IdParamsSchema,
	},
	responses: {
		200: {
			description: "OK — Project details",
			content: {
				"application/json": {
					schema: createSuccessSchema(ProjectSchema),
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

export const updateProject = createRoute({
	tags,
	method: "patch",
	path: "/projects/{id}",
	summary: "Update project settings or system prompt",
	description: "Update project name, description, model, or system prompt.",
	request: {
		params: IdParamsSchema,
		body: {
			content: {
				"application/json": {
					schema: UpdateProjectSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "OK — Project updated",
			content: {
				"application/json": {
					schema: createSuccessSchema(ProjectSchema),
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

export const deleteProject = createRoute({
	tags,
	method: "delete",
	path: "/projects/{id}",
	summary: "Delete a project",
	description: "Delete a project and its associated prompts and chat history.",
	request: {
		params: IdParamsSchema,
	},
	responses: {
		200: {
			description: "OK — Project deleted",
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
			description: "Project not found",
			content: {
				"application/json": {
					schema: createHttpErrorSchema({ statusCode: "404" }),
				},
			},
		},
	},
});

export type CreateProjectRoute = typeof createProject;
export type ListProjectsRoute = typeof listProjects;
export type GetProjectRoute = typeof getProject;
export type UpdateProjectRoute = typeof updateProject;
export type DeleteProjectRoute = typeof deleteProject;
