import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import EmailEditor from "@/components/EmailEditor";
import { useDraftStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import type { HomeLayoutProps } from "@/types";
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

  const layoutProps: HomeLayoutProps = {
    isReturningUser,
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
