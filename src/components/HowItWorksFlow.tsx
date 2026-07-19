import { motion } from "framer-motion";
import AnimatedHeroIllustration from "@/components/AnimatedHeroIllustration";

export default function HowItWorksFlow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full flex flex-col items-center mt-10 text-muted-foreground"
    >
      <AnimatedHeroIllustration />
      
      <p className="text-center text-[13px] mt-2 max-w-sm leading-relaxed text-muted-foreground/80">
        Mailjob cross-references the job post with your resume to write the perfect cold email in seconds.
      </p>
    </motion.div>
  );
}
