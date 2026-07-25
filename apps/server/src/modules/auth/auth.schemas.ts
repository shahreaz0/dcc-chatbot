import { z } from "@hono/zod-openapi";
import { SessionSchema } from "../sessions/sessions.schemas";

export const RegisterSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
  name: z.string().optional().openapi({ example: "John Doe" }),
});

export const LoginSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
});

export const AuthUserSchema = z.object({
  id: z.string().openapi({ example: "clx123user" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  name: z.string().nullable(),
  activeProjectId: z.string().nullable(),
  createdAt: z.date().or(z.string()),
});

export const LoginResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  session: SessionSchema,
  token: z.string(),
  user: AuthUserSchema,
});
