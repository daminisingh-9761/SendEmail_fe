import { motion, AnimatePresence } from "framer-motion";
import EmailEditor from "@/components/EmailEditor";
import { useDraftStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import HomeLayout from "@/components/HomeLayout";

export default function HomePage() {
  const { extractedJob } = useDraftStore();
  const { user } = useAuthStore();
  const { sessionKey } = useUiStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const isReturningUser = !!user;



  return (
    <div key={sessionKey} className="flex flex-col flex-1 w-full">
      <AnimatePresence mode="wait">
        {!extractedJob ? (
          <HomeLayout />
        ) : (
          <motion.div key="editor" className={cn(isDesktop ? "max-w-3xl mx-auto w-full pt-10 px-6 pb-20" : "px-5 py-6")}>
            <EmailEditor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
