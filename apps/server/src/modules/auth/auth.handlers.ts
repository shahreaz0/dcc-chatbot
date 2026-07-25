import prisma from "@dcc-chatbot/db";
import { env } from "@dcc-chatbot/env/server";
import { getConnInfo } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import type { AppRouteHandler } from "../../lib/types";
import { createSession } from "../sessions/sessions.services";
import type {
  GetTokenRoute,
  LoginRoute,
  LogoutRoute,
  RegisterRoute,
} from "./auth.routes";
import { hashPassword, signJwt, verifyPassword } from "./auth.services";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const body = c.req.valid("json");

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existing) {
    throw new HTTPException(409, {
      message: "Email already exists",
    });
  }

  const hashedPassword = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name ?? null,
      password: hashedPassword,
    },
  });

  return c.json(
    {
      status: "success" as const,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeProjectId: user.activeProjectId,
        createdAt: user.createdAt,
      },
    },
    201,
  );
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const body = c.req.valid("json");

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      password: true,
      activeProjectId: true,
    },
  });

  if (!user) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const valid = await verifyPassword(user.password, body.password);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const info = getConnInfo(c);
  const session = await createSession(
    user.id,
    info.remote.address,
    c.req.header("User-Agent"),
  );

  const token = await signJwt(
    {
      id: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
  );

  return c.json(
    {
      status: "success" as const,
      message: "Login successful",
      session,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeProjectId: user.activeProjectId,
        createdAt: user.createdAt,
      },
    },
    200,
  );
};

export const getToken: AppRouteHandler<GetTokenRoute> = async (c) => {
  const token = c.req.header("token");

  if (!token) {
    throw new HTTPException(401, {
      message: "Unauthorized — missing session token",
    });
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      userId: true,
      expiresAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized — invalid session" });
  }

  if (session.expiresAt < new Date()) {
    throw new HTTPException(401, { message: "Session expired" });
  }

  const jwtToken = await signJwt(
    {
      id: session.userId,
      email: session.user.email,
    },
    env.JWT_SECRET,
  );

  return c.json({ status: "success" as const, data: { token: jwtToken } }, 200);
};

export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
  const token = c.req.header("token");

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await prisma.session.deleteMany({
    where: { token },
  });

  return c.json({ status: "success" as const }, 200);
};
