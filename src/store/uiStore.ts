import { create } from "zustand";

import type { UiState } from "@/types";

export const useUiStore = create<UiState>((set) => ({
  loginModalOpen: false,
  resumeModalOpen: false,
  pendingAction: null,
  sessionKey: 0,
  openLogin: (pending = null) => set({ loginModalOpen: true, pendingAction: pending }),
  closeLogin: () => set({ loginModalOpen: false }),
  openResumeModal: (pending = null) => set({ resumeModalOpen: true, pendingAction: pending }),
  closeResumeModal: () => set({ resumeModalOpen: false }),
  clearPending: () => set({ pendingAction: null }),
  incrementSessionKey: () => set((s) => ({ sessionKey: s.sessionKey + 1 })),
}));
