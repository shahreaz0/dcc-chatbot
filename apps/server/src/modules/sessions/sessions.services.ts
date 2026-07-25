import crypto from "node:crypto";
import prisma from "@dcc-chatbot/db";

export async function createSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  expiresInDays = 30,
) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  return await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

export async function deleteSession(token: string) {
  return await prisma.session.delete({
    where: { token },
  });
}
