import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/70",
        "bg-gradient-to-r from-muted/70 via-muted/40 to-muted/70",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonEmailDraft() {
  return (
    <div className="space-y-4">
      {/* Subject line */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      {/* To field */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      {/* Body */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1 rounded-md" />
        <Skeleton className="h-12 w-32 rounded-md" />
      </div>
    </div>
  );
}
