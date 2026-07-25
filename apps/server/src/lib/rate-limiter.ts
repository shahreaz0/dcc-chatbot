import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "./types";

interface RateEntry {
	count: number;
	resetAt: number;
}

/**
 * Simple in-memory sliding-window rate limiter.
 * Creates a new store per call so each route gets its own limit.
 */
export function rateLimit(options: { max: number; windowMs: number }) {
	const store = new Map<string, RateEntry>();

	// Periodically clean up expired entries to avoid memory leaks
	const cleanup = setInterval(
		() => {
			const now = Date.now();
			for (const [key, entry] of store.entries()) {
				if (entry.resetAt <= now) {
					store.delete(key);
				}
			}
		},
		Math.max(options.windowMs, 60_000),
	);

	// Prevent the cleanup timer from keeping the process alive
	if (cleanup.unref) {
		cleanup.unref();
	}

	return createMiddleware<AppBindings>(async (c, next) => {
		const ip =
			c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
			c.req.header("cf-connecting-ip") ??
			c.req.header("x-real-ip") ??
			"unknown";

		const now = Date.now();
		const entry = store.get(ip);

		if (!entry || entry.resetAt <= now) {
			store.set(ip, { count: 1, resetAt: now + options.windowMs });
		} else {
			entry.count++;
			if (entry.count > options.max) {
				const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
				c.header("Retry-After", String(retryAfter));
				c.header("X-RateLimit-Limit", String(options.max));
				c.header("X-RateLimit-Remaining", "0");
				throw new HTTPException(429, {
					message: `Too many requests. Please try again in ${retryAfter} seconds.`,
				});
			}
		}

		await next();
	});
}
