import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { EvlogVariables } from "evlog/hono";

export interface AppBindings {
  Variables: EvlogVariables["Variables"] & {
    userId?: string;
    jwtPayload?: {
      id: string;
      email: string;
    };
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
