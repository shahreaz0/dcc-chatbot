import { env } from "@dcc-chatbot/env/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { evlog } from "evlog/hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { auth } from "../middlewares/auth";
import { rateLimit } from "./rate-limiter";
import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({ strict: false, defaultHook });
}

export function createApp() {
	const app = createRouter();

	app.use(evlog());
	app.use(
		cors({
			origin: [env.CORS_ORIGIN, "http://localhost:3000"],
			allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	);
	app.use(serveEmojiFavicon("🤖"));
	app.use(requestId());

	// Rate limiting on sensitive auth endpoints
	app.use("/auth/login", rateLimit({ max: 10, windowMs: 60_000 }));
	app.use("/auth/register", rateLimit({ max: 5, windowMs: 60_000 }));

	app.use("/users/*", auth());
	app.use("/sessions/*", auth());
	app.use("/projects/*", auth());

	app.notFound(notFound);
	app.onError(onError);

	return app;
}

export function createTestApp(router: AppOpenAPI) {
	const testApp = createApp();
	testApp.route("/", router);
	return testApp;
}
