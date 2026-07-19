export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  hasGmailAccess?: boolean;
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
  id: string;
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

export interface HomeLayoutProps {
  isReturningUser: boolean;
  applications?: Application[];
  appsLoading: boolean;
  sentThisWeek: number;
  recentApps: Application[];
}

export interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export interface RecentApplicationCardProps {
  app: Application;
}


export type ResumeState = {
  resumes: Resume[];
  selectedResumeId: string | null;
  setResumes: (resumes: Resume[]) => void;
  selectResume: (id: string) => void;
  clearSelectedResume: () => void;
};

export type DraftState = {
  extractedJob: ExtractedJob | null;
  generatedEmail: GeneratedEmail | null;
  recipientEmail: string;
  setExtractedJob: (j: ExtractedJob | null) => void;
  setGeneratedEmail: (e: GeneratedEmail | null) => void;
  setRecipientEmail: (e: string) => void;
  reset: () => void;
};

export type ApplicationsState = {
  applications: Application[];
  setApplications: (a: Application[]) => void;
  upsertApplication: (a: Application) => void;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setSession: (user: AuthUser, token: string) => void;
  logout: () => void;
};

export type PendingAction = "generate" | null;

export type UiState = {
  loginModalOpen: boolean;
  resumeModalOpen: boolean;
  pendingAction: PendingAction;
  sessionKey: number;
  openLogin: (pending?: PendingAction) => void;
  closeLogin: () => void;
  openResumeModal: (pending?: PendingAction) => void;
  closeResumeModal: () => void;
  clearPending: () => void;
  incrementSessionKey: () => void;
};
