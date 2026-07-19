import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BottomSheet, ActionSheetItem } from "@/components/ui/bottom-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, ArrowUp, Loader2, Plus, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateApplication } from "@/hooks/useGenerateApplication";
import { useUiStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function BaseJobInput({ isDesktop }: { isDesktop: boolean }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { generate, loading } = useGenerateApplication();
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { resumeModalOpen, openResumeModal } = useUiStore();
  const { resumes } = useResumeStore();
  const [waitingForResume, setWaitingForResume] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxFiles: 1,
    noClick: true,
  });

  function handleGenerate() {
    if (file) {
      if (resumes.length === 0) setWaitingForResume(true);
      generate({ type: "file", file });
    } else {
      const input = text.trim();
      const isUrl = /^(https?:\/\/[^\s]+)$/i.test(input);
      
      if (resumes.length === 0) setWaitingForResume(true);
      
      if (isUrl) {
        generate({ type: "url", url: input });
      } else {
        generate({ type: "text", text: input });
      }
    }
  }

  useEffect(() => {
    if (waitingForResume && !resumeModalOpen && resumes.length > 0) {
      setWaitingForResume(false);
      handleGenerate();
    }
  }, [resumeModalOpen, resumes.length, waitingForResume]);

  useEffect(() => {
    const focusInput = () => textareaRef.current?.focus();
    const uploadImage = () => imageInputRef.current?.click();
    const uploadFile = () => fileInputRef.current?.click();

    window.addEventListener("mailjob:focus-input", focusInput);
    window.addEventListener("mailjob:upload-image", uploadImage);
    window.addEventListener("mailjob:upload-file", uploadFile);

    return () => {
      window.removeEventListener("mailjob:focus-input", focusInput);
      window.removeEventListener("mailjob:upload-image", uploadImage);
      window.removeEventListener("mailjob:upload-file", uploadFile);
    };
  }, []);

  const canGenerate = (text.trim().length > 0 || !!file) && !loading;

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canGenerate) {
        handleGenerate();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const attachMenu = (
    <>
      <ActionSheetItem
        icon={<FileText className="h-5 w-5" />}
        label="Upload File (PDF)"
        subtitle="Job description document"
        onClick={() => {
          setAttachSheetOpen(false);
          setTimeout(() => fileInputRef.current?.click(), 200);
        }}
      />
      <ActionSheetItem
        icon={<ImageIcon className="h-5 w-5" />}
        label="Upload Image"
        subtitle="Screenshot of a job posting"
        onClick={() => {
          setAttachSheetOpen(false);
          setTimeout(() => imageInputRef.current?.click(), 200);
        }}
      />
      <div className="h-px bg-border my-1" />
      <ActionSheetItem
        icon={<FileText className="h-5 w-5" />}
        label="Manage Resumes"
        subtitle="Upload or change your resume"
        onClick={() => {
          setAttachSheetOpen(false);
          setTimeout(() => openResumeModal(), 200);
        }}
      />
    </>
  );

  const desktopAttachMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            "text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          )}
        >
          <Plus className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
          <FileText className="mr-2 h-4 w-4" /> Upload File (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openResumeModal()}>
          <FileText className="mr-2 h-4 w-4" /> Manage Resumes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isDesktop) {
    return (
      <div {...getRootProps()} className={cn("w-full relative transition-all", isDragActive && "ring-2 ring-accent/30 rounded-2xl")}>
        <input {...getInputProps()} />
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileSelect} />
        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />
                )}
                <span className="truncate font-medium max-w-[200px]">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-2 rounded-2xl border border-border bg-card shadow-sm pl-2 pr-2 py-2 focus-within:border-accent/50 transition-colors">
          <div className="mt-0.5">{desktopAttachMenu}</div>
          <div className="flex-1 min-h-[40px] flex items-center">
            <Textarea
              ref={textareaRef}
              rows={1}
              placeholder="Paste a job description or URL"
              className="w-full resize-none border-0 bg-transparent p-0 px-1 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 focus:border-transparent min-h-[24px] max-h-[160px] flex items-center"
              style={{ height: "24px" }}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>
          <Button
            size="icon"
            variant={canGenerate ? "accent" : "secondary"}
            className={cn("h-10 w-10 shrink-0 rounded-full transition-all", canGenerate ? "shadow-sm" : "opacity-40")}
            disabled={!canGenerate || loading}
            onClick={handleGenerate}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    );
  }


  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "fixed left-0 right-0 z-30 px-5 pt-3 pb-5 transition-transform duration-300 ease-out bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))]",
          isDragActive && "ring-2 ring-accent/30"
        )}
      >
        <input {...getInputProps()} />
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileSelect} />
        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-accent" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />
                )}
                <span className="truncate font-medium max-w-[200px]">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="rounded-full p-0.5 text-muted-foreground active:text-foreground transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "flex items-center gap-1.5",
            "rounded-full border border-border bg-card shadow-sm",
            "pl-1 pr-1 py-1 transition-colors focus-within:border-accent/50"
          )}
        >
          <button
            onClick={() => setAttachSheetOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-secondary active:text-foreground transition-colors press-scale"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center min-h-[36px]">
            <Textarea
              ref={textareaRef}
              rows={1}
              placeholder="Paste a job description or URL"
              className="w-full resize-none border-0 bg-transparent p-0 px-1 text-[15px] leading-[22px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0 focus:border-transparent min-h-[22px] max-h-[120px] h-[22px] flex items-center"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>
          <Button
            size="icon"
            variant={canGenerate ? "accent" : "secondary"}
            className={cn("h-9 w-9 shrink-0 rounded-full transition-all press-scale", canGenerate ? "shadow-sm" : "opacity-40")}
            disabled={!canGenerate || loading}
            onClick={handleGenerate}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        {isDragActive && <p className="text-center text-xs text-accent font-medium mt-1.5">Drop it here!</p>}
      </div>

      <BottomSheet open={attachSheetOpen} onOpenChange={setAttachSheetOpen} title="Add attachment">
        <div className="flex flex-col">{attachMenu}</div>
      </BottomSheet>
    </>
  );
}

export default function JobInputCard() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return <BaseJobInput isDesktop={isDesktop} />;
}
