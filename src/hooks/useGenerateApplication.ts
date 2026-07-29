import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useResumeStore } from "@/store/resumeStore";
import { useUiStore } from "@/store/uiStore";
import { useDraftStore } from "@/store/applicationStore";
import { jobApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import type { JobInputType } from "@/types";


export function useGenerateApplication() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { resumes, selectedResumeId } = useResumeStore();
  const { openLogin, openResumeModal } = useUiStore();
  const { setExtractedJob, setGeneratedEmail, setRecipientEmail, addChatMessage, removeLastChatMessage } = useDraftStore();

  const generate = useCallback(
    async (input: { type: JobInputType; text?: string; url?: string; file?: File }) => {
      if (!input.text && !input.url && !input.file) {
        toast({ title: "Add a job first", description: "Paste text, upload a file, or paste a URL.", variant: "error" });
        return false;
      }
      if (!user) {
        openLogin("generate");
        return false;
      }

      const isDefinitelyJob = input.type === "url" || input.type === "file";

      if (isDefinitelyJob && !selectedResumeId && !resumes.some(r => r.isDefault)) {
        openResumeModal("generate");
        toast({ title: "Select a resume", description: "Please select a resume or set a default resume.", variant: "error" });
        return false;
      }

      setLoading(true);
      try {
        if (input.text) {
          addChatMessage({ role: "user", content: input.text });
        } else if (input.url) {
          addChatMessage({ role: "user", content: `URL: ${input.url}` });
        } else if (input.file) {
          addChatMessage({ role: "user", content: `File: ${input.file.name}` });
        }

        const job = await jobApi.extract(input);

        if (job.responseType === "chat") {
          addChatMessage({ role: "ai", content: job.chatResponse || "No response provided" });
          setLoading(false);
          return true;
        }

        if (!selectedResumeId && !resumes.some(r => r.isDefault)) {
          openResumeModal("generate");
          toast({ title: "Select a resume", description: "Please select a resume or set a default resume.", variant: "error" });
          removeLastChatMessage();
          return false;
        }

        setExtractedJob(job);

        const payload: any = { jobId: job.id };
        if (selectedResumeId) {
          payload.resumeId = selectedResumeId;
        }

        const email = await jobApi.generateEmail(payload);
        setGeneratedEmail(email);
        setRecipientEmail(job.hrEmail ?? "");

        if (!job.hrEmail) {
          toast({
            title: "No HR email found",
            description: "Enter the recipient's email before sending.",
            variant: "info",
          });
        }
        return true;
      } catch {
        removeLastChatMessage();
        toast({ title: "Couldn't generate the application", description: "Please try again.", variant: "error" });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, resumes, selectedResumeId, openLogin, openResumeModal, setExtractedJob, setGeneratedEmail, setRecipientEmail, addChatMessage, removeLastChatMessage]
  );

  return { generate, loading };
}
