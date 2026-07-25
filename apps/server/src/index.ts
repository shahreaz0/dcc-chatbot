import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { env } from "@dcc-chatbot/env/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  wrapLanguageModel,
} from "ai";
import { initLogger } from "evlog";
import { createAILogger, createEvlogIntegration } from "evlog/ai";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";

initLogger({
  env: { service: "dcc-chatbot-server" },
});

const app = new Hono<EvlogVariables>();

app.use(evlog());

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.post("/ai", async (c) => {
  const body = await c.req.json();
  const uiMessages = body.messages || [];
  const ai = createAILogger(c.get("log"));
  const model = wrapLanguageModel({
    model: google("gemini-2.5-flash"),
    middleware: devToolsMiddleware(),
  });
  const result = streamText({
    model: ai.wrap(model),
    messages: await convertToModelMessages(uiMessages),
    telemetry: {
      isEnabled: true,
      integrations: [createEvlogIntegration(ai)],
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
});

app.get("/", (c) => {
  return c.json({ status: "OK" });
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
