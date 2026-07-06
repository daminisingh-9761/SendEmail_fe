import { motion, AnimatePresence } from "framer-motion";
import JobInputCard from "@/components/JobInputCard";
import EmailEditor from "@/components/EmailEditor";
import { useDraftStore } from "@/store/applicationStore";
import { useUiStore } from "@/store/uiStore";

export default function HomePage() {
  const { extractedJob } = useDraftStore();
  const { sessionKey } = useUiStore();

  return (
    <div key={sessionKey} className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn any job post into a sent application.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Drop in a description, a screenshot, or a link. We'll find who to email
          and write the note — you just hit send.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!extractedJob ? (
          <motion.div key="input" exit={{ opacity: 0 }}>
            <JobInputCard />
          </motion.div>
        ) : (
          <motion.div key="editor">
            <EmailEditor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
