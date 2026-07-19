import { create } from "zustand";
import type { ResumeState } from "@/types";
export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  selectedResumeId: null,
  setResumes: (resumes) =>
    set((s) => ({
      resumes,
      selectedResumeId: resumes.some((r) => r.id === s.selectedResumeId) ? s.selectedResumeId : null,
    })),
  selectResume: (id) => set({ selectedResumeId: id }),
  clearSelectedResume: () => set({ selectedResumeId: null }),
}));
