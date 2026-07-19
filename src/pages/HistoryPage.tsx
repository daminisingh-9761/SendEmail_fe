import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { applicationApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Building2, MapPin, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Application } from "@/types";
import { STATUS_VARIANT, STATUS_LABEL } from "@/lib/constants";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: applicationApi.list,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Application history</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track every email you've sent, and pick up follow-ups.</p>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {applications?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent/10">
              <MailOpen className="h-6 w-6 text-accent" />
            </div>
            <h2 className="mt-5 text-[17px] font-semibold text-foreground tracking-tight">No applications yet.</h2>
            <p className="mt-2 text-[15px] text-muted-foreground max-w-xs leading-relaxed">
              Every email you send will show up here, so you can track replies and follow-ups.
            </p>
            <Button onClick={() => navigate("/")} className="mt-8 rounded-full px-6 shadow-sm press-scale">
              Start an application
            </Button>
          </div>
        )}

        {applications?.map((app) => (
          <Link key={app.id} to={`/applications/${app.id}`}>
            <Card className="transition-all duration-150 active:bg-secondary/60 active:scale-[0.99]">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[15px]">{app.job.jobTitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {app.job.company}</span>
                    {app.job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.job.location}</span>}
                    <span>{formatDate(app.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[app.status]} className="self-start sm:self-auto">{STATUS_LABEL[app.status]}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
