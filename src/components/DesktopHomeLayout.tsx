import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import JobInputCard from "@/components/JobInputCard";
import HowItWorksFlow from "@/components/HowItWorksFlow";
import { HOME_CONSTANTS } from "@/lib/constants";
import { HomeLayoutProps } from "@/types";

export default function DesktopHomeLayout({ isReturningUser }: HomeLayoutProps) {
  const { user } = useAuthStore();
  return (
    <motion.div key="input" exit={{ opacity: 0 }} className="flex flex-col flex-1 w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto w-full px-8 pb-12">
        {!isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full max-w-2xl"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-center mb-8 text-foreground">
              {HOME_CONSTANTS.HERO_HEADING}
            </h1>

            <div className="w-full">
              <JobInputCard />
            </div>

            <HowItWorksFlow />
          </motion.div>
        )}

        {isReturningUser && (
          <div className="flex flex-col items-center w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pb-8 text-center"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Hey, {user?.name.split(" ")[0]} 👋
              </h1>
            </motion.div>
            
            <div className="w-full">
              <JobInputCard />
            </div>


          </div>
        )}
      </div>
    </motion.div>
  );
}
