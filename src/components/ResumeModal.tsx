import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { resumeApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { FileText, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ResumeModal() {
  const { resumeModalOpen, closeResumeModal, pendingAction, clearPending } = useUiStore();
  const { resumes, selectedResumeId, selectResume, setResumes } = useResumeStore();
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);


  useEffect(() => {
    if (resumeModalOpen) {
      setFetching(true);
      resumeApi.list()
        .then((data) => {
          setResumes(data);
          

          if (!selectedResumeId && data.length > 0) {
            const defaultResume = data.find((r: any) => r.isDefault);
            if (defaultResume) {
              selectResume(defaultResume.id);
            } else {
              const latest = [...data].sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
              if (latest) selectResume(latest.id);
            }
          }
        })
        .catch(() => toast({ title: "Error", description: "Failed to load resumes", variant: "error" }))
        .finally(() => setFetching(false));
    }
  }, [resumeModalOpen]);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setUploading(true);
    try {
      const resume = await resumeApi.upload(file);
      await resumeApi.setDefault(resume.id);
      

      const updatedResumes = await resumeApi.list();
      setResumes(updatedResumes);
      selectResume(resume.id);
      
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
  }, [setResumes, selectResume, pendingAction, closeResumeModal, clearPending]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc", ".docx"] },
    maxFiles: 1,
  });

  function handleContinue() {
    if (navigator.vibrate) navigator.vibrate(10);
    closeResumeModal();
    clearPending();
  }

  const sheetTitle = fetching
    ? "Loading resumes..."
    : resumes.length === 0
    ? "Upload your resume"
    : "Choose a resume";

  const sheetDescription = resumes.length === 0
    ? "We'll attach this to every application you send. You can replace it any time."
    : "Use your saved resume, or upload a new version for this application.";

  return (
    <ResponsiveModal
      open={resumeModalOpen}
      onOpenChange={(o) => !o && closeResumeModal()}
      title={sheetTitle}
      description={sheetDescription}
      desktopClassName="max-w-[500px]"
    >
      {fetching && resumes.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length > 0 ? (
        <div className="mb-4 flex flex-col gap-2 max-h-52 overflow-y-auto scroll-momentum">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => selectResume(r.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors min-h-[48px]",
                "active:bg-secondary/80 active:scale-[0.99]",
                selectedResumeId === r.id ? "border-accent bg-accent/5" : "border-border"
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
      ) : null}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          "active:bg-secondary/60",
          isDragActive ? "border-accent bg-accent/5" : "border-border"
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
        className="mt-5 w-full press-scale"
        variant="accent"
        disabled={!selectedResumeId || uploading || fetching}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </ResponsiveModal>
  );
}
