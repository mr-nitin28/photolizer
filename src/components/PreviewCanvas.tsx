"use client";

import Image from "next/image";
import { useEffect } from "react";

interface PreviewCanvasProps {
  imageBase64: string | null;
  quantity: number;
  photoWidthMm: number;
  photoHeightMm: number;
  gapMm: number;
  marginMm: number;
  onLayoutInfoChange?: (info: {
    maxFit: number;
    actualCount: number;
    cols: number;
    rows: number;
  }) => void;
}

// A4 physical dimensions in mm
const A4_W = 210;
const A4_H = 297;

export default function PreviewCanvas({
  imageBase64,
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm,
  onLayoutInfoChange,
}: PreviewCanvasProps) {
  // Calculate grid based on physical bounds
  const printableW = A4_W - 2 * marginMm;
  const printableH = A4_H - 2 * marginMm;

  const cols = Math.max(1, Math.floor((printableW + gapMm) / (photoWidthMm + gapMm)));
  const rows = Math.max(1, Math.floor((printableH + gapMm) / (photoHeightMm + gapMm)));

  const maxFit = cols * rows;
  const actualCount = Math.min(quantity, maxFit);

  // Notify parent of layout metrics
  useEffect(() => {
    onLayoutInfoChange?.({ maxFit, actualCount, cols, rows });
  }, [maxFit, actualCount, cols, rows, onLayoutInfoChange]);

  if (!imageBase64) return null;

  // CSS % padding is always relative to element WIDTH (even top/bottom).
  // Use A4_W as divisor for all sides so 1mm margin = same physical distance everywhere.
  const marginPct = (marginMm / A4_W) * 100;

  // Gap percentages must be relative to the flex container's own dimensions.
  // column-gap → % of container width (printableW).
  // row-gap → % of container height (printableH).
  const colGapPct = printableW > 0 ? (gapMm / printableW) * 100 : 0;
  const rowGapPct = printableH > 0 ? (gapMm / printableH) * 100 : 0;

  // Each photo's width as % of the flex container (printable area)
  const photoWidthPct = printableW > 0 ? (photoWidthMm / printableW) * 100 : 0;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start p-3 sm:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 overflow-hidden">
      {/* A4 Paper */}
      <div
        className="relative bg-white shadow-[0_4px_30px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200/80 dark:ring-neutral-700/50 transition-all duration-300 ease-in-out"
        style={{
          aspectRatio: `${A4_W}/${A4_H}`,
          height: "100%",
          maxHeight: "82vh",
          minHeight: "600px",
          padding: `${marginPct}%`,
        }}
      >
        {/* Photo grid inside margins */}
        <div
          className="w-full h-full flex flex-wrap content-start"
          style={{ columnGap: `${colGapPct}%`, rowGap: `${rowGapPct}%` }}
        >
          {Array.from({ length: actualCount }).map((_, i) => (
            <div
              key={i}
              className="relative border border-dashed border-neutral-200 dark:border-neutral-300 transition-all duration-200"
              style={{
                width: `${photoWidthPct}%`,
                aspectRatio: `${photoWidthMm}/${photoHeightMm}`,
              }}
            >
              <Image
                src={imageBase64}
                alt={`Photo ${i + 1}`}
                fill
                className="object-contain p-px"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
