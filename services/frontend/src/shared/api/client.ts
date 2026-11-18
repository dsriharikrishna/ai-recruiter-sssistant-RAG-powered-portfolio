import { env } from "@/lib/env";
import { ApiError } from "./api-error";
import { HttpMethod, RequestConfig } from "./types";

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = env.NEXT_PUBLIC_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  private async execute<T>(method: HttpMethod, endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers: customHeaders, body, ...restConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const headers = new Headers(customHeaders);

    // Support FormData uploads without forcing Content-Type: application/json
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Support dev user header if present in dev mode
    if (typeof window !== "undefined") {
      const devUser = localStorage.getItem("dev_user");
      if (devUser && !headers.has("X-Dev-User")) {
        headers.set("X-Dev-User", devUser);
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      credentials: "include", // HTTP-only cookie support
      ...restConfig,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        // Clear expired auth session and redirect to login
        document.cookie = "dev_user=; path=/; max-age=0";
        document.cookie = "auth_session=; path=/; max-age=0";
        localStorage.removeItem("dev_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw ApiError.fromResponse(response.status, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  public get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.execute<T>("GET", endpoint, config);
  }

  public post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.execute<T>("POST", endpoint, { ...config, body });
  }

  public put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.execute<T>("PUT", endpoint, { ...config, body });
  }

  public patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.execute<T>("PATCH", endpoint, { ...config, body });
  }

  public delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.execute<T>("DELETE", endpoint, config);
  }
}

export const apiClient = new ApiClient();
