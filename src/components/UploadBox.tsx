"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertCircle } from "lucide-react";

export default function UploadBox() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG/PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setLoading(true);
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
    } catch (err: any) {
      setError(err.message);
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

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ease-in-out ${
          isDragOver 
            ? "border-blue-500 bg-blue-50/50 shadow-inner scale-[1.02]" 
            : "border-neutral-200 hover:border-blue-400 hover:bg-neutral-50/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
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
        
        <div className="flex flex-col items-center justify-center space-y-6">
          {loading ? (
            <div className="p-5 bg-blue-50 rounded-full">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="p-5 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-neutral-900">
              {loading ? "Removing background..." : "Click or drag your photo here"}
            </h3>
            {!loading && (
              <p className="text-sm font-medium text-neutral-500">
                Supports JPG, PNG (Max 5MB)
              </p>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
