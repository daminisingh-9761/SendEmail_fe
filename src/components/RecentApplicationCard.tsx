import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import type { RecentApplicationCardProps } from "@/types";
import { STATUS_VARIANT, STATUS_LABEL } from "@/lib/constants";

export default function RecentApplicationCard({ app }: RecentApplicationCardProps) {

  const hue = (app.job?.company || "Unknown").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <Link to={`/applications/${app.id}`}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-card p-3.5",
          "active:bg-secondary/60 active:scale-[0.99] transition-all duration-150"
        )}
      >
        {/* Company initial circle */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: `hsl(${hue}, 55%, 52%)` }}
        >
          {app.job?.company?.charAt(0).toUpperCase() || "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate leading-tight">{app.job?.jobTitle || "Unknown Job"}</p>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground">
            <span className="truncate flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {app.job?.company || "Unknown Company"}
            </span>
          </div>
        </div>

        {/* Status + time */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={STATUS_VARIANT[app.status]} className="text-[10px] px-2 py-0 h-5">
            {STATUS_LABEL[app.status]}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(app.sentAt ?? app.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
