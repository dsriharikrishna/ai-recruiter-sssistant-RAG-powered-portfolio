export interface SiteInfo {
  id?: string;
  slug: string;
  template: string;
  theme: string;
  published_version?: number;
  bot_enabled: boolean;
  url?: string;
}

export interface FactEvidence {
  quote?: string;
  source_type?: string;
  line?: number;
}

export interface ProfileDraftData {
  schema_version?: string;
  profile: {
    name: string;
    headline: string;
    summary: string;
    evidence?: string;
    source?: FactEvidence | string;
  };
  contact?: {
    email?: string;
    email_public?: boolean;
    phone?: string;
    phone_public?: boolean;
    links?: Array<{ label: string; url: string; is_public?: boolean }>;
  };
  experiences?: Array<{
    id?: string;
    type?: string;
    source?: string;
    evidence?: string;
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    description: string;
    highlights?: string[];
  }>;
  projects?: Array<{
    id?: string;
    type?: string;
    source?: string;
    evidence?: string;
    name: string;
    description: string;
    url?: string | null;
    technologies?: string[];
    start_date?: string | null;
    end_date?: string | null;
  }>;
  skills?: Array<{
    id?: string;
    type?: string;
    source?: string;
    evidence?: string | null;
    name: string;
    category?: string | null;
    level?: string | null;
  }>;
  educations?: Array<{
    id?: string;
    type?: string;
    source?: string;
    evidence?: string | null;
    institution: string;
    degree: string;
    field_of_study?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }>;
  certifications?: Array<{
    id?: string;
    type?: string;
    source?: string;
    evidence?: string | null;
    name: string;
    issuer?: string | null;
    issue_date?: string | null;
    expiration_date?: string | null;
    url?: string | null;
  }>;
  bot_settings?: {
    salary_policy?: string;
    availability_policy?: string;
    tone?: string;
    resume_downloadable?: boolean;
  };
  flags?: Array<{
    kind?: string;
    code?: string;
    field?: string;
    message: string;
    target_id?: string;
  }>;
}

export interface UploadResumeResponse {
  job_id: string;
  status: string;
  message?: string;
}
