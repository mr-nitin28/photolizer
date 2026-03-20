"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    const imageBase64 = sessionStorage.getItem("processedImage");
    if (!imageBase64) {
      setError("No processed image found. Please upload a photo first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate PDF");
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = data.pdfBase64;
      link.download = "PhotoForge_Passports.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center">
      <Button 
        onClick={handleDownload} 
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto min-w-[280px] h-14 text-base font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" /> 
            Processing high-res PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-3" /> 
            Download Print-Ready PDF
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
