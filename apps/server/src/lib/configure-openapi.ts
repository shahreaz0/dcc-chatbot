import { Scalar as scalar } from "@scalar/hono-api-reference";
import type { AppOpenAPI } from "./types";

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "DCC Chatbot Platform API",
      description:
        "RESTful API for Chatbot Platform, Project Agents, and Prompt Management",
    },
    security: [{ Bearer: [] }],
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    description: "Use Bearer JWT token for authentication",
    bearerFormat: "JWT",
  });

  app.get(
    "/reference",
    scalar({
      url: "/doc",
      pageTitle: "DCC Chatbot Platform API Reference",
    }),
  );
}
