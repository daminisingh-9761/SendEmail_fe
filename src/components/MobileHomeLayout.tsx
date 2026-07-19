import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Send, Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import JobInputCard from "@/components/JobInputCard";
import RecentApplicationCard from "@/components/RecentApplicationCard";
import { SkeletonCard } from "@/components/ui/skeleton";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import { HOME_CONSTANTS } from "@/lib/constants";
import { HomeLayoutProps } from "@/types";

export default function MobileHomeLayout({
  isReturningUser,
  applications,
  appsLoading,
  sentThisWeek,
  recentApps,
}: HomeLayoutProps) {
  const { user } = useAuthStore();
  return (
    <motion.div key="input" exit={{ opacity: 0 }} className="flex flex-col flex-1">
      <div
        className="flex-1 overflow-y-auto scroll-momentum px-5 flex flex-col"
        style={{ paddingBottom: HOME_CONSTANTS.COMPOSER_CLEARANCE }}
      >
        {!isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center pt-8 pb-12"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6 shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center mb-6">
              {HOME_CONSTANTS.HERO_HEADING}
            </h1>

            <HowItWorksFlow />
          </motion.div>
        )}

        {isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-6 pb-4"
          >
            <h2 className="text-xl font-semibold tracking-tight">Hey, {user?.name.split(" ")[0]} 👋</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Ready to apply somewhere new?</p>
          </motion.div>
        )}

        {isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="space-y-4"
          >
            {(sentThisWeek > 0 || (applications && applications.length > 0)) && (
              <div className="flex items-center gap-3 rounded-xl bg-accent/8 border border-accent/15 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Send className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {sentThisWeek > 0
                      ? `${sentThisWeek} sent this week`
                      : `${applications?.length ?? 0} total applications`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Keep the momentum going</p>
                </div>
              </div>
            )}

            {appsLoading ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : recentApps.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent</h3>
                  <Link to="/history" className="flex items-center gap-0.5 text-xs font-medium text-accent active:opacity-70">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {recentApps.map((app: any) => (
                  <RecentApplicationCard key={app.id} app={app} />
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </div>

      <JobInputCard />
    </motion.div>
  );
}
