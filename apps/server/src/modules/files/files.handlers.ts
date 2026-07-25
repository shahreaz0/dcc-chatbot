import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import prisma from "@dcc-chatbot/db";
import { HTTPException } from "hono/http-exception";
import type { AppRouteHandler } from "../../lib/types";
import type {
	DeleteFileRoute,
	ListFilesRoute,
	UploadFileRoute,
} from "./files.routes";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const uploadFile: AppRouteHandler<UploadFileRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { projectId } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const body = await c.req.parseBody();
	const file = body.file;

	if (!file || !(file instanceof File)) {
		throw new HTTPException(400, {
			message:
				"Bad Request — Invalid or missing file in form-data ('file' key expected)",
		});
	}

	const projectDir = path.join(UPLOADS_DIR, projectId);
	await mkdir(projectDir, { recursive: true });

	const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
	const filePath = path.join(projectDir, safeFilename);

	const arrayBuffer = await file.arrayBuffer();
	const fileBuffer = Buffer.from(arrayBuffer);

	// Save local copy on disk
	await writeFile(filePath, fileBuffer);
	const relativeUrl = `/uploads/${projectId}/${safeFilename}`;

	// Persist file metadata record in DB
	const projectFile = await prisma.projectFile.create({
		data: {
			name: file.name,
			fileUrl: relativeUrl,
			fileSize: file.size,
			mimeType: file.type || "application/octet-stream",
			projectId,
		},
	});

	return c.json({ status: "success" as const, data: projectFile }, 201);
};

export const listFiles: AppRouteHandler<ListFilesRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { projectId } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const files = await prisma.projectFile.findMany({
		where: { projectId },
		orderBy: { createdAt: "desc" },
	});

	return c.json({ status: "success" as const, data: files }, 200);
};

export const deleteFile: AppRouteHandler<DeleteFileRoute> = async (c) => {
	const userId = c.get("userId") as string;
	const { projectId, id } = c.req.valid("param");

	const project = await prisma.project.findFirst({
		where: { id: projectId, userId, deletedAt: null },
	});

	if (!project) {
		throw new HTTPException(404, { message: "Project not found" });
	}

	const fileRecord = await prisma.projectFile.findFirst({
		where: { id, projectId },
	});

	if (!fileRecord) {
		throw new HTTPException(404, { message: "File not found" });
	}

	if (fileRecord.fileUrl) {
		const filePath = path.join(
			process.cwd(),
			fileRecord.fileUrl.startsWith("/")
				? fileRecord.fileUrl.slice(1)
				: fileRecord.fileUrl,
		);
		try {
			await unlink(filePath);
		} catch {
			// file on disk missing, ignore error
		}
	}

	await prisma.projectFile.delete({
		where: { id },
	});

	return c.json({ status: "success" as const }, 200);
};
