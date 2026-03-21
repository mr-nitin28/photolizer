"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const router = useRouter();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState("");
  const [pngSuccess, setPngSuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("processedImage");
    if (stored) setImageBase64(stored);
  }, []);

  // Auto-dismiss success indicator after 2s
  useEffect(() => {
    if (!pngSuccess) return;
    const t = setTimeout(() => setPngSuccess(false), 2000);
    return () => clearTimeout(t);
  }, [pngSuccess]);

  const handleDownloadPNG = () => {
    if (!imageBase64) return;
    const link = document.createElement("a");
    link.href = imageBase64;
    link.download = "PhotoForge_Studio_HD.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPngSuccess(true);
  };

  const handleDownloadPDF = async () => {
    if (!imageBase64) return;
    setDownloadingPDF(true);
    setError("");
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutBase64: imageBase64, isA4: false }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      const link = document.createElement("a");
      link.href = data.pdfBase64;
      link.download = "PhotoForge_Studio_HD.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError("Failed to export PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

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
              Upload a photo first to see your result here.
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
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-100/25 dark:bg-blue-900/10 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-100/20 dark:bg-indigo-900/10 rounded-full blur-[60px] sm:blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-8">
        {/* Header */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/upload">
              <Button
                variant="ghost"
                className="mb-3 sm:mb-5 h-9 sm:h-10 px-3 sm:px-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Your Photo is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Ready
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl leading-relaxed">
              Background removed in HD with zero quality loss. Download for digital use or configure a passport print sheet.
            </p>
          </motion.div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-6 sm:gap-10 lg:gap-16 items-center"
        >
          {/* Left: Image showcase */}
          <div className="flex-1 flex justify-center w-full max-w-sm relative group">
            {/* Soft glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 dark:from-blue-600/10 dark:to-indigo-600/10 blur-2xl rounded-[2rem] -z-10 transition-opacity group-hover:opacity-100 opacity-70" />

            <div className="relative w-full min-h-[240px] sm:min-h-[360px] max-h-[400px] sm:max-h-[480px] aspect-auto flex items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden p-2 sm:p-4">
              {/* Transparency checkerboard */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiPjwvcmVjdD4KPC9zdmc+')] opacity-15 dark:opacity-8 rounded-2xl -z-10 bg-repeat bg-center" />

              <Image
                src={imageBase64}
                alt="Processed transparent photo in HD"
                fill
                className="object-contain relative z-10 drop-shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                unoptimized
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 space-y-5 sm:space-y-7 w-full max-w-md">
            {/* Error banner */}
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

            {/* Download buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleDownloadPNG}
                className="w-full h-13 rounded-xl text-base font-semibold shadow-sm bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 transition-all hover:-translate-y-0.5"
              >
                {pngSuccess ? (
                  <CheckCircle2 className="w-5 h-5 mr-2.5 text-emerald-400" />
                ) : (
                  <Download className="w-5 h-5 mr-2.5" />
                )}
                {pngSuccess ? "Downloaded!" : "Download HD PNG"}
              </Button>

              <Button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                variant="outline"
                className="w-full h-13 rounded-xl text-base font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white transition-all hover:-translate-y-0.5"
              >
                {downloadingPDF ? (
                  <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 mr-2.5" />
                )}
                Download HD PDF
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                Or
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Print CTA */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 rounded-xl text-base font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white transition-all hover:-translate-y-0.5 group"
                onClick={() => router.push("/print")}
              >
                <Printer className="w-5 h-5 mr-2.5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
                Create Passport Print Sheet
                <ArrowRight className="w-4 h-4 ml-auto text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
              </Button>
              <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 font-medium">
                Generate A4 layouts with cutting guides for professional printing
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
