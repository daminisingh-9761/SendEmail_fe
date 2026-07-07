import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useResumeStore } from "@/store/resumeStore";
import { useUiStore } from "@/store/uiStore";
import { useDraftStore } from "@/store/applicationStore";
import { jobApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import type { JobInputType } from "@/types";

// Orchestrates the full "Generate Application" flow described in the spec:
// 1) require login  2) require a resume  3) call AI to extract job + write email.
export function useGenerateApplication() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { resumes, selectedResumeId } = useResumeStore();
  const { openLogin, openResumeModal } = useUiStore();
  const { setExtractedJob, setGeneratedEmail, setRecipientEmail } = useDraftStore();

  const generate = useCallback(
    async (input: { type: JobInputType; text?: string; url?: string; file?: File }) => {
      if (!input.text && !input.url && !input.file) {
        toast({ title: "Add a job first", description: "Paste text, upload a file, or paste a URL.", variant: "error" });
        return;
      }
      if (!user) {
        openLogin("generate");
        return;
      }

      if (resumes.length === 0) {
        openResumeModal("generate");
        return;
      }

      setLoading(true);
      try {
        const job = await jobApi.extract(input);
        setExtractedJob(job);

        const email = await jobApi.generateEmail({ jobId: job.id });
        setGeneratedEmail(email);
        setRecipientEmail(job.hrEmail ?? "");

        if (!job.hrEmail) {
          toast({
            title: "No HR email found",
            description: "Enter the recipient's email before sending.",
            variant: "info",
          });
        }
      } catch {
        toast({ title: "Couldn't generate the application", description: "Please try again.", variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [user, resumes, selectedResumeId, openLogin, openResumeModal, setExtractedJob, setGeneratedEmail, setRecipientEmail]
  );

  return { generate, loading };
}
