import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

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
	CORS_ORIGIN: process.env.CORS_ORIGIN ?? vercelOrigin,
	PORT: process.env.PORT ? Number(process.env.PORT) : 8000,
	JWT_SECRET: process.env.JWT_SECRET ?? "dcc-chatbot-super-secret-jwt-key-2026",
	OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DIRECT_URL: z.url().optional(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().default(8000),
		JWT_SECRET: z
			.string()
			.min(1)
			.default("dcc-chatbot-super-secret-jwt-key-2026"),
		OPENROUTER_API_KEY: z.string().min(1),
	},
	runtimeEnv: runtimeEnv,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
