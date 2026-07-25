import { configureOpenAPI } from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";
import { auth } from "./modules/auth/auth.index";
import { chat } from "./modules/chat/chat.index";
import { files } from "./modules/files/files.index";
import { index } from "./modules/index/index.routes";
import { projects } from "./modules/projects/projects.index";
import { prompts } from "./modules/prompts/prompts.index";
import { sessions } from "./modules/sessions/sessions.index";
import { users } from "./modules/users/users.index";

const routes = [
	index,
	auth,
	users,
	sessions,
	projects,
	prompts,
	chat,
	files,
] as const;

export const app = createApp();

configureOpenAPI(app);

for (const route of routes) {
	app.route("/", route);
}

export type AppType = (typeof routes)[number];
