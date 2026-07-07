import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Sparkles, Loader2, Plus, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateApplication } from "@/hooks/useGenerateApplication";
import { useUiStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";

export default function JobInputCard() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { generate, loading } = useGenerateApplication();
  
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
    noClick: true, // Prevent clicking the card from opening the file dialog
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

  // Auto-continue generating once the resume is uploaded (and the modal closes)
  useEffect(() => {
    if (waitingForResume && !resumeModalOpen && resumes.length > 0) {
      setWaitingForResume(false);
      handleGenerate();
    }
  }, [resumeModalOpen, resumes.length, waitingForResume]);

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
    // Reset input so the same file can be selected again if removed
    e.target.value = "";
  };

  return (
    <Card 
      {...getRootProps()} 
      className={cn(
        "border-border/80 shadow-sm transition-colors",
        isDragActive && "border-accent bg-accent/5 ring-2 ring-accent/20 ring-offset-2"
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <input {...getInputProps()} />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf" 
          onChange={handleFileSelect} 
        />
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileSelect} 
        />

        <div className="flex flex-col gap-3">
          <div 
            className="relative flex flex-col rounded-2xl border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-accent transition-shadow"
          >
            {/* File Preview */}
            <AnimatePresence>
              {file && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="px-4 flex gap-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-2 text-sm max-w-full">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-accent" />
                    )}
                    <span className="truncate font-medium">{file.name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }} 
                      className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end p-2 sm:p-3 gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="rounded-xl shadow-lg">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2 p-3 cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Upload File (PDF)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="gap-2 p-3 cursor-pointer">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Upload Image</span>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem onClick={() => openResumeModal()} className="gap-2 p-3 cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Manage Resumes</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Textarea
                rows={1}
                placeholder="Paste a job description or URL here..."
                className="min-h-[44px] max-h-[300px] w-full resize-none border-0 p-3 shadow-none focus-visible:ring-0 sm:text-sm bg-transparent"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  // Auto-resize logic
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
                }}
                onKeyDown={handleTextareaKeyDown}
              />

              <Button
                size="icon"
                variant={canGenerate ? "accent" : "secondary"}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-full transition-all",
                  canGenerate ? "shadow-md hover:scale-105" : "opacity-50"
                )}
                disabled={!canGenerate || loading}
                onClick={handleGenerate}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground">
              {isDragActive 
                ? "Drop it here!" 
                : "Type text, paste a URL, or attach a file. Press Enter to generate."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
