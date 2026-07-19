import { create } from "zustand";
import type { DraftState, ApplicationsState } from "@/types";

export const useDraftStore = create<DraftState>((set) => ({
  extractedJob: null,
  generatedEmail: null,
  recipientEmail: "",
  setExtractedJob: (extractedJob) => set({ extractedJob }),
  setGeneratedEmail: (generatedEmail) => set({ generatedEmail }),
  setRecipientEmail: (recipientEmail) => set({ recipientEmail }),
  reset: () => set({ extractedJob: null, generatedEmail: null, recipientEmail: "" }),
}));

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
