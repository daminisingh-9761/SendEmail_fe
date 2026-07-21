import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import JobInputCard from "@/components/JobInputCard";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import { HOME_CONSTANTS } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export default function HomeLayout() {
  const { user } = useAuthStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <motion.div key="input" exit={{ opacity: 0 }} className="flex flex-col flex-1 w-full bg-background overflow-hidden">
      <div
        className={cn(
          "flex-1 flex flex-col",
          isDesktop ? "justify-center items-center max-w-3xl mx-auto w-full px-8 pb-12" : "overflow-y-auto scroll-momentum px-5"
        )}
        style={!isDesktop ? { paddingBottom: HOME_CONSTANTS.COMPOSER_CLEARANCE } : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "flex flex-col items-center",
            isDesktop ? "w-full max-w-2xl" : "flex-1 justify-center pt-8 pb-12"
          )}
        >
          <div className={cn("text-center", isDesktop ? "mb-8" : "mb-6")}>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Hey{user ? `, ${user.name?.split(" ")[0] || ""}` : ""} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">{HOME_CONSTANTS.HERO_HEADING}</p>
          </div>

          {isDesktop && (
            <div className="w-full">
              <JobInputCard />
            </div>
          )}

          <HowItWorksFlow />
        </motion.div>
      </div>

      {!isDesktop && <JobInputCard />}
    </motion.div>
  );
}
