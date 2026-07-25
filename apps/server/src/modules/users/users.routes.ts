import { createRoute } from "@hono/zod-openapi";
import {
  createHttpErrorSchema,
  createSuccessSchema,
} from "../../lib/common-schemas";
import { UpdateUserSchema, UserProfileSchema } from "./users.schemas";

const tags = ["Users"];

export const getMe = createRoute({
  tags,
  method: "get",
  path: "/users/me",
  summary: "Get current user profile",
  description: "Retrieve authenticated user's account details.",
  responses: {
    200: {
      description: "OK — Profile retrieved",
      content: {
        "application/json": {
          schema: createSuccessSchema(UserProfileSchema),
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

export const updateMe = createRoute({
  tags,
  method: "patch",
  path: "/users/me",
  summary: "Update current user profile",
  description: "Update user profile fields such as name or active project ID.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — Profile updated",
      content: {
        "application/json": {
          schema: createSuccessSchema(UserProfileSchema),
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

export type GetMeRoute = typeof getMe;
export type UpdateMeRoute = typeof updateMe;
