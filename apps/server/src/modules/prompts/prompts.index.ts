import { createRouter } from "../../lib/create-app";
import * as handlers from "./prompts.handlers";
import * as routes from "./prompts.routes";

export const prompts = createRouter()
  .openapi(routes.createPrompt, handlers.createPrompt)
  .openapi(routes.listPrompts, handlers.listPrompts)
  .openapi(routes.updatePrompt, handlers.updatePrompt)
  .openapi(routes.deletePrompt, handlers.deletePrompt);
