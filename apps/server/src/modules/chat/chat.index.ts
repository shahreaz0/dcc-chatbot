import { createRouter } from "../../lib/create-app";
import * as handlers from "./chat.handlers";
import * as routes from "./chat.routes";

export const chat = createRouter()
  .openapi(routes.chatStream, handlers.chatStream)
  .openapi(routes.getProjectChatMessages, handlers.getProjectChatMessages)
  .openapi(routes.clearProjectChatMessages, handlers.clearProjectChatMessages);
