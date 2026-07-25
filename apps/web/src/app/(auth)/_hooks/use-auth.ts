import { mutationOptions, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { xiorInstance } from "@/configs/xior";
import type { Session, User } from "@/lib/types";

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function login(payload: { email: string; password: string }): Promise<{
  success: boolean;
  user: User;
  session: Session;
  jwtToken: string;
}> {
  try {
    const res = await xiorInstance.post("/auth/login", payload);
    const data = res.data;

    const tokenRes = await xiorInstance.post("/auth/token", null, {
      headers: { token: data.session.token },
    });
    const tokenData = tokenRes.data;
    const jwtToken = tokenData.data?.token || tokenData.token;

    if (typeof window !== "undefined") {
      Cookies.set("dcc_session_token", data.session.token, { expires: 30 });
      Cookies.set("dcc_jwt_token", jwtToken, { expires: 30 });
      Cookies.set("dcc_user", JSON.stringify(data.user), { expires: 30 });
    }

    return { success: true, user: data.user, session: data.session, jwtToken };
  } catch (error) {
    const body = (error as { response?: { data?: { message?: string } } })
      .response?.data;
    throw new Error(body?.message || "Invalid email or password");
  }
}

async function register(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user: User }> {
  try {
    const res = await xiorInstance.post("/auth/register", payload);
    return res.data;
  } catch (error) {
    const body = (error as { response?: { data?: { message?: string } } })
      .response?.data;
    throw new Error(body?.message || "Registration failed");
  }
}

async function logout(): Promise<{ success: boolean }> {
  const sessionToken =
    typeof window === "undefined" ? null : Cookies.get("dcc_session_token");

  if (typeof window !== "undefined") {
    Cookies.remove("dcc_session_token");
    Cookies.remove("dcc_jwt_token");
    Cookies.remove("dcc_user");
  }

  if (sessionToken) {
    try {
      await xiorInstance.post("/auth/logout", null, {
        headers: { token: sessionToken },
      });
    } catch {
      // Safe to ignore
    }
  }

  return { success: true };
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = Cookies.get("dcc_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export function loginMutationOptions() {
  return mutationOptions({
    mutationKey: ["login"],
    mutationFn: (payload: { email: string; password: string }) =>
      login(payload),
    onSuccess: () => {
      toast.success("Successfully logged in");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log in");
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const mutation = useMutation(loginMutationOptions());

  return {
    ...mutation,
    mutate: (payload: { email: string; password: string }) => {
      mutation.mutate(payload, {
        onSuccess: () => {
          router.push("/dashboard");
        },
      });
    },
  };
}

export function registerMutationOptions() {
  return mutationOptions({
    mutationKey: ["register"],
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      register(payload),
    onSuccess: () => {
      toast.success("Account created successfully. Please sign in.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register account");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const mutation = useMutation(registerMutationOptions());

  return {
    ...mutation,
    mutate: (payload: { name: string; email: string; password: string }) => {
      mutation.mutate(payload, {
        onSuccess: () => {
          router.push("/signin");
        },
      });
    },
  };
}

export function logoutMutationOptions() {
  return mutationOptions({
    mutationKey: ["logout"],
    mutationFn: () => logout(),
    onSuccess: () => {
      toast.success("Signed out successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Logout error");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const mutation = useMutation(logoutMutationOptions());

  return {
    ...mutation,
    mutate: () => {
      mutation.mutate(undefined, {
        onSuccess: () => {
          router.push("/signin");
        },
      });
    },
  };
}
