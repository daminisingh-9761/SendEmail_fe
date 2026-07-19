import { motion } from "framer-motion";

import { HERO_ANIMATION } from "@/lib/constants";

export default function AnimatedHeroIllustration() {
  const { DURATION, COLORS } = HERO_ANIMATION;
  const { navy, coral } = COLORS;

  const docLVariants = {
    animate: {
      x: [-60, 0, 0, 0, 0, -60],
      opacity: [0, 1, 0, 0, 0, 0],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [0, 0.15, 0.2, 0.85, 0.95, 1],
        ease: "easeInOut",
      },
    },
  };

  const docRVariants = {
    animate: {
      x: [60, 0, 0, 0, 0, 60],
      opacity: [0, 1, 0, 0, 0, 0],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [0, 0.15, 0.2, 0.85, 0.95, 1],
        ease: "easeInOut",
      },
    },
  };

  const docCenterVariants = {
    animate: {
      opacity: [0, 0, 1, 1, 0, 0],
      scale: [0.9, 0.9, 1.1, 1, 1, 0.9],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [0, 0.15, 0.2, 0.55, 0.65, 1],
        ease: "easeInOut",
      },
    },
  };

  const lineVariants = (delayOffset: number) => ({
    animate: {
      pathLength: [0, 0, 1, 1, 0, 0],
      opacity: [0, 0, 1, 1, 0, 0],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [
          0,
          0.25 + delayOffset,
          0.35 + delayOffset,
          0.55,
          0.6,
          1,
        ],
        ease: "easeInOut",
      },
    },
  });

  const envelopeVariants = {
    animate: {
      opacity: [0, 0, 0, 1, 1, 0, 0],
      scale: [1, 1, 1, 1.05, 1, 0.5, 1],
      x: [0, 0, 0, 0, 0, 120, 0],
      y: [0, 0, 0, 0, 0, -120, 0],
      rotate: [0, 0, 0, 0, 0, 15, 0],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [0, 0.55, 0.6, 0.65, 0.7, 0.85, 1],
        ease: "easeInOut",
      },
    },
  };

  const sparkleVariants = {
    animate: {
      opacity: [0, 0, 1, 0.5, 1, 0, 0],
      scale: [0.5, 0.5, 1, 0.8, 1, 0.5, 0.5],
      rotate: [0, 0, 45, 90, 135, 180, 0],
      transition: {
        duration: DURATION,
        repeat: Infinity,
        times: [0, 0.2, 0.25, 0.4, 0.55, 0.6, 1],
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="w-full flex justify-center items-center py-6">
      <svg
        width="300"
        height="140"
        viewBox="0 0 300 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >

        <motion.g variants={docLVariants} animate="animate">
          <rect
            x="95"
            y="40"
            width="36"
            height="50"
            rx="4"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M103 52H123M103 60H123M103 68H115"
            stroke={navy}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.g>


        <motion.g variants={docRVariants} animate="animate">
          <rect
            x="169"
            y="40"
            width="36"
            height="50"
            rx="4"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M177 52H189M177 60H197M177 68H197"
            stroke={navy}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.g>


        <motion.g variants={docCenterVariants} animate="animate">
          <rect
            x="126"
            y="35"
            width="48"
            height="64"
            rx="6"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#F5F1E8"
          />

          <motion.path
            d="M136 50H164"
            stroke={coral}
            strokeWidth="2"
            strokeLinecap="round"
            variants={lineVariants(0)}
            animate="animate"
          />
          <motion.path
            d="M136 58H164"
            stroke={coral}
            strokeWidth="2"
            strokeLinecap="round"
            variants={lineVariants(0.05)}
            animate="animate"
          />
          <motion.path
            d="M136 66H152"
            stroke={coral}
            strokeWidth="2"
            strokeLinecap="round"
            variants={lineVariants(0.1)}
            animate="animate"
          />
        </motion.g>


        <motion.g
          variants={sparkleVariants}
          animate="animate"
          style={{ originX: "180px", originY: "30px" }}
        >
          <path
            d="M180 20C180 25.5 184.5 30 190 30C184.5 30 180 34.5 180 40C180 34.5 175.5 30 170 30C175.5 30 180 25.5 180 20Z"
            fill={coral}
          />
        </motion.g>


        <motion.g variants={envelopeVariants} animate="animate">
          <path
            d="M126 51L150 67L174 51M126 41C126 37.6863 128.686 35 132 35H168C171.314 35 174 37.6863 174 41V83C174 86.3137 171.314 89 168 89H132C128.686 89 126 86.3137 126 83V41Z"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#F5F1E8"
          />

          <path
            d="M110 95L120 85M115 105L128 92"
            stroke={coral}
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-60"
          />
        </motion.g>
      </svg>
    </div>
  );
}
