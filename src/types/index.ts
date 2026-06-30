export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type Resume = {
  id: string;
  fileName: string;
  uploadedAt: string;
  isDefault: boolean;
  sizeKb: number;
};

export type JobInputType = "text" | "file" | "url";

export type ApplicationStatus =
  | "draft"
  | "sent"
  | "follow_up_sent"
  | "failed";

export type ExtractedJob = {
  jobTitle: string;
  company: string;
  location?: string;
  hrEmail?: string | null;
  hrName?: string | null;
  summary: string;
  keyRequirements: string[];
  sourceType: JobInputType;
  sourceRaw: string;
};

export type GeneratedEmail = {
  subject: string;
  body: string;
};

export type Application = {
  id: string;
  job: ExtractedJob;
  email: GeneratedEmail;
  recipientEmail: string;
  resumeId: string;
  resumeFileName: string;
  status: ApplicationStatus;
  createdAt: string;
  sentAt?: string;
  followUps: { id: string; sentAt: string; body: string }[];
  aiSuggestions: string[];
};
