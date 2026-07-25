import { createRouter } from "../../lib/create-app";
import * as handlers from "./files.handlers";
import * as routes from "./files.routes";

export const files = createRouter()
  .openapi(routes.uploadFile, handlers.uploadFile)
  .openapi(routes.listFiles, handlers.listFiles)
  .openapi(routes.deleteFile, handlers.deleteFile);
