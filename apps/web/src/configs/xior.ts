import Cookies from "js-cookie";
import xior from "xior";

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

xiorInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication error / 401 Unauthorized");
    }
    return Promise.reject(error);
  },
);

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
