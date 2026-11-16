import { paths } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface RequestOptions extends RequestInit {
  devUser?: string;
  token?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Auth resolution
    const devUser =
      options.devUser ||
      (typeof window !== "undefined"
        ? localStorage.getItem("dev_user")
        : null) ||
      "dev-user-default";

    if (devUser) {
      headers.set("X-Dev-User", devUser);
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(
        errorBody?.error?.message ||
          errorBody?.detail ||
          `API request failed with status ${res.status}`
      );
    }

    return res.json() as Promise<T>;
  }

  // Auth & Profile Routes
  async uploadResume(file: File): Promise<
    paths["/v1/resumes"]["post"]["responses"]["202"]["content"]["application/json"]
  > {
    const formData = new FormData();
    formData.append("file", file);
    return this.request("/v1/resumes", {
      method: "POST",
      body: formData,
    });
  }

  async getJobStatus(jobId: string): Promise<
    paths["/v1/jobs/{job_id}"]["get"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request(`/v1/jobs/${jobId}`, { method: "GET" });
  }

  async getProfileDraft(): Promise<
    paths["/v1/profile/draft"]["get"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request("/v1/profile/draft", { method: "GET" });
  }

  async patchProfileDraft(
    draft: paths["/v1/profile/draft"]["patch"]["requestBody"]["content"]["application/json"]["draft"]
  ): Promise<
    paths["/v1/profile/draft"]["patch"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request("/v1/profile/draft", {
      method: "PATCH",
      body: JSON.stringify({ draft }),
    });
  }

  async approveProfile(): Promise<
    paths["/v1/profile/approve"]["post"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request("/v1/profile/approve", { method: "POST" });
  }

  async getSite(): Promise<
    paths["/v1/site"]["get"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request("/v1/site", { method: "GET" });
  }

  async publishSite(
    payload: paths["/v1/site/publish"]["post"]["requestBody"]["content"]["application/json"]
  ): Promise<
    paths["/v1/site/publish"]["post"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request("/v1/site/publish", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Public Routes
  async getPublicSite(
    slug: string
  ): Promise<
    paths["/public/sites/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]
  > {
    return this.request(`/public/sites/${slug}`, { method: "GET" });
  }
}

export const api = new ApiClient();

