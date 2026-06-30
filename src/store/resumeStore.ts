import { create } from "zustand";
import type { Resume } from "@/types";

type ResumeState = {
  resumes: Resume[];
  selectedResumeId: string | null;
  setResumes: (r: Resume[]) => void;
  addResume: (r: Resume) => void;
  selectResume: (id: string) => void;
};

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  selectedResumeId: null,
  setResumes: (resumes) =>
    set({ resumes, selectedResumeId: resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? null }),
  addResume: (r) =>
    set((s) => ({ resumes: [r, ...s.resumes], selectedResumeId: r.id })),
  selectResume: (id) => set({ selectedResumeId: id }),
}));
