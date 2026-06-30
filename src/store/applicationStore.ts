import { create } from "zustand";
import type { Application, ExtractedJob, GeneratedEmail } from "@/types";

// Holds the in-progress draft (job extracted -> email generated -> sent)
// before it's persisted as an Application via the backend.
type DraftState = {
  extractedJob: ExtractedJob | null;
  generatedEmail: GeneratedEmail | null;
  recipientEmail: string;
  setExtractedJob: (j: ExtractedJob | null) => void;
  setGeneratedEmail: (e: GeneratedEmail | null) => void;
  setRecipientEmail: (e: string) => void;
  reset: () => void;
};

export const useDraftStore = create<DraftState>((set) => ({
  extractedJob: null,
  generatedEmail: null,
  recipientEmail: "",
  setExtractedJob: (extractedJob) => set({ extractedJob }),
  setGeneratedEmail: (generatedEmail) => set({ generatedEmail }),
  setRecipientEmail: (recipientEmail) => set({ recipientEmail }),
  reset: () => set({ extractedJob: null, generatedEmail: null, recipientEmail: "" }),
}));

type ApplicationsState = {
  applications: Application[];
  setApplications: (a: Application[]) => void;
  upsertApplication: (a: Application) => void;
};

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: [],
  setApplications: (applications) => set({ applications }),
  upsertApplication: (a) =>
    set((s) => {
      const exists = s.applications.some((x) => x.id === a.id);
      return {
        applications: exists
          ? s.applications.map((x) => (x.id === a.id ? a : x))
          : [a, ...s.applications],
      };
    }),
}));
