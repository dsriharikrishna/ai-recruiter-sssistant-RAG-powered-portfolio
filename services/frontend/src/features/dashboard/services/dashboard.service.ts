import { apiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { ProfileDraftData, SiteInfo, UploadResumeResponse } from "../types";

export const dashboardService = {
  async getSite(): Promise<SiteInfo> {
    return apiClient.get<SiteInfo>(API_ENDPOINTS.SITE.GET);
  },

  async publishSite(payload: {
    template?: string;
    theme?: string;
  }): Promise<SiteInfo> {
    return apiClient.post<SiteInfo>(API_ENDPOINTS.SITE.PUBLISH, payload);
  },

  async getProfileDraft(): Promise<ProfileDraftData> {
    return apiClient.get<ProfileDraftData>(API_ENDPOINTS.PROFILE.DRAFT);
  },

  async approveProfile(): Promise<{ message: string; version: number }> {
    return apiClient.post<{ message: string; version: number }>(
      API_ENDPOINTS.PROFILE.APPROVE
    );
  },

  async uploadResume(file: File): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<UploadResumeResponse>(
      API_ENDPOINTS.RESUMES.UPLOAD,
      formData
    );
  },

  async getJobStatus(
    jobId: string
  ): Promise<{ job_id: string; status: string }> {
    return apiClient.get<{ job_id: string; status: string }>(
      API_ENDPOINTS.RESUMES.JOB_STATUS(jobId)
    );
  },
};
