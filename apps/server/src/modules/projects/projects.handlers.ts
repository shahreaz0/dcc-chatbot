import prisma from "@dcc-chatbot/db";
import { HTTPException } from "hono/http-exception";
import { buildPagination } from "../../lib/common-schemas";
import type { AppRouteHandler } from "../../lib/types";
import type {
	CreateProjectRoute,
	DeleteProjectRoute,
	GetProjectRoute,
	ListProjectsRoute,
	UpdateProjectRoute,
} from "./projects.routes";

export const createProject: AppRouteHandler<CreateProjectRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const body = c.req.valid("json");

	const project = await prisma.project.create({
		data: {
			name: body.name,
			description: body.description ?? null,
			systemPrompt: body.systemPrompt ?? null,
			model: body.model ?? "gemini-2.5-flash",
			userId,
		},
	});

	await prisma.user.update({
		where: { id: userId },
		data: { activeProjectId: project.id },
	});

	return c.json({ status: "success" as const, data: project }, 201);
};

export const listProjects: AppRouteHandler<ListProjectsRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { page, perPage } = c.req.valid("query");
	const pagination = buildPagination(page, perPage);

	const projects = await prisma.project.findMany({
		where: { userId, deletedAt: null },
		orderBy: { createdAt: "desc" },
		...(pagination.take !== undefined ? pagination : {}),
	});

	return c.json({ status: "success" as const, data: projects }, 200);
};

export const getProject: AppRouteHandler<GetProjectRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { id } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	return c.json({ status: "success" as const, data: project }, 200);
};

export const updateProject: AppRouteHandler<UpdateProjectRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const existing = await prisma.project.findFirst({
		where: { id, userId, deletedAt: null },
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const updated = await prisma.project.update({
		where: { id },
		data: {
			...(body.name !== undefined && { name: body.name }),
			...(body.description !== undefined && { description: body.description }),
			...(body.systemPrompt !== undefined && {
				systemPrompt: body.systemPrompt,
			}),
			...(body.model !== undefined && { model: body.model }),
		},
	});

	return c.json({ status: "success" as const, data: updated }, 200);
};

export const deleteProject: AppRouteHandler<DeleteProjectRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { id } = c.req.valid("param");

	const existing = await prisma.project.findFirst({
		where: { id, userId, deletedAt: null },
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	await prisma.project.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return c.json({ status: "success" as const }, 200);
};
