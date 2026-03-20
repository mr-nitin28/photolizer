"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, FileImage, FileText, Loader2, RotateCcw, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfigurationSidebar from "@/components/ConfigurationSidebar";
import PreviewCanvas from "@/components/PreviewCanvas";

// Default configuration values
const DEFAULTS = { quantity: 8, photoWidthMm: 35, gapMm: 4, marginMm: 5 } as const;

export default function PrintSheetPage() {
  // Source image from session
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // User-configurable layout parameters
  const [quantity, setQuantity] = useState<number>(DEFAULTS.quantity);
  const [photoWidthMm, setPhotoWidthMm] = useState<number>(DEFAULTS.photoWidthMm);
  const [gapMm, setGapMm] = useState<number>(DEFAULTS.gapMm);
  const [marginMm, setMarginMm] = useState<number>(DEFAULTS.marginMm);

  // Computed height maintaining passport aspect ratio (35:45)
  const photoHeightMm = Math.round(photoWidthMm * (45 / 35));

  // Generated output and metadata
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloading, setDownloading] = useState<"none" | "pdf" | "png">("none");
  const [error, setError] = useState("");
  
  // Real-time grid metrics updated from the CSS Preview Canvas
  const [layoutInfo, setLayoutInfo] = useState<{ maxFit: number; actualCount: number; cols: number; rows: number }>({
    maxFit: 0, actualCount: 0, cols: 0, rows: 0
  });

  // Load processed image on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("processedImage");
    if (stored) {
      setImageBase64(stored);
    }
  }, []);

  // Reset all controls to defaults
  const handleReset = () => {
    setQuantity(DEFAULTS.quantity);
    setPhotoWidthMm(DEFAULTS.photoWidthMm);
    setGapMm(DEFAULTS.gapMm);
    setMarginMm(DEFAULTS.marginMm);
  };

  // Dedicated backend layout generator running ONLY on download intent
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
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate layout");
      return data.layoutBase64 as string;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Export handlers ---
  const handleExportPNG = async () => {
    setDownloading("png");
    const layoutOutput = await fetchPreciseLayout();
    if (layoutOutput) {
      const link = document.createElement("a");
      link.href = layoutOutput;
      link.download = "PhotoForge_A4_Layout.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloading("none");
  };

  const handleExportPDF = async () => {
    setDownloading("pdf");
    const layoutOutput = await fetchPreciseLayout();
    if (!layoutOutput) {
      setDownloading("none");
      return;
    }
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutBase64: layoutOutput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      const link = document.createElement("a");
      link.href = data.pdfBase64;
      link.download = "PhotoForge_A4_Layout.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError("Failed to convert layout into PDF format.");
    } finally {
      setDownloading("none");
    }
  };

  // --- Empty state ---
  if (!imageBase64) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <p className="text-neutral-500 mb-6 font-medium text-lg">No processed image found. Please go back.</p>
        <Link href="/upload"><Button size="lg" className="rounded-xl shadow-sm">Go to Upload</Button></Link>
      </main>
    );
  }

  const exportDisabled = isGenerating || downloading !== "none";

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-16 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/preview">
            <Button variant="ghost" className="mb-6 h-10 px-4 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Single Photo
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Print Sheet Configuration
            </h1>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium">
              Fine-tune quantity, size, gap and margin to maximize photos on your A4 sheet.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Grid: Sidebar Controls + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar: Controls + Info + Export */}
          <div className="lg:col-span-1 flex flex-col gap-6">
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
            />

            {/* Layout Info + Reset */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <Grid3x3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold">Sheet Info</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-50 dark:bg-neutral-950 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-600">{layoutInfo.actualCount}</p>
                    <p className="text-neutral-500 font-medium mt-0.5">Placed</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-950 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-600">{layoutInfo.maxFit}</p>
                    <p className="text-neutral-500 font-medium mt-0.5">Max Fit</p>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium text-center">
                  Grid: {layoutInfo.cols} cols × {layoutInfo.rows} rows
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-sm font-medium"
                onClick={handleReset}
                disabled={isGenerating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            {/* Export Section */}
            <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-4 relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight text-lg">Generate HD Print</h3>
              <div className="space-y-3 relative z-0">
                <Button
                  className="w-full h-12 rounded-xl text-base font-medium shadow-sm transition-all hover:shadow-md"
                  onClick={handleExportPDF}
                  disabled={exportDisabled}
                >
                  {downloading === "pdf" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                  Download PDF
                </Button>
                <Button
                  variant="secondary"
                  className="w-full h-12 rounded-xl text-base font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  onClick={handleExportPNG}
                  disabled={exportDisabled}
                >
                  {downloading === "png" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileImage className="w-5 h-5 mr-2" />}
                  Download PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Right Area: Realtime CSS Grid Custom Preview */}
          <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-[2rem] px-4 sm:px-6 pb-4 sm:pb-6 pt-[10px] shadow-sm ring-1 ring-black/5 flex">
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
        </div>
      </div>
    </main>
  );
}
