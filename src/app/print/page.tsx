"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Maximize,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import PreviewCanvas from "@/components/PreviewCanvas";

// Default configuration values
const DEFAULTS = {
  quantity: 8,
  photoWidthMm: 35,
  gapMm: 4,
  marginMm: 5,
} as const;

export default function PrintSheetPage() {
  // Source image
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Layout parameters
  const [quantity, setQuantity] = useState<number>(DEFAULTS.quantity);
  const [photoWidthMm, setPhotoWidthMm] = useState<number>(DEFAULTS.photoWidthMm);
  const [gapMm, setGapMm] = useState<number>(DEFAULTS.gapMm);
  const [marginMm, setMarginMm] = useState<number>(DEFAULTS.marginMm);

  // Computed height (35:45 passport ratio)
  const photoHeightMm = Math.round(photoWidthMm * (45 / 35));

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloading, setDownloading] = useState<"none" | "pdf" | "png">("none");
  const [error, setError] = useState("");

  // Real-time grid metrics from PreviewCanvas
  const [layoutInfo, setLayoutInfo] = useState({
    maxFit: 0,
    actualCount: 0,
    cols: 0,
    rows: 0,
  });

  // Load image on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("processedImage");
    if (stored) setImageBase64(stored);
  }, []);

  // Auto-clamp quantity when maxFit shrinks below current value
  // (e.g. user increases photo size or margin so fewer photos fit)
  useEffect(() => {
    if (layoutInfo.maxFit > 0 && quantity > layoutInfo.maxFit) {
      setQuantity(layoutInfo.maxFit);
    }
  }, [layoutInfo.maxFit, quantity]);

  const handleReset = () => {
    setQuantity(DEFAULTS.quantity);
    setPhotoWidthMm(DEFAULTS.photoWidthMm);
    setGapMm(DEFAULTS.gapMm);
    setMarginMm(DEFAULTS.marginMm);
  };

  // Generate precise server-rendered layout on download intent
  const fetchPreciseLayout = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          quantity,
          photoWidthMm,
          photoHeightMm,
          gapMm,
          marginMm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to generate layout");
      return data.layoutBase64 as string;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Export handlers
  const handleExportPNG = async () => {
    setDownloading("png");
    const output = await fetchPreciseLayout();
    if (output) {
      const a = document.createElement("a");
      a.href = output;
      a.download = "PhotoForge_A4_Layout.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setDownloading("none");
  };

  const handleExportPDF = async () => {
    setDownloading("pdf");
    setError("");
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          quantity,
          photoWidthMm,
          photoHeightMm,
          gapMm,
          marginMm,
          isA4: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to convert layout into PDF.");
      const a = document.createElement("a");
      a.href = data.pdfBase64;
      a.download = "PhotoForge_A4_Layout.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to convert layout into PDF.";
      setError(msg);
    } finally {
      setDownloading("none");
    }
  };

  const exportDisabled = isGenerating || downloading !== "none";

  // ── Empty state ──
  if (!imageBase64) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              No image found
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Upload a photo first to configure your print sheet.
            </p>
          </div>
          <Link href="/upload">
            <Button className="h-11 px-6 rounded-xl text-sm font-semibold">
              Go to Upload
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/preview">
              <Button
                variant="ghost"
                className="mb-2 sm:mb-4 h-9 sm:h-10 px-3 sm:px-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Preview
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Print Sheet{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Configuration
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-xl">
              Fine-tune your layout and download a print-ready A4 sheet.
            </p>
          </motion.div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="p-3.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout: Sidebar + Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-[290px_1fr] xl:grid-cols-[330px_1fr] gap-4 sm:gap-6"
        >
          {/* ── Left Panel: Sticky scrollable configuration controls ── */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Scrollable controls area */}
              <div className="max-h-[40vh] sm:max-h-[50vh] lg:max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6 scrollbar-thin">
                <ConfigurationSidebar
                  quantity={quantity}
                  setQuantity={setQuantity}
                  photoWidthMm={photoWidthMm}
                  setPhotoWidthMm={setPhotoWidthMm}
                  gapMm={gapMm}
                  setGapMm={setGapMm}
                  marginMm={marginMm}
                  setMarginMm={setMarginMm}
                  disabled={isGenerating}
                  maxFit={layoutInfo.maxFit}
                  photoHeightMm={photoHeightMm}
                />

                <div className="h-px bg-neutral-100 dark:bg-neutral-800/60" />

                {/* Reset */}
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    Reset Defaults
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Preview Canvas + Sheet Info + Exports ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Preview canvas - glassmorphic frame */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh]">
              <PreviewCanvas
                imageBase64={imageBase64}
                quantity={quantity}
                photoWidthMm={photoWidthMm}
                photoHeightMm={photoHeightMm}
                gapMm={gapMm}
                marginMm={marginMm}
                onLayoutInfoChange={setLayoutInfo}
              />
            </div>

            {/* Sheet Info + Export Actions — glassmorphic control bar */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                {/* Sheet info stats */}
                <div className="flex-1 space-y-3">
                  <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    Layout Statistics
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-50/50 dark:bg-neutral-800/10 border border-neutral-100 dark:border-neutral-800/30 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                      <div className="p-1 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                        {layoutInfo.actualCount}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                        Placed
                      </p>
                    </div>
                    
                    <div className="bg-neutral-50/50 dark:bg-neutral-800/10 border border-neutral-100 dark:border-neutral-800/30 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                      <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mb-1">
                        <Maximize className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                        {layoutInfo.maxFit}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                        Max Fit
                      </p>
                    </div>
                    
                    <div className="bg-neutral-50/50 dark:bg-neutral-800/10 border border-neutral-100 dark:border-neutral-800/30 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                      <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 mb-1">
                        <Grid3X3 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-base font-extrabold text-neutral-900 dark:text-white tabular-nums">
                        {layoutInfo.cols}×{layoutInfo.rows}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-medium mt-0.5">
                        Grid Layout
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:shrink-0 relative">
                  {/* Generating overlay */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button
                      className="w-full h-11 px-6 rounded-xl text-sm font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition-colors"
                      onClick={handleExportPDF}
                      disabled={exportDisabled}
                    >
                      {downloading === "pdf" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Download PDF
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full h-11 px-6 rounded-xl text-sm font-semibold border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white transition-colors"
                      onClick={handleExportPNG}
                      disabled={exportDisabled}
                    >
                      {downloading === "png" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileImage className="w-4 h-4 mr-2" />
                      )}
                      Download PNG
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
