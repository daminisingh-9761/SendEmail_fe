import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applicationApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { RefreshCcw, Sparkles, Send } from "lucide-react";
import type { Application } from "@/types";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: app, isLoading } = useQuery<Application>({
    queryKey: ["applications", id],
    queryFn: () => applicationApi.get(id!),
    enabled: !!id,
  });

  const resend = useMutation({
    mutationFn: () => applicationApi.resend(id!),
    onSuccess: () => {
      toast({ title: "Email resent", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
    },
  });

  const followUp = useMutation({
    mutationFn: () => applicationApi.followUp(id!),
    onSuccess: () => {
      toast({ title: "Follow-up drafted and sent", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["applications", id] });
    },
  });

  if (isLoading || !app) return <div className="mx-auto max-w-2xl px-6 py-12 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{app.job.jobTitle}</h1>
        <p className="mt-1 text-muted-foreground">{app.job.company} · Sent {app.sentAt ? formatDate(app.sentAt) : "—"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email sent</CardTitle>
          <CardDescription>To {app.recipientEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{app.email.subject}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{app.email.body}</p>
        </CardContent>
      </Card>

      {app.aiSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-accent" /> AI suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {app.aiSuggestions.map((s) => (
              <p key={s} className="text-sm text-muted-foreground">• {s}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {app.followUps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {app.followUps.map((f) => (
              <div key={f.id} className="border-l-2 border-accent/40 pl-3">
                <p className="text-xs text-muted-foreground">{formatDate(f.sentAt)}</p>
                <p className="mt-1 text-sm">{f.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2" onClick={() => resend.mutate()} disabled={resend.isPending}>
          <RefreshCcw className="h-4 w-4" /> Resend
        </Button>
        <Button variant="accent" className="gap-2" onClick={() => followUp.mutate()} disabled={followUp.isPending}>
          <Send className="h-4 w-4" /> Generate follow-up
        </Button>
        <Badge variant="success" className="sm:ml-auto self-start sm:self-center">{app.status}</Badge>
      </div>
    </div>
  );
}
