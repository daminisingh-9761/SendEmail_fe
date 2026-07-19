import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { applicationApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Building2, MapPin, Inbox } from "lucide-react";
import type { Application } from "@/types";
import { STATUS_VARIANT, STATUS_LABEL } from "@/lib/constants";

export default function HistoryPage() {
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
