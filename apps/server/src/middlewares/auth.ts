import { env } from "@dcc-chatbot/env/server";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import type { AppBindings } from "../lib/types";

export function auth() {
	return createMiddleware<AppBindings>(async (c, next) => {
		const handler = jwt({ secret: env.JWT_SECRET, alg: "HS512" });
		try {
			await handler(c, async () => {});
		} catch {
			throw new HTTPException(401, {
				message: "Unauthorized — Invalid or missing authentication token",
			});
		}

		const payload = c.get("jwtPayload") as
			| { id?: string; email?: string }
			| undefined;
		if (!payload?.id) {
			throw new HTTPException(401, {
				message: "Unauthorized — Invalid token payload",
			});
		}

		c.set("userId", payload.id);
		await next();
	});
}
