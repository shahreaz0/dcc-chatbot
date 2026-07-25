import { env } from "@dcc-chatbot/env/server";
import { initLogger } from "evlog";
import { app } from "./app";

initLogger({
  env: { service: "dcc-chatbot-server" },
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
