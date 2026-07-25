import { createRouter } from "../../lib/create-app";
import * as handlers from "./projects.handlers";
import * as routes from "./projects.routes";

export const projects = createRouter()
	.openapi(routes.createProject, handlers.createProject)
	.openapi(routes.listProjects, handlers.listProjects)
	.openapi(routes.getProject, handlers.getProject)
	.openapi(routes.updateProject, handlers.updateProject)
	.openapi(routes.deleteProject, handlers.deleteProject);
