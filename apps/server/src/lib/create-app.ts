import { env } from "@dcc-chatbot/env/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { evlog } from "evlog/hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { rateLimiter } from "hono-rate-limiter";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { auth } from "../middlewares/auth";
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
  app.use(
    "/auth/login",
    rateLimiter({
      windowMs: 60_000,
      limit: 10,
      keyGenerator: (c) =>
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
        c.req.header("cf-connecting-ip") ??
        c.req.header("x-real-ip") ??
        "anonymous",
    }),
  );
  app.use(
    "/auth/register",
    rateLimiter({
      windowMs: 60_000,
      limit: 5,
      keyGenerator: (c) =>
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
        c.req.header("cf-connecting-ip") ??
        c.req.header("x-real-ip") ??
        "anonymous",
    }),
  );

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
