import { QueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { resetProjectsStore } from "@/stores/projects-store";
import { resetPromptsStore } from "@/stores/prompts-store";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

export function clearAuthState() {
  queryClient.clear();
  if (typeof window !== "undefined") {
    Cookies.remove("dcc_session_token");
    Cookies.remove("dcc_jwt_token");
    Cookies.remove("dcc_user");
    localStorage.removeItem("dcc_active_project");
  }
  resetProjectsStore();
  resetPromptsStore();
}
