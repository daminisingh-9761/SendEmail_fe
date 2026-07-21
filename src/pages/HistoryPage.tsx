import { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { applicationApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { Building2, MapPin, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginatedApplications } from "@/types";
import { STATUS_VARIANT, STATUS_LABEL, HISTORY_FILTERS } from "@/lib/constants";
import { toast } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { ResponsiveModal } from "@/components/ui/responsive-modal";


export default function HistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const limit = 10;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<PaginatedApplications>({
    queryKey: ["applications", limit, statusFilter],
    queryFn: ({ pageParam }) => applicationApi.list({ page: pageParam as number, limit, status: statusFilter || undefined }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => lastPage.pages > allPages.length ? allPages.length + 1 : undefined,
  });

  const items = data?.pages.flatMap(page => page.items) || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      await applicationApi.bulkDelete(selectedIds);
      toast({ title: "Applications deleted successfully", variant: "success" });
      setSelectedIds([]);
      // Reset infinite query back to page 1
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    } catch {
      toast({ title: "Failed to delete applications", variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = items.length > 0 ? selectedIds.length === items.length : false;

  return (
    <div className="w-full mx-auto max-w-3xl px-5 py-6 sm:py-10 flex flex-col min-h-full pb-24 lg:pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Application history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track every email you've sent.</p>
      </div>

      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {HISTORY_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "accent" : "secondary"}
            size="sm"
            onClick={() => { setStatusFilter(filter.value); setSelectedIds([]); }}
            className={cn(
              "rounded-full shrink-0 transition-colors",
              statusFilter === filter.value ? "shadow-sm" : "bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-3 flex-1">
        {isLoading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {items.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent/10">
              <MailOpen className="h-6 w-6 text-accent" />
            </div>
            <h2 className="mt-5 text-[17px] font-semibold text-foreground tracking-tight">No applications found.</h2>
            <p className="mt-2 text-[15px] text-muted-foreground max-w-xs leading-relaxed">
              {statusFilter ? "No applications match this filter." : "Every email you send will show up here."}
            </p>
            {!statusFilter && (
              <Button onClick={() => navigate("/")} className="mt-8 rounded-full px-6 shadow-sm press-scale">
                Start an application
              </Button>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-3 flex items-center px-4">
            <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 cursor-pointer transition-colors"
                checked={allSelected}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>
        )}

        {items.map((app) => {
          const isSelected = selectedIds.includes(app.id);
          return (
            <Card
              key={app.id}
              className={cn(
                "flex flex-row items-stretch overflow-hidden group transition-all duration-150",
                isSelected ? "border-accent bg-accent/5 shadow-sm" : "hover:border-accent/40 active:bg-secondary/60 active:scale-[0.99]"
              )}
            >
              <div
                className="flex items-center pl-4 pr-1 cursor-pointer transition-colors"
                onClick={() => handleSelect(app.id, !isSelected)}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 cursor-pointer"
                  checked={isSelected}
                  readOnly
                />
              </div>
              <Link to={`/applications/${app.id}`} className="flex-1 min-w-0 py-4 pr-4 sm:py-5 sm:pr-5 pl-2 block focus:outline-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[15px] leading-tight">{app.job.jobTitle}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {app.job.company}</span>
                      {app.job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.job.location}</span>}
                      <span>{formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[app.status]} className="self-start sm:self-auto shrink-0 shadow-sm">{STATUS_LABEL[app.status]}</Badge>
                </div>
              </Link>
            </Card>
          );
        })}

        {isFetchingNextPage && (
          <div className="space-y-3 pt-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
      </div>

      {hasNextPage && (
        <div className="mt-10 flex justify-center pt-5 border-t border-border">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full px-8 shadow-sm bg-secondary/60 hover:bg-secondary"
          >
            {isFetchingNextPage ? "Loading more..." : "Load more"}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+20px)] lg:bottom-12 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 bg-foreground text-background pl-5 pr-2 py-2 rounded-full shadow-2xl border border-border/10">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <div className="w-px h-5 bg-background/20 mx-1" />
              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isDeleting}
                className="flex items-center text-sm font-medium text-white bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/40 shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResponsiveModal 
        open={isConfirmOpen} 
        onOpenChange={setIsConfirmOpen}
        title="Delete Applications"
        description={`Are you sure you want to delete ${selectedIds.length} application(s)? This action cannot be undone.`}
      >
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="secondary" onClick={() => setIsConfirmOpen(false)} className="rounded-full px-6">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-full px-6">
            Delete
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
