import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { resumeApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { FileText, UploadCloud, CheckCircle2, Loader2, Trash2, Circle, CircleDot } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ResumeModal() {
  const { resumeModalOpen, closeResumeModal, pendingAction, clearPending } = useUiStore();
  const { resumes, selectedResumeId, selectResume, setResumes, clearSelectedResume } = useResumeStore();
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);


  useEffect(() => {
    if (resumeModalOpen) {
      setFetching(true);
      resumeApi.list()
        .then((data) => {
          setResumes(data);
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
      const updatedResumes = await resumeApi.list();
      setResumes(updatedResumes);
      
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
  }, [setResumes, pendingAction, closeResumeModal, clearPending]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await resumeApi.delete(id);
      const updatedResumes = await resumeApi.list();
      setResumes(updatedResumes);
      if (selectedResumeId === id) {
        useResumeStore.getState().clearSelectedResume();
      }
      toast({ title: "Resume deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete resume", variant: "error" });
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await resumeApi.setDefault(id);
      const updatedResumes = await resumeApi.list();
      setResumes(updatedResumes);
      toast({ title: "Default resume updated", variant: "success" });
    } catch {
      toast({ title: "Failed to set default resume", variant: "error" });
    }
  };

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
    : "Select a resume for this application, or set a default one.";

  const hasDefaultResume = resumes.some((r: any) => r.isDefault);

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
              onClick={() => {
                if (selectedResumeId === r.id) {
                  clearSelectedResume();
                } else {
                  selectResume(r.id);
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors min-h-[48px]",
                "active:bg-secondary/80 active:scale-[0.99]",
                selectedResumeId === r.id ? "border-accent bg-accent/5" : "border-border"
              )}
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <button
                  onClick={(e) => handleSetDefault(e, r.id)}
                  className="text-muted-foreground hover:text-accent transition-colors shrink-0 p-1 rounded-full hover:bg-accent/10"
                  title="Set as Default"
                >
                  {r.isDefault ? <CircleDot className="h-4 w-4 text-accent" /> : <Circle className="h-4 w-4" />}
                </button>
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground hidden sm:block" />
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
              </div>
              {selectedResumeId === r.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />}
              <button
                onClick={(e) => handleDelete(e, r.id)}
                className="ml-2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
        disabled={(!selectedResumeId && !hasDefaultResume) || uploading || fetching}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </ResponsiveModal>
  );
}
