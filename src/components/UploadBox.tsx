"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  AlertCircle,
  ImageIcon,
  Sparkles,
  Shield,
  Zap,
  Camera,
  X,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveProcessedImage } from "@/lib/storage/imageStore";
import BiometricCropperModal from "@/components/BiometricCropperModal";

// Cycling processing status messages displayed during AI background removal
const PROCESSING_STEPS = [
  { text: "Analyzing portrait contours...", icon: ImageIcon },
  { text: "Detecting facial boundaries & hair...", icon: Sparkles },
  { text: "Removing background in HD...", icon: Zap },
  { text: "Polishing high-resolution edges...", icon: Shield },
] as const;

export default function UploadBox() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  // Biometric Cropper Modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [fallbackCroppedImage, setFallbackCroppedImage] = useState<string | null>(null);

  // Camera capture state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Initial file receipt: open biometric cropper first
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG/PNG/WEBP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit. Please choose a smaller photo.");
      return;
    }

    setError("");
    setFallbackCroppedImage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // Support clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (loading || cameraActive || cropperOpen) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          handleFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loading, cameraActive, cropperOpen, handleFile]);

  // Handle drag and drop
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // ── Camera capture handlers ──
  const startCamera = async () => {
    setCameraError("");
    setError("");
    setFallbackCroppedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied or unavailable. Please upload a file instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setRawImageSrc(dataUrl);
    setCropperOpen(true);
  };

  // ── Handler when user confirms crop in modal ──
  const handleCropperConfirm = async (
    croppedBase64: string,
    shouldRemoveBg: boolean
  ) => {
    setCropperOpen(false);
    setPreview(croppedBase64);
    setFallbackCroppedImage(null);

    // If user opts to skip AI background removal, save immediately and proceed
    if (!shouldRemoveBg) {
      setLoading(true);
      try {
        await saveProcessedImage(croppedBase64);
        router.push("/preview");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to store image";
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise, perform AI background removal
    setLoading(true);
    setProcessingStep(0);
    setError("");

    try {
      // Convert cropped dataURL to Blob
      const resBlob = await fetch(croppedBase64);
      const blob = await resBlob.blob();
      const file = new File([blob], "cropped-portrait.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove background");
      }

      await saveProcessedImage(data.image);
      router.push("/preview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      // Retain the cropped image so the user can continue directly without AI background removal
      setFallbackCroppedImage(croppedBase64);
    } finally {
      setLoading(false);
    }
  };

  // Fallback proceed: continue with the cropped photo when background removal fails
  const handleProceedWithCropped = async () => {
    if (!fallbackCroppedImage) return;
    setLoading(true);
    try {
      await saveProcessedImage(fallbackCroppedImage);
      router.push("/preview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to store image";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = PROCESSING_STEPS[processingStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Biometric Cropping Modal */}
      {rawImageSrc && (
        <BiometricCropperModal
          isOpen={cropperOpen}
          imageSrc={rawImageSrc}
          onCancel={() => setCropperOpen(false)}
          onConfirm={handleCropperConfirm}
        />
      )}

      <div className="relative">
        <AnimatePresence mode="wait">
          {/* ── State 1: Active Camera Viewfinder ── */}
          {cameraActive ? (
            <motion.div
              key="camera-viewfinder"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-neutral-900 border border-neutral-700 shadow-2xl p-4 sm:p-6"
            >
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                  onLoadedMetadata={(e) => (e.target as HTMLVideoElement).play()}
                />

                {/* Biometric Face Oval Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[50%] h-[70%] rounded-full border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] relative">
                    <div className="absolute top-[35%] left-0 right-0 h-px border-t border-white/30" />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Align face here
                    </span>
                  </div>
                </div>

                {/* Cancel Camera button */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Actions */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="h-11 px-5 rounded-xl border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </motion.div>
          ) : !loading ? (
            /* ── State 2: Drag & Drop Zone ── */
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-2xl sm:rounded-[2rem] p-8 sm:p-12 text-center transition-all duration-300 ease-in-out border-2 border-dashed ${
                isDragOver
                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 shadow-[inset_0_2px_20px_rgba(59,130,246,0.08)] scale-[1.01]"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/80"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer ${
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
                  <h3
                    onClick={() => fileInputRef.current?.click()}
                    className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {isDragOver ? "Drop to upload" : "Click or drag your photo here"}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Supports JPG, PNG, WEBP (or press Ctrl+V to paste)
                  </p>
                </div>

                {/* Secondary Option: Take Photo with Webcam */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 px-5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800"
                  >
                    Browse Files
                  </Button>
                  <span className="text-xs text-neutral-400 font-medium">or</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startCamera}
                    className="h-10 px-5 rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    <Camera className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                    Take Selfie with Camera
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── State 3: Processing Animation Overlay ── */
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
              </div>

              <div className="flex flex-col items-center space-y-6 sm:space-y-8">
                {/* Photo thumbnail with pulsing ring */}
                <div className="relative">
                  <motion.div
                    className="absolute -inset-3 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-300"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
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
                  Processing high-precision portrait in HD
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Error Message */}
      <AnimatePresence>
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 p-3.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between"
          >
            <span>{cameraError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={startCamera}
              className="h-7 px-2 text-xs text-amber-800 dark:text-amber-300"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message with Smart Fallback to continue directly */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-6 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>

            {fallbackCroppedImage && (
              <div className="pt-2 border-t border-red-100 dark:border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-neutral-600 dark:text-neutral-300">
                  Your photo is already aligned & cropped. You can continue directly to print sheets without AI background removal.
                </span>
                <Button
                  onClick={handleProceedWithCropped}
                  className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 shrink-0"
                >
                  Continue with Cropped Photo
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
