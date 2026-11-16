import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "./client";

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient("http://test-api:8000");
    vi.restoreAllMocks();
  });

  it("adds X-Dev-User header when devUser is configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "mock-id",
        slug: "test-user",
        template: "default",
        theme: "light",
        published_version: 1,
        bot_enabled: true,
        url: "http://test",
      }),
    } as Response);

    await client.getSite();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[0]).toBe("http://test-api:8000/v1/site");

    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("X-Dev-User")).toBe("dev-user-default");
  });

  it("fetches public site without authentication header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        slug: "alex-johnson",
        name: "Alex",
        headline: "Engineer",
        summary: "Bio",
        template: "default",
        theme: "light",
        bot_enabled: true,
        contact: { email: null, phone: null, links: [] },
        experiences: [],
        projects: [],
        skills: [],
        educations: [],
        certifications: [],
      }),
    } as Response);

    const site = await client.getPublicSite("alex-johnson");
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://test-api:8000/public/sites/alex-johnson",
      expect.anything()
    );
    expect(site.name).toBe("Alex");
  });
});
