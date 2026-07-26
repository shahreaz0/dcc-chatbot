import Cookies from "js-cookie";
import xior, { type XiorResponse } from "xior";
import errorRetry from "xior/plugins/error-retry";
import setupTokenRefresh from "xior/plugins/token-refresh";
import { clearAuthState } from "@/lib/query-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export const xiorInstance = xior.create({
  baseURL: API_BASE_URL,
});

xiorInstance.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const token =
    typeof window === "undefined" ? null : Cookies.get("dcc_jwt_token");

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function shouldRefresh(response?: XiorResponse) {
  const sessionToken =
    typeof window === "undefined" ? null : Cookies.get("dcc_session_token");
  return Boolean(
    sessionToken && response?.status && [401, 403].includes(response.status),
  );
}

xiorInstance.plugins.use(
  errorRetry({
    enableRetry: (config, error) => {
      if (error?.response && shouldRefresh(error.response)) {
        return true;
      }
    },
  }),
);

setupTokenRefresh(xiorInstance, {
  shouldRefresh,
  async refreshToken(error) {
    const sessionToken = Cookies.get("dcc_session_token");
    if (!sessionToken) {
      clearAuthState();
      return Promise.reject(error);
    }
    try {
      const res = await xior.post(`${API_BASE_URL}/auth/token`, null, {
        headers: { token: sessionToken },
      });
      const newJwtToken = res.data?.data?.token || res.data?.token;
      if (newJwtToken) {
        Cookies.set("dcc_jwt_token", newJwtToken, { expires: 30 });
      } else {
        throw error;
      }
    } catch (e) {
      clearAuthState();
      return Promise.reject(error);
    }
  },
});

export async function xiorFetchAdapter(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const url =
    input instanceof Request || input instanceof URL ? input.toString() : input;

  const requestHeaders = getPlainHeaders(init?.headers);

  const xiorRes = await xiorInstance.request({
    url,
    method: init?.method,
    headers: requestHeaders,
    data: init?.body,
    signal: init?.signal,
  });

  return new Response(JSON.stringify(xiorRes.data), {
    status: xiorRes.status,
    statusText: xiorRes.statusText,
    headers: xiorRes.headers,
  });
}

export function getPlainHeaders(
  headers: HeadersInit | undefined,
): Record<string, string> {
  const plain: Record<string, string> = {};
  if (!headers) {
    return plain;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      plain[key] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      plain[key] = value;
    }
  } else {
    for (const key of Object.keys(headers)) {
      plain[key] = (headers as Record<string, string>)[key];
    }
  }
  return plain;
}
