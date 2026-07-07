import { useState } from "react";
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
import { useDraftStore } from "@/store/applicationStore";
import { useResumeStore } from "@/store/resumeStore";
import { useAuthStore } from "@/store/authStore";
import { applicationApi, authApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { Send, Paperclip, MapPin, Building2, AlertCircle, Loader2, Mail } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/store/uiStore";

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

  if (!extractedJob) return null;
  
  if (!generatedEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
        <h3 className="text-xl font-medium tracking-tight">Drafting your email...</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Our AI is reading the job requirements and highlighting your best experience from your resume.
        </p>
      </motion.div>
    );
  }

  async function onSubmit(values: FormValues) {
    setSending(true);
    try {
      // Application was already created server-side during generation;
      // here we just confirm the final, possibly edited, content and send it.
      await applicationApi.send(extractedJob!.id, values);
      setSent(true);
      toast({ title: "Email sent", description: `Your application went to ${values.recipientEmail}`, variant: "success" });
      
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
      toast({ title: "Email regenerated", description: "A new version of the email is ready.", variant: "success" });
    } catch {
      toast({ title: "Couldn't regenerate", description: "Please try again.", variant: "error" });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleEdit() {
    if (!extractedJob || !instruction.trim()) return;
    setEditing(true);
    try {
      const updatedApp = await applicationApi.edit(extractedJob.id, { instruction });
      setGeneratedEmail({ subject: updatedApp.email.subject, body: updatedApp.email.body });
      setValue("subject", updatedApp.email.subject);
      setValue("body", updatedApp.email.body);
      setInstruction("");
      toast({ title: "Email updated", description: "AI applied your changes.", variant: "success" });
    } catch {
      toast({ title: "Couldn't apply changes", description: "Please try again.", variant: "error" });
    } finally {
      setEditing(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle>{extractedJob.jobTitle}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {extractedJob.company}</span>
                {extractedJob.location && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {extractedJob.location}</span>
                )}
              </CardDescription>
            </div>
            <Badge variant="accent">AI extracted</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{extractedJob.summary}</p>
          {extractedJob.keyRequirements.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {extractedJob.keyRequirements.map((req) => (
                <li key={req}>
                  <Badge variant="secondary">{req}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review your email</CardTitle>
          <CardDescription>Edit anything before it goes out — nothing sends without your confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">To</Label>
              <Input id="recipientEmail" {...register("recipientEmail")} placeholder="hr@company.com" />
              {!extractedJob.hrEmail && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-accent">
                  <AlertCircle className="h-3.5 w-3.5" /> We couldn't find a recipient automatically — please confirm it above.
                </p>
              )}
              {errors.recipientEmail && <p className="mt-1 text-xs text-destructive">{errors.recipientEmail.message}</p>}
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register("subject")} />
              {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>}
            </div>

            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" rows={12} {...register("body")} />
              {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body.message}</p>}
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <Label htmlFor="instruction" className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">✨</span>
                AI Instructions
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
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
                >
                  {editing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editing ? "Applying…" : "Apply AI Changes"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                {resume?.fileName ?? "No resume selected"}
              </span>
              <Badge variant="outline">Attached</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!user?.hasGmailAccess ? (
                <Button type="button" variant="accent" size="lg" className="flex-1 gap-2" disabled={connectingGmail} onClick={() => connectGmail()}>
                  {connectingGmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {connectingGmail ? "Connecting…" : "Connect Gmail to Send"}
                </Button>
              ) : (
                <Button type="submit" variant="accent" size="lg" className="flex-1 gap-2" disabled={sending || sent}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sent ? "Sent" : sending ? "Sending…" : "Send email"}
                </Button>
              )}
              <Button type="button" variant="outline" size="lg" disabled={regenerating || sending || sent} onClick={handleRegenerate}>
                {regenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {regenerating ? "Regenerating…" : "Regenerate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
