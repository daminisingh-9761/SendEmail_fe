import { create } from "zustand";
import type { Resume } from "@/types";

type ResumeState = {
  resumes: Resume[];
  selectedResumeId: string | null;
  setResumes: (r: Resume[]) => void;
  selectResume: (id: string) => void;
  clearSelectedResume: () => void;
};

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
