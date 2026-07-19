import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import EmailEditor from "@/components/EmailEditor";
import { useDraftStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { applicationApi } from "@/lib/api";
import type { Application, HomeLayoutProps } from "@/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import MobileHomeLayout from "@/components/MobileHomeLayout";
import DesktopHomeLayout from "@/components/DesktopHomeLayout";

export default function HomePage() {
  const { extractedJob } = useDraftStore();
  const { user } = useAuthStore();
  const { sessionKey } = useUiStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const hasOnboarded = typeof window !== "undefined" && localStorage.getItem("mailjob_onboarded") === "true";
  const isReturningUser = !!user && hasOnboarded;

  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: applicationApi.list,
    enabled: isReturningUser,
  });

  const recentApps = applications?.slice(0, 5) ?? [];
  const sentThisWeek = applications?.filter((a) => {
    if (!a.sentAt) return false;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return new Date(a.sentAt).getTime() > oneWeekAgo;
  }).length ?? 0;

  const layoutProps: HomeLayoutProps = {
    isReturningUser,
    applications,
    appsLoading,
    sentThisWeek,
    recentApps,
  };

  return (
    <div key={sessionKey} className="flex flex-col flex-1 w-full">
      <AnimatePresence mode="wait">
        {!extractedJob ? (
          isDesktop ? <DesktopHomeLayout {...layoutProps} /> : <MobileHomeLayout {...layoutProps} />
        ) : (
          <motion.div key="editor" className={cn(isDesktop ? "max-w-3xl mx-auto w-full pt-10 px-6 pb-20" : "px-5 py-6")}>
            <EmailEditor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
