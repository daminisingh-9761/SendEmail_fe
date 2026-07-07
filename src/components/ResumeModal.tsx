import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { resumeApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { FileText, UploadCloud, CheckCircle2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ResumeModal() {
  const { resumeModalOpen, closeResumeModal, pendingAction, clearPending } = useUiStore();
  const { resumes, selectedResumeId, selectResume, addResume } = useResumeStore();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (resumeModalOpen && !selectedResumeId && resumes.length > 0) {
      const defaultResume = resumes.find((r) => r.isDefault);
      if (defaultResume) {
        selectResume(defaultResume.id);
      } else {
        const latest = [...resumes].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
        if (latest) selectResume(latest.id);
      }
    }
  }, [resumeModalOpen, selectedResumeId, resumes, selectResume]);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setUploading(true);
    try {
      const resume = await resumeApi.upload(file);
      await resumeApi.setDefault(resume.id);
      resume.isDefault = true;
      addResume(resume);
      toast({ title: "Resume uploaded", description: file.name, variant: "success" });

      if (pendingAction === "generate") {
        closeResumeModal();
        clearPending();
      }
    } catch {
      toast({ title: "Upload failed", description: "Try a PDF or DOCX under 10MB.", variant: "error" });
    } finally {
      setUploading(false);
    }
  }, [addResume, pendingAction, closeResumeModal, clearPending]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc", ".docx"] },
    maxFiles: 1,
  });

  function handleContinue() {
    closeResumeModal();
    clearPending();
  }

  return (
    <Dialog open={resumeModalOpen} onOpenChange={(o) => !o && closeResumeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {resumes.length === 0 ? "Upload your resume" : "Choose a resume"}
          </DialogTitle>
          <DialogDescription>
            {resumes.length === 0
              ? "We'll attach this to every application you send. You can replace it any time."
              : "Use your saved resume, or upload a new version for this application."}
          </DialogDescription>
        </DialogHeader>

        {resumes.length > 0 && (
          <div className="mb-4 flex flex-col gap-2 max-h-40 overflow-y-auto">
            {resumes.map((r) => (
              <button
                key={r.id}
                onClick={() => selectResume(r.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selectedResumeId === r.id ? "border-accent bg-accent/5" : "border-border hover:bg-secondary"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{r.fileName}</p>
                    {r.isDefault && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Uploaded {formatDate(r.uploadedAt)}</p>
                </div>
                {selectedResumeId === r.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />}
              </button>
            ))}
          </div>
        )}

        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            isDragActive ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/50"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">
            {uploading ? "Uploading…" : "Drop a PDF/DOCX, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">Max 10MB</p>
        </div>

        <Button
          className="mt-5 w-full"
          variant="accent"
          disabled={!selectedResumeId || uploading}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
