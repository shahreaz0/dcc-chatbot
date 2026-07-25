import prisma from "@dcc-chatbot/db";
import { HTTPException } from "hono/http-exception";
import type { AppRouteHandler } from "../../lib/types";
import type {
  CreatePromptRoute,
  DeletePromptRoute,
  ListPromptsRoute,
  UpdatePromptRoute,
} from "./prompts.routes";

export const createPrompt: AppRouteHandler<CreatePromptRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId } = c.req.valid("param");
  const body = c.req.valid("json");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const prompt = await prisma.prompt.create({
    data: {
      title: body.title,
      content: body.content,
      isSystem: body.isSystem ?? false,
      projectId,
    },
  });

  return c.json({ status: "success" as const, data: prompt }, 201);
};

export const listPrompts: AppRouteHandler<ListPromptsRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId } = c.req.valid("param");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const prompts = await prisma.prompt.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ status: "success" as const, data: prompts }, 200);
};

export const updatePrompt: AppRouteHandler<UpdatePromptRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId, id } = c.req.valid("param");
  const body = c.req.valid("json");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const existing = await prisma.prompt.findFirst({
    where: { id, projectId },
  });

  if (!existing) {
    throw new HTTPException(404, { message: "Prompt not found" });
  }

  const updated = await prisma.prompt.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.isSystem !== undefined && { isSystem: body.isSystem }),
    },
  });

  return c.json({ status: "success" as const, data: updated }, 200);
};

export const deletePrompt: AppRouteHandler<DeletePromptRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const { projectId, id } = c.req.valid("param");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  await prisma.prompt.deleteMany({
    where: { id, projectId },
  });

  return c.json({ status: "success" as const }, 200);
};
