import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SkeletonEmailDraft } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useDraftStore } from "@/store/applicationStore";
import { useResumeStore } from "@/store/resumeStore";
import { useAuthStore } from "@/store/authStore";
import { applicationApi, authApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { Send, Paperclip, MapPin, Building2, AlertCircle, Loader2, Mail, Sparkles, RefreshCcw, ChevronRight, FileText } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/store/uiStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const schema = z.object({
  recipientEmail: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  body: z.string().min(20, "Email body looks too short"),
});
type FormValues = z.infer<typeof schema>;

export default function EmailEditor() {
  const { extractedJob, generatedEmail, recipientEmail, reset, setGeneratedEmail } = useDraftStore();
  const { resumes, selectedResumeId, clearSelectedResume } = useResumeStore();
  const { user, setSession } = useAuthStore();
  const { incrementSessionKey } = useUiStore();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [editing, setEditing] = useState(false);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [jdSheetOpen, setJdSheetOpen] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const connectGmail = useGoogleLogin({
    flow: "auth-code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" "),
    onSuccess: async (codeResponse) => {
      setConnectingGmail(true);
      try {
        const { user: updatedUser, token } = await authApi.googleLogin({ code: codeResponse.code });
        setSession(updatedUser, token);
        toast({ title: "Gmail connected", description: "You can now send emails.", variant: "success" });
      } catch {
        toast({ title: "Failed to connect Gmail", description: "Please try again.", variant: "error" });
      } finally {
        setConnectingGmail(false);
      }
    },
    onError: () => toast({ title: "Gmail connection failed", variant: "error" }),
  });

  const resume = resumes.find((r) => r.id === selectedResumeId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      recipientEmail: recipientEmail,
      subject: generatedEmail?.subject ?? "",
      body: generatedEmail?.body ?? "",
    },
  });

  const { ref: bodyFormRef, ...bodyRegisterRest } = register("body");
  const autoGrowBody = () => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  };
  useEffect(() => {
    autoGrowBody();
  }, [generatedEmail?.body]);

  if (!extractedJob) return null;
  
  if (!generatedEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Drafting your email…</CardTitle>
                <CardDescription className="text-xs">Reading the job requirements and writing a tailored email.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SkeletonEmailDraft />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  async function onSubmit(values: FormValues) {
    if (navigator.vibrate) navigator.vibrate(10);
    setSending(true);
    try {
      await applicationApi.send(extractedJob!.id, values);
      setSent(true);
      toast({ title: "Email sent", description: `Your application went to ${values.recipientEmail}`, variant: "success" });
      localStorage.setItem("mailjob_onboarded", "true");
      reset();
      clearSelectedResume();
      incrementSessionKey();
      navigate("/");
    } catch {
      toast({ title: "Couldn't send the email", description: "Please try again.", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  async function handleRegenerate() {
    if (!extractedJob) return;
    setRegenerating(true);
    try {
      const updatedApp = await applicationApi.regenerate(extractedJob.id);
      setGeneratedEmail({ subject: updatedApp.email.subject, body: updatedApp.email.body });
      setValue("subject", updatedApp.email.subject);
      setValue("body", updatedApp.email.body);
      toast({ title: "Email regenerated", variant: "success" });
    } catch {
      toast({ title: "Couldn't regenerate", description: "Please try again.", variant: "error" });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleEdit() {
    if (!extractedJob || !instruction.trim()) return;
    if (navigator.vibrate) navigator.vibrate(10);
    setEditing(true);
    try {
      const updatedApp = await applicationApi.edit(extractedJob.id, { instruction });
      setGeneratedEmail({ subject: updatedApp.email.subject, body: updatedApp.email.body });
      setValue("subject", updatedApp.email.subject);
      setValue("body", updatedApp.email.body);
      setInstruction("");
      setAiSheetOpen(false);
      toast({ title: "Email updated", description: "AI applied your changes.", variant: "success" });
    } catch {
      toast({ title: "Couldn't apply changes", description: "Please try again.", variant: "error" });
    } finally {
      setEditing(false);
    }
  }

  function triggerSubmit() {
    formRef.current?.requestSubmit();
  }



  const jobChip = (
    <button
      type="button"
      onClick={() => setJdSheetOpen(true)}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-colors active:bg-secondary/60 md:max-w-md press-scale"
    >
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate text-[15px] font-medium">
          {extractedJob.jobTitle} &middot; {extractedJob.company}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
    </button>
  );

  const emailForm = (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* To */}
      <div className="space-y-1.5">
        <Label htmlFor="recipientEmail" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To</Label>
        <Input id="recipientEmail" {...register("recipientEmail")} placeholder="hr@company.com" />
        {!extractedJob.hrEmail && (
          <p className="flex items-center gap-1.5 text-xs text-accent">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> We couldn't find a recipient — please confirm above.
          </p>
        )}
        {errors.recipientEmail && <p className="text-xs text-destructive">{errors.recipientEmail.message}</p>}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</Label>
        <Input id="subject" {...register("subject")} />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="body" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</Label>
          {!isDesktop && (
            <button
              type="button"
              onClick={() => setAiSheetOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent active:opacity-70 press-scale py-1 px-2 -mr-2 rounded-full"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Edit
            </button>
          )}
        </div>
        <Textarea
          id="body"
          {...bodyRegisterRest}
          ref={(e) => {
            bodyFormRef(e);
            bodyRef.current = e;
          }}
          className="min-h-[160px]"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      </div>

      {/* Resume attachment */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm">
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">{resume?.fileName ?? "No resume selected"}</span>
        </span>
        <Badge variant="outline" className="shrink-0 text-[10px]">Attached</Badge>
      </div>

      {/* Inline AI Edit for Desktop */}
      {isDesktop && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 mt-4">
          <Label htmlFor="instruction" className="text-sm font-semibold flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">✨</span>
            AI Instructions
          </Label>
          <div className="flex gap-2">
            <Input
              id="instruction"
              placeholder='e.g., "make it more professional", "shorten it"'
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEdit();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={editing || !instruction.trim()}
              onClick={handleEdit}
              className="shrink-0"
            >
              {editing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editing ? "Applying…" : "Apply AI Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Inline Action Bar for Desktop */}
      {isDesktop && (
        <div className="flex gap-3 pt-4 border-t border-border mt-6">
          {!user?.hasGmailAccess ? (
            <Button type="button" variant="accent" size="lg" className="flex-1 gap-2" disabled={connectingGmail} onClick={() => connectGmail()}>
              {connectingGmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {connectingGmail ? "Connecting…" : "Connect Gmail to Send"}
            </Button>
          ) : (
            <Button type="submit" variant="accent" size="lg" className="flex-1 gap-2" disabled={sending || sent}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sent ? "Sent ✓" : sending ? "Sending…" : "Send email"}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" disabled={regenerating || sending || sent} onClick={handleRegenerate} className="px-6">
            {regenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      )}
    </form>
  );

  if (isDesktop) {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Review your application</h1>
            <p className="mt-1 text-sm text-muted-foreground">Make any final adjustments before sending.</p>
          </div>
          {jobChip}
          <Card>
            <CardContent className="pt-6">
              {emailForm}
            </CardContent>
          </Card>
        </motion.div>
        
        <BottomSheet open={jdSheetOpen} onOpenChange={setJdSheetOpen} title="Job Details" description="Extracted from your input.">
          <div className="space-y-4 pt-2 pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg">{extractedJob.jobTitle}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {extractedJob.company}</span>
                  {extractedJob.location && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {extractedJob.location}</span>
                  )}
                </div>
              </div>
              <Badge variant="accent" className="shrink-0">AI extracted</Badge>
            </div>
            
            <p className="text-[15px] leading-relaxed text-foreground">{extractedJob.summary}</p>
            
            {(extractedJob.keyRequirements?.length ?? 0) > 0 && (
              <ul className="flex flex-wrap gap-1.5 mt-2">
                {extractedJob.keyRequirements?.map((req) => (
                  <li key={req}><Badge variant="secondary">{req}</Badge></li>
                ))}
              </ul>
            )}
          </div>
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 overflow-y-auto scroll-momentum px-3 pt-6 pb-[80px] space-y-6"
      >
        <div className="px-1">
          <h1 className="text-2xl font-semibold tracking-tight">Review application</h1>
          <p className="mt-1 text-sm text-muted-foreground">Make final adjustments before sending.</p>
        </div>
        
        {jobChip}
        <div className="px-1 pb-6">
          {emailForm}
        </div>
      </motion.div>

      <div className="fixed left-0 right-0 z-30 border-t border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur-xl bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))]">
        <div className="flex gap-3 max-w-2xl mx-auto">
          {!user?.hasGmailAccess ? (
            <Button type="button" variant="accent" size="lg" className="flex-1 gap-2 press-scale" disabled={connectingGmail} onClick={() => connectGmail()}>
              {connectingGmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {connectingGmail ? "Connecting…" : "Connect Gmail"}
            </Button>
          ) : (
            <Button type="button" variant="accent" size="lg" className="flex-1 gap-2 press-scale" disabled={sending || sent} onClick={triggerSubmit}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sent ? "Sent ✓" : sending ? "Sending…" : "Send email"}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" disabled={regenerating || sending || sent} onClick={handleRegenerate} className="press-scale px-4">
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <BottomSheet open={aiSheetOpen} onOpenChange={setAiSheetOpen} title="AI Instructions" description="Tell the AI how to revise the email — e.g. make it shorter, more professional, mention a specific skill.">
        <div className="space-y-3">
          <Input
            placeholder='e.g., "make it more professional"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleEdit();
              }
            }}
            autoFocus
          />
          <Button variant="accent" className="w-full press-scale gap-2" disabled={editing || !instruction.trim()} onClick={handleEdit}>
            {editing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {editing ? "Applying…" : "Apply Changes"}
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={jdSheetOpen} onOpenChange={setJdSheetOpen} title="Job Details" description="Extracted from your input.">
        <div className="space-y-4 pt-2 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg">{extractedJob.jobTitle}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {extractedJob.company}</span>
                {extractedJob.location && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {extractedJob.location}</span>
                )}
              </div>
            </div>
            <Badge variant="accent" className="shrink-0">AI extracted</Badge>
          </div>
          
          <p className="text-[15px] leading-relaxed text-foreground">{extractedJob.summary}</p>
          
          {(extractedJob.keyRequirements?.length ?? 0) > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-2">
              {extractedJob.keyRequirements?.map((req) => (
                <li key={req}><Badge variant="secondary">{req}</Badge></li>
              ))}
            </ul>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
