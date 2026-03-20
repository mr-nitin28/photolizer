"use client";

import Image from "next/image";
import { useEffect } from "react";

interface Props {
  imageBase64: string | null;
  quantity: number;
  photoWidthMm: number;
  photoHeightMm: number;
  gapMm: number;
  marginMm: number;
  onLayoutInfoChange?: (info: { maxFit: number; actualCount: number; cols: number; rows: number }) => void;
}

export default function PreviewCanvas({
  imageBase64,
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm,
  onLayoutInfoChange,
}: Props) {
  // A4 physical dimensions
  const a4WidthMm = 210;
  const a4HeightMm = 297;

  // Calculate grid mathematically based on physical bounds
  const printableWMm = a4WidthMm - 2 * marginMm;
  const printableHMm = a4HeightMm - 2 * marginMm;

  const cols = Math.max(1, Math.floor((printableWMm + gapMm) / (photoWidthMm + gapMm)));
  const rows = Math.max(1, Math.floor((printableHMm + gapMm) / (photoHeightMm + gapMm)));
  
  const maxFit = cols * rows;
  const actualCount = Math.min(quantity, maxFit);

  // Notify parent of layout calculations
  useEffect(() => {
    if (onLayoutInfoChange) {
      onLayoutInfoChange({ maxFit, actualCount, cols, rows });
    }
  }, [maxFit, actualCount, cols, rows, onLayoutInfoChange]);

  if (!imageBase64) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start bg-neutral-100/40 dark:bg-neutral-950/40 p-2 sm:p-6 pt-[10px] sm:pt-[10px] rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shadow-inner overflow-hidden min-h-[75vh] md:min-h-[85vh]">
      
      {/* 
        The "Paper" Container
        Massively expanded to give a professional full-sheet view.
      */}
      <div 
        className="relative bg-white shadow-2xl overflow-hidden ring-1 ring-black/10 transition-all duration-300 ease-in-out"
        style={{
          aspectRatio: "210/297",
          height: "100%",
          maxHeight: "85vh",
          minHeight: "650px", // Ensures it never shrinks too small on big monitors
          padding: `${(marginMm / a4HeightMm) * 100}% ${(marginMm / a4WidthMm) * 100}%`,
        }}
      >
        {/*
          The active layout grid inside the margins.
        */}
        <div 
          className="w-full h-full flex flex-wrap content-start"
          style={{
            gap: `${(gapMm / a4WidthMm) * 100}%`, // Relative gap representation
          }}
        >
          {Array.from({ length: actualCount }).map((_, i) => (
            <div
              key={i}
              className="relative border-[1.5px] border-dashed border-neutral-300"
              style={{
                width: `calc(${mathPercentage(photoWidthMm, a4WidthMm, marginMm)}% - ${mathGapOffset(gapMm, cols, a4WidthMm)}%)`,
                aspectRatio: `${photoWidthMm}/${photoHeightMm}`,
              }}
            >
              <Image
                src={imageBase64}
                alt={`Photo ${i + 1}`}
                fill
                className="object-contain p-[2px]" // Padding so it stays strictly within cut guides
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helpers to convert physical constraints to fluid CSS percentages
function mathPercentage(itemMm: number, paperMm: number, marginMm: number) {
  const printableAreaMm = paperMm - (2 * marginMm);
  return (itemMm / printableAreaMm) * 100;
}

function mathGapOffset(gapMm: number, cols: number, paperMm: number) {
  if (cols <= 1) return 0;
  // Divide total gap space across the items
  const totalGapSpace = gapMm * (cols - 1);
  return (totalGapSpace / cols / paperMm) * 100;
}
