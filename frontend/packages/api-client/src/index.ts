export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | undefined;
  defaultHeaders?: HeadersInit;
};

export function resolveApiBaseUrl(fallback = "http://localhost:8080") {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    fallback
  );
}

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl ?? resolveApiBaseUrl();

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");

    if (options.defaultHeaders) {
      const defaultHeaders = new Headers(options.defaultHeaders);
      defaultHeaders.forEach((value, key) => headers.set(key, value));
    }

    const token = options.getToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    put: <T>(path: string, body: unknown) =>
      request<T>(path, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: <T>(path: string) =>
      request<T>(path, {
        method: "DELETE",
      }),
    request,
  };
}
