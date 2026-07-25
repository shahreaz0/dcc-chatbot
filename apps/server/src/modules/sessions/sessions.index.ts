import { createRouter } from "../../lib/create-app";
import * as handlers from "./sessions.handlers";
import * as routes from "./sessions.routes";

export const sessions = createRouter()
  .openapi(routes.listSessions, handlers.listSessions)
  .openapi(routes.revokeSession, handlers.revokeSession);
