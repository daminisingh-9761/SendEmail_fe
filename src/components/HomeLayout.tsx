import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useDraftStore } from "@/store/applicationStore";
import JobInputCard from "@/components/JobInputCard";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import { HOME_CONSTANTS } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export default function HomeLayout() {
  const { user } = useAuthStore();
  const { chatMessages } = useDraftStore();
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
            isDesktop ? "w-full max-w-2xl" : "flex-1 pt-8 pb-12",
            !isDesktop && chatMessages.length === 0 ? "justify-center" : "justify-start"
          )}
        >
          {chatMessages.length === 0 && (
            <div className={cn("text-center", isDesktop ? "mb-8" : "mb-6")}>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Hey{user ? `, ${user.name?.split(" ")[0] || ""}` : ""} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">{HOME_CONSTANTS.HERO_HEADING}</p>
            </div>
          )}

          {chatMessages.length > 0 && (
            <div className="w-full flex flex-col gap-4 mb-8">
              {chatMessages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={cn(
                    "p-4 rounded-2xl max-w-[85%] text-left",
                    msg.role === "user"
                      ? "bg-[#e65c00] self-end ml-auto text-white font-medium shadow-sm"
                      : "bg-muted self-start mr-auto text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
            </div>
          )}

          {isDesktop && (
            <div className="w-full mt-auto">
              <JobInputCard />
            </div>
          )}

          {chatMessages.length === 0 && <HowItWorksFlow />}
        </motion.div>
      </div>

      {!isDesktop && <JobInputCard />}
    </motion.div>
  );
}
