"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, AlertCircle, ImageIcon, Sparkles, Shield, Zap } from "lucide-react";

// Cycling processing status messages displayed during AI background removal
const PROCESSING_STEPS = [
  { text: "Analyzing image...", icon: ImageIcon },
  { text: "Detecting subject edges...", icon: Sparkles },
  { text: "Removing background in HD...", icon: Zap },
  { text: "Polishing final output...", icon: Shield },
] as const;

export default function UploadBox() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through processing messages during upload
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG/PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    // Generate local preview thumbnail
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    setProcessingStep(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process image");
      }

      sessionStorage.setItem("processedImage", data.image);
      router.push("/preview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const currentStep = PROCESSING_STEPS[processingStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative">
        {/* Drop zone (hidden when loading) */}
        <AnimatePresence mode="wait">
          {!loading ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-2xl sm:rounded-[2rem] p-8 sm:p-14 md:p-16 text-center cursor-pointer transition-all duration-300 ease-in-out border-2 border-dashed ${
                isDragOver
                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 shadow-[inset_0_2px_20px_rgba(59,130,246,0.08)] scale-[1.01]"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/80"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
                <div
                  className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                    isDragOver
                      ? "bg-blue-100 dark:bg-blue-900/40 scale-110"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                      isDragOver
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                    {isDragOver ? "Drop to upload" : "Click or drag your photo here"}
                  </h3>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Supports JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ─── Processing Animation Overlay ─── */
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-14 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-lg overflow-hidden"
            >
              {/* Animated gradient background glow */}
              <div className="absolute inset-0 -z-10">
                <motion.div
                  className="absolute top-1/2 left-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-blue-200/40 dark:bg-blue-800/20 blur-[60px] sm:blur-[80px]"
                  animate={{
                    x: ["-50%", "-30%", "-50%", "-70%", "-50%"],
                    y: ["-50%", "-30%", "-50%", "-70%", "-50%"],
                    scale: [1, 1.2, 1, 0.9, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 w-[160px] sm:w-[250px] h-[160px] sm:h-[250px] rounded-full bg-indigo-200/30 dark:bg-indigo-800/15 blur-[50px] sm:blur-[70px]"
                  animate={{
                    x: ["-50%", "-70%", "-50%", "-30%", "-50%"],
                    y: ["-50%", "-70%", "-50%", "-30%", "-50%"],
                    scale: [1, 0.9, 1, 1.15, 1],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                {/* Photo thumbnail with pulsing ring */}
                <div className="relative">
                  {/* Outer spinning ring */}
                  <motion.div
                    className="absolute -inset-3 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Middle pulsing ring */}
                  <motion.div
                    className="absolute -inset-6 rounded-full border border-blue-200/50 dark:border-blue-700/30"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Photo preview circle */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-4 ring-white dark:ring-neutral-900 shadow-xl relative">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Uploaded photo preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated step message */}
                <div className="text-center space-y-3 min-h-[72px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={processingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                        <StepIcon className="w-5 h-5" />
                        <span className="text-base font-semibold">
                          {currentStep.text}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2">
                    {PROCESSING_STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= processingStep
                            ? "bg-blue-500 w-6"
                            : "bg-neutral-200 dark:bg-neutral-700 w-1.5"
                        }`}
                        layout
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  This usually takes a few seconds
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-6 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
