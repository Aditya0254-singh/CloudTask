// A small typed wrapper around fetch. No Axios — the backend's response
// shape is simple enough that a thin wrapper covers everything we need:
// base URL, auth header injection, JSON parsing, and consistent errors.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  // Fail loudly in development if the env var was never set, rather than
  // silently sending requests to a relative (and wrong) URL.
  console.error(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it."
  );
}

// Thrown for any non-2xx response. Carries the backend's message and
// status code so callers (React Query, forms) can display it directly.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Reads the current JWT from sessionStorage at call time (not cached),
// so a login/logout mid-session is always reflected on the next request.
function getToken(): string | null {
  return sessionStorage.getItem("cloudtask_token");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // 204 No Content (DELETE) has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  // The backend always returns JSON, even on errors, so we can safely
  // parse it to extract a useful message either way.
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload.message === "string" && payload.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
