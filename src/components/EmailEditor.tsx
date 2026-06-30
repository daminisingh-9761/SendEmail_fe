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
import { applicationApi } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { Send, Paperclip, MapPin, Building2, AlertCircle, Loader2 } from "lucide-react";

const schema = z.object({
  recipientEmail: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  body: z.string().min(20, "Email body looks too short"),
});
type FormValues = z.infer<typeof schema>;

export default function EmailEditor() {
  const { extractedJob, generatedEmail, recipientEmail, reset } = useDraftStore();
  const { resumes, selectedResumeId } = useResumeStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resume = resumes.find((r) => r.id === selectedResumeId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      recipientEmail: recipientEmail,
      subject: generatedEmail?.subject ?? "",
      body: generatedEmail?.body ?? "",
    },
  });

  if (!extractedJob || !generatedEmail) return null;

  async function onSubmit(values: FormValues) {
    setSending(true);
    try {
      // Application was already created server-side during generation;
      // here we just confirm the final, possibly edited, content and send it.
      await applicationApi.send(extractedJob!.id, values);
      setSent(true);
      toast({ title: "Email sent", description: `Your application went to ${values.recipientEmail}`, variant: "success" });
    } catch {
      toast({ title: "Couldn't send the email", description: "Please try again.", variant: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
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

            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                {resume?.fileName ?? "No resume selected"}
              </span>
              <Badge variant="outline">Attached</Badge>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="accent" size="lg" className="flex-1 gap-2" disabled={sending || sent}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sent ? "Sent" : sending ? "Sending…" : "Send email"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={reset}>
                Start over
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
