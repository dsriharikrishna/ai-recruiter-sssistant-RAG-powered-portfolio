import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { ApiError } from "./api-error";
import { HttpMethod, RequestConfig } from "./types";

export class ServerApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = env.API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async getForwardedCookies(): Promise<string> {
    try {
      const cookieStore = await cookies();
      return cookieStore.toString();
    } catch {
      return "";
    }
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
    if (!headers.has("Content-Type") && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Forward HTTP-only cookies on the server
    const cookieHeader = await this.getForwardedCookies();
    if (cookieHeader && !headers.has("Cookie")) {
      headers.set("Cookie", cookieHeader);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      ...restConfig,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw ApiError.fromResponse(response.status, errorData);
    }

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

export const serverApiClient = new ServerApiClient();
