import { hc } from "hono/client";
import { xiorFetchAdapter } from "@/configs/xior";
import type { AppType } from "../../../server/src/app";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export const client = hc<AppType>(API_BASE_URL, {
  fetch: xiorFetchAdapter,
});
