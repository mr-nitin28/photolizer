"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const router = useRouter();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("processedImage");
    if (stored) {
      setImageBase64(stored);
    }
  }, []);

  const handleDownloadPNG = () => {
    if (!imageBase64) return;
    const link = document.createElement("a");
    link.href = imageBase64;
    link.download = "PhotoForge_Studio_HD.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!imageBase64) return;
    setDownloadingPDF(true);
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
    } catch (err) {
      alert("Failed to export PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (!imageBase64) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <p className="text-neutral-500 mb-6 font-medium text-lg">No processed image found. Please go back and upload.</p>
        <Link href="/upload"><Button size="lg" className="rounded-xl shadow-sm">Go to Upload</Button></Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 pt-16 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <Link href="/upload">
            <Button variant="ghost" className="mb-6 h-10 px-4 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
            </Button>
          </Link>
          <div className="space-y-3 text-center md:text-left">
             <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight pb-2 drop-shadow-sm">
              HD Studio Photo Ready
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium max-w-2xl leading-relaxed">
              Your image has been perfectly isolated in high definition without any quality loss. Download it seamlessly for digital IDs, or easily format it for physical prints.
            </p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgb(0,0,0,0.05)] ring-1 ring-black/5 flex flex-col md:flex-row gap-12 lg:gap-20 items-center justify-center">
            
          {/* Left: Image Showcase */}
          <div className="flex-1 flex justify-center w-full max-w-sm relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-2xl rounded-[3rem] transition-all group-hover:opacity-40 group-hover:duration-500 -z-10" />
            <div className="relative w-full aspect-auto min-h-[400px] max-h-[500px] flex items-center justify-center bg-transparent rounded-3xl overflow-hidden transition-transform hover:scale-[1.02] duration-500 ease-out p-4">
               {/* Visual checkerboard grid behind transparent bg for styling */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiPjwvcmVjdD4KPC9zdmc+')] opacity-20 dark:opacity-10 rounded-3xl -z-10 bg-repeat bg-center" />
               <Image 
                 src={imageBase64} 
                 alt="Single processed transparent photo in HD" 
                 fill 
                 className="object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.25)]" 
                 unoptimized 
               />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 space-y-8 w-full max-w-md">
            <div className="space-y-4">
              <Button 
                onClick={handleDownloadPNG}
                className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all hover:-translate-y-1" 
              >
                <Download className="w-5 h-5 mr-3" />
                Download HD PNG
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                variant="outline"
                className="w-full h-14 rounded-2xl text-lg font-semibold shadow-sm border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:-translate-y-1" 
              >
                {downloadingPDF ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-neutral-600" /> : <FileText className="w-5 h-5 mr-3 text-neutral-700 dark:text-neutral-300" />}
                Download HD PDF
              </Button>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-bold tracking-widest uppercase">Or Print Configuration</span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
            </div>
            
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                className="w-full h-16 rounded-2xl text-lg font-semibold ring-1 ring-inset ring-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all hover:shadow-md" 
                onClick={() => router.push('/print')}
              >
                <Settings className="w-5 h-5 mr-3 text-indigo-600" />
                Create Passport Sheet Grid
              </Button>
              <p className="text-sm text-center text-neutral-500 font-medium">Auto-generate standard A4 layouts with precision cutting guides</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
