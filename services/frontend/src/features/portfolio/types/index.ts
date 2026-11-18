export interface PublicContactLink {
  label: string;
  url: string;
}

export interface PublicContact {
  email?: string | null;
  phone?: string | null;
  links: PublicContactLink[];
}

export interface PublicSiteData {
  slug: string;
  template: string;
  theme: string;
  bot_enabled: boolean;
  name: string;
  headline: string;
  summary: string;
  contact: PublicContact;
  experiences: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  skills: Array<Record<string, unknown>>;
  educations?: Array<Record<string, unknown>>;
  certifications?: Array<Record<string, unknown>>;
}

export interface ChatSourceItem {
  entity_id: string;
  title: string;
}

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  sources?: ChatSourceItem[];
}
