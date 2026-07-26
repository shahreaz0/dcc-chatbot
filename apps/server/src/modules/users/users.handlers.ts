import prisma from "@dcc-chatbot/db";
import { HTTPException } from "hono/http-exception";
import type { AppRouteHandler } from "../../lib/types";
import type { GetMeRoute, UpdateMeRoute } from "./users.routes";

export const getMe: AppRouteHandler<GetMeRoute> = async (c) => {
  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      activeProjectId: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ status: "success" as const, data: user }, 200);
};

export const updateMe: AppRouteHandler<UpdateMeRoute> = async (c) => {
  const userId = c.get("userId") as string;
  const body = c.req.valid("json");

  if (body.activeProjectId) {
    const project = await prisma.project.findFirst({
      where: { id: body.activeProjectId, userId, deletedAt: null },
    });
    if (!project) {
      throw new HTTPException(404, { message: "Project not found" });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.activeProjectId !== undefined && {
        activeProjectId: body.activeProjectId,
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      activeProjectId: true,
      createdAt: true,
    },
  });

  return c.json({ status: "success" as const, data: updated }, 200);
};
