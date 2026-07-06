import { create } from "zustand";

// Drives the global modals so any component (and any async flow) can
// trigger "please log in" / "please pick a resume" without prop drilling.
type PendingAction = "generate" | null;

type UiState = {
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
