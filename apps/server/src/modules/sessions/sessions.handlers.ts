import prisma from "@dcc-chatbot/db";
import type { AppRouteHandler } from "../../lib/types";
import type { ListSessionsRoute, RevokeSessionRoute } from "./sessions.routes";

export const listSessions: AppRouteHandler<ListSessionsRoute> = async (c) => {
	const userId = c.get("userId");
	const sessions = await prisma.session.findMany({
		where: { userId },
		select: {
			id: true,
			token: true,
			expiresAt: true,
			ipAddress: true,
			userAgent: true,
			createdAt: true,
		},
		orderBy: { createdAt: "desc" },
	});

	return c.json({ status: "success" as const, data: sessions }, 200);
};

export const revokeSession: AppRouteHandler<RevokeSessionRoute> = async (c) => {
	const userId = c.get("userId");
	const { id } = c.req.valid("param");

	await prisma.session.deleteMany({
		where: { id, userId },
	});

	return c.json({ status: "success" as const }, 200);
};
