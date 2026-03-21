"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";
import UploadBox from "@/components/UploadBox";

// Trust signals displayed below the upload box
const TRUST_HINTS = [
  { icon: Zap, text: "Processed in < 5 seconds" },
  { icon: Shield, text: "No data stored" },
  { icon: Lock, text: "Fully private" },
] as const;

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-100/20 dark:bg-indigo-900/10 rounded-full blur-[60px] sm:blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Upload Your Photo
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto font-medium leading-relaxed px-2 sm:px-0">
            Our AI removes the background in HD and prepares your image for passport printing.
          </p>
        </motion.div>

        {/* Upload box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <UploadBox />
        </motion.div>

        {/* Trust hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {TRUST_HINTS.map((hint) => {
            const Icon = hint.icon;
            return (
              <span
                key={hint.text}
                className="flex items-center gap-2 text-sm font-medium text-neutral-400 dark:text-neutral-500"
              >
                <Icon className="w-4 h-4" />
                {hint.text}
              </span>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}
