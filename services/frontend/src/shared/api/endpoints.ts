export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
    ME: "/v1/auth/me",
    REFRESH: "/v1/auth/refresh",
  },
  RESUMES: {
    UPLOAD: "/v1/resumes",
    JOB_STATUS: (jobId: string) => `/v1/jobs/${jobId}`,
  },
  PROFILE: {
    DRAFT: "/v1/profile/draft",
    APPROVE: "/v1/profile/approve",
    VERSIONS: "/v1/profile/versions",
  },
  SITE: {
    GET: "/v1/site",
    PUBLISH: "/v1/site/publish",
  },
  UNANSWERED: {
    LIST: "/v1/unanswered",
    REPLY: "/v1/unanswered/reply",
  },
  PUBLIC: {
    SITE: (slug: string) => `/public/sites/${slug}`,
    CHAT_STREAM: "/public/chat/stream",
  },
} as const;
