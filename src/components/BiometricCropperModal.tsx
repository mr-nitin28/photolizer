"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Sparkles,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRY_PRESETS } from "@/config/countryPresets";

interface BiometricCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialPresetId?: string;
  onCancel: () => void;
  onConfirm: (croppedBase64: string, shouldRemoveBg: boolean) => void;
}

export default function BiometricCropperModal({
  isOpen,
  imageSrc,
  initialPresetId = "us-passport",
  onCancel,
  onConfirm,
}: BiometricCropperModalProps) {
  // Selected country preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId);
  const [shouldRemoveBg, setShouldRemoveBg] = useState(true);

  // Transform state: zoom, pan (x, y), rotation (degrees: 0, 90, 180, 270)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // DOM refs
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const preset =
    COUNTRY_PRESETS.find((p) => p.id === selectedPresetId) || COUNTRY_PRESETS[0];

  // Target aspect ratio (width / height)
  const targetRatio = preset.widthMm / preset.heightMm;

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      // Reset transforms
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
  }, [imageSrc]);

  // Handle Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(3.5, Math.max(0.5, prev * factor)));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset positioning
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Perform high-resolution crop on confirm
  const handleApplyCrop = () => {
    const img = imageObjRef.current;
    if (!img) return;

    // Create high-res export canvas (1200px width base)
    const exportWidth = 1200;
    const exportHeight = Math.round(exportWidth / targetRatio);

    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Coordinate space transformations
    ctx.save();
    // Center of canvas
    ctx.translate(exportWidth / 2, exportHeight / 2);
    // Apply pan scaled to canvas resolution
    // Viewport crop box is typically 320px wide in UI
    const scaleFactor = exportWidth / 320;
    ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    // Apply zoom
    ctx.scale(zoom, zoom);

    // Calculate natural image size centered
    // Scale image to fit export canvas on base zoom 1
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth = exportWidth;
    let drawHeight = exportWidth / imgRatio;
    if (drawHeight < exportHeight) {
      drawHeight = exportHeight;
      drawWidth = exportHeight * imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.95);
    onConfirm(croppedBase64, shouldRemoveBg);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Biometric Face Alignment & Crop
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                Align head within guidelines to guarantee passport compliance
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Viewport */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center bg-neutral-950 relative overflow-hidden select-none">
            {/* Country format selector */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="bg-neutral-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-700 shadow-md focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {COUNTRY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.flagEmoji} {p.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleReset}
                className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Crop Boundary Container */}
            <div
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              className="relative w-[280px] sm:w-[320px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all"
              style={{
                aspectRatio: `${targetRatio}`,
              }}
            >
              {/* The Transformable Image */}
              {imageSrc && (
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.15s ease-out",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Source for cropping"
                    className="max-w-none w-full h-auto object-contain select-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Biometric Overlay Guides (Face Oval, Crown, Eye Line, Chin) */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Crown top guideline (top 15%) */}
                <div className="absolute top-[12%] left-0 right-0 border-t border-dashed border-amber-400/80 flex justify-end pr-2">
                  <span className="text-[9px] font-bold text-amber-300 bg-black/60 px-1 rounded">Crown</span>
                </div>

                {/* Eye level guideline (around 45% from top) */}
                <div className="absolute top-[42%] left-0 right-0 border-t border-dashed border-emerald-400/90 flex justify-end pr-2">
                  <span className="text-[9px] font-bold text-emerald-300 bg-black/60 px-1 rounded">Eye Level</span>
                </div>

                {/* Chin guideline (around 78% from top) */}
                <div className="absolute top-[78%] left-0 right-0 border-t border-dashed border-amber-400/80 flex justify-end pr-2">
                  <span className="text-[9px] font-bold text-amber-300 bg-black/60 px-1 rounded">Chin</span>
                </div>

                {/* Center vertical symmetry crosshair */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-white/20" />

                {/* Facial Oval Frame */}
                <div className="absolute top-[12%] bottom-[20%] left-[16%] right-[16%] rounded-full border-2 border-dashed border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white/90 bg-black/50 px-2 py-0.5 rounded-full select-none">
                    Fit Head Here
                  </span>
                </div>
              </div>
            </div>

            {/* Transform Controls Toolbar */}
            <div className="mt-4 flex items-center gap-2 z-20 bg-neutral-900/90 p-1.5 rounded-xl border border-neutral-800 shadow-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                className="h-8 w-8 text-neutral-300 hover:text-white hover:bg-neutral-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-[11px] font-bold text-neutral-400 tabular-nums px-1">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(3.5, z + 0.15))}
                className="h-8 w-8 text-neutral-300 hover:text-white hover:bg-neutral-800"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-neutral-700 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className="h-8 w-8 text-neutral-300 hover:text-white hover:bg-neutral-800"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer Controls & Actions */}
          <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* AI Background Removal Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={shouldRemoveBg}
                onChange={(e) => setShouldRemoveBg(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Remove Background with AI
              </span>
            </label>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyCrop}
                className="flex-1 sm:flex-none h-10 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Confirm & Continue
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
