import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link2, Type, UploadCloud, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateApplication } from "@/hooks/useGenerateApplication";
import type { JobInputType } from "@/types";

export default function JobInputCard() {
  const [tab, setTab] = useState<JobInputType>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { generate, loading } = useGenerateApplication();

  const onDrop = useCallback((accepted: File[]) => setFile(accepted[0] ?? null), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  function handleGenerate() {
    if (tab === "text") generate({ type: "text", text });
    if (tab === "url") generate({ type: "url", url });
    if (tab === "file" && file) generate({ type: "file", file });
  }

  const canGenerate = (tab === "text" && text.trim().length > 0) || (tab === "url" && url.trim().length > 0) || (tab === "file" && !!file);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as JobInputType)}>
          <TabsList className="h-auto flex-wrap sm:flex-nowrap">
            <TabsTrigger value="text" className="gap-1.5"><Type className="h-3.5 w-3.5" /> Paste text</TabsTrigger>
            <TabsTrigger value="file" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Upload file</TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5"><Link2 className="h-3.5 w-3.5" /> Job URL</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-5">
            <Textarea
              rows={8}
              placeholder="Paste the full job description here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="file" className="mt-5">
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                isDragActive ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/50"
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Drop a PDF or screenshot of the job post"}
              </p>
              <p className="text-xs text-muted-foreground">PDF, PNG, or JPG — max 10MB</p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-5">
            <Input
              placeholder="https://company.com/careers/job-id"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              We'll fetch and read the listing directly from the page.
            </p>
          </TabsContent>
        </Tabs>

        <motion.div whileTap={{ scale: 0.98 }} className="mt-6">
          <Button
            size="lg"
            variant="accent"
            className="w-full gap-2"
            disabled={!canGenerate || loading}
            onClick={handleGenerate}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Reading the job & drafting your email…" : "Generate application"}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
