import { describe, it, expect } from "vitest";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

describe("Frontend API Endpoints Configuration", () => {
  it("defines standard auth and resume endpoints", () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe("/v1/auth/login");
    expect(API_ENDPOINTS.RESUMES.UPLOAD).toBe("/v1/resumes");
    expect(API_ENDPOINTS.PROFILE.DRAFT).toBe("/v1/profile/draft");
    expect(API_ENDPOINTS.PROFILE.APPROVE).toBe("/v1/profile/approve");
  });

  it("constructs dynamic public site and chat routes correctly", () => {
    expect(API_ENDPOINTS.PUBLIC.SITE("srihari-test")).toBe("/public/sites/srihari-test");
    expect(API_ENDPOINTS.PUBLIC.CHAT_STREAM).toBe("/public/chat/stream");
  });
});
