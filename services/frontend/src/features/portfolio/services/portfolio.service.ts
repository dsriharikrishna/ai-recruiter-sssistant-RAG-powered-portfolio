import { apiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { env } from "@/lib/env";
import { PublicSiteData } from "../types";

export const portfolioService = {
  async getPublicSite(slug: string): Promise<PublicSiteData> {
    return apiClient.get<PublicSiteData>(API_ENDPOINTS.PUBLIC.SITE(slug));
  },

  async streamChat(
    slug: string,
    message: string,
    onToken: (token: string) => void,
    onSources: (sources: Array<{ entity_id: string; title: string }>) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}${API_ENDPOINTS.PUBLIC.CHAT_STREAM}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, message }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Chat stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        const match = block.match(/event:\s*(.+)\ndata:\s*(.+)/);
        if (match) {
          const event = match[1].trim();
          const data = JSON.parse(match[2].trim());

          if (event === "sources") {
            onSources(data.sources || []);
          } else if (event === "token") {
            onToken(data.token || "");
          }
        }
      }
    }
  },
};
