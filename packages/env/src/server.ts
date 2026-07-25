import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../../apps/server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../apps/server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/server/.env") });
dotenv.config();

function getVercelOrigin() {
	const vercelUrl =
		process.env.VERCEL_ENV === "production"
			? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
			: (process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL);
	if (!vercelUrl) return undefined;
	return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

const vercelOrigin = getVercelOrigin();

const runtimeEnv = {
	...process.env,
	DATABASE_URL: process.env.DATABASE_URL,
	DIRECT_URL: process.env.DIRECT_URL,
	CORS_ORIGIN:
		process.env.CORS_ORIGIN ?? vercelOrigin ?? "http://localhost:3000",
	PORT: process.env.PORT ? Number(process.env.PORT) : 8000,
	JWT_SECRET: process.env.JWT_SECRET ?? "dcc-chatbot-super-secret-jwt-key-2026",
};

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DIRECT_URL: z.string().optional(),
		CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().default(8000),
		JWT_SECRET: z
			.string()
			.min(1)
			.default("dcc-chatbot-super-secret-jwt-key-2026"),
	},
	runtimeEnv: runtimeEnv,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
