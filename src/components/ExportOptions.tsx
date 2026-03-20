"use client";

import { useState } from "react";
import { FileImage, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  layoutBase64: string | null;
  disabled: boolean;
}

export default function ExportOptions({ layoutBase64, disabled }: Props) {
  const [downloading, setDownloading] = useState<"none" | "pdf" | "png">("none");

  const handleExportPNG = () => {
    if (!layoutBase64) return;
    const link = document.createElement("a");
    link.href = layoutBase64;
    link.download = "PhotoForge_Layout.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!layoutBase64) return;
    setDownloading("pdf");
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutBase64 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      const link = document.createElement("a");
      link.href = data.pdfBase64;
      link.download = "PhotoForge_Layout.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to export PDF");
    } finally {
      setDownloading("none");
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
      <h3 className="font-semibold text-neutral-900 tracking-tight">Export</h3>
      <div className="space-y-3">
        <Button 
          className="w-full h-12 rounded-xl text-base font-medium shadow-sm" 
          onClick={handleExportPDF} 
          disabled={disabled || downloading !== "none"}
        >
          {downloading === "pdf" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
          Download PDF
        </Button>
        <Button 
          variant="secondary"
          className="w-full h-12 rounded-xl text-base font-medium" 
          onClick={handleExportPNG} 
          disabled={disabled || downloading !== "none"}
        >
          <FileImage className="w-5 h-5 mr-2" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
