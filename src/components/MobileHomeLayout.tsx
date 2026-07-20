import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import JobInputCard from "@/components/JobInputCard";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import { HOME_CONSTANTS } from "@/lib/constants";
import { HomeLayoutProps } from "@/types";

export default function MobileHomeLayout({
  isReturningUser,
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


      </div>

      <JobInputCard />
    </motion.div>
  );
}
