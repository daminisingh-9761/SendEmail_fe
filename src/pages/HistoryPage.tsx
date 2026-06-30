import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applicationApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Building2, MapPin, Inbox } from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";

const statusVariant: Record<ApplicationStatus, "secondary" | "success" | "destructive" | "accent"> = {
  draft: "secondary",
  sent: "success",
  follow_up_sent: "accent",
  failed: "destructive",
};

const statusLabel: Record<ApplicationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  follow_up_sent: "Follow-up sent",
  failed: "Failed",
};

export default function HistoryPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: applicationApi.list,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Application history</h1>
      <p className="mt-1 text-muted-foreground">Track every email you've sent, and pick up follow-ups.</p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {applications?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <Inbox className="h-6 w-6 text-muted-foreground" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm text-muted-foreground">Generate your first one from the home page.</p>
            </CardContent>
          </Card>
        )}

        {applications?.map((app) => (
          <Link key={app.id} to={`/applications/${app.id}`}>
            <Card className="transition-colors hover:bg-secondary/40">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{app.job.jobTitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {app.job.company}</span>
                    {app.job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.job.location}</span>}
                    <span>{formatDate(app.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={statusVariant[app.status]}>{statusLabel[app.status]}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
