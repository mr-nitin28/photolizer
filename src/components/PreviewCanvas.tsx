"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
const A4_RATIO = A4_H / A4_W; // ≈ 1.414

export default function PreviewCanvas({
  imageBase64,
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm,
  onLayoutInfoChange,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState({ w: 0, h: 0 });

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

  // ── Smart scaling: measure the container and compute the largest A4
  // rectangle that fits entirely inside it. Width-constrained on mobile,
  // height-constrained on wide screens. Re-measures on resize. ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const computeSize = () => {
      // Inner padding is handled by the container's CSS p-2/p-4
      const cw = el.clientWidth;
      const ch = el.clientHeight;

      // Fit by width first, then check if the resulting height fits
      let w = cw;
      let h = w * A4_RATIO;

      if (h > ch) {
        // Height constrained — fit by height instead
        h = ch;
        w = h / A4_RATIO;
      }

      setPaperSize({ w: Math.floor(w), h: Math.floor(h) });
    };

    computeSize();

    const ro = new ResizeObserver(computeSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!imageBase64) return null;

  // CSS % padding is always relative to element WIDTH.
  const marginPct = (marginMm / A4_W) * 100;

  // Gap percentages relative to printable area
  const colGapPct = printableW > 0 ? (gapMm / printableW) * 100 : 0;
  const rowGapPct = printableH > 0 ? (gapMm / printableH) * 100 : 0;

  // Each photo width as % of printable area
  const photoWidthPct = printableW > 0 ? (photoWidthMm / printableW) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 overflow-hidden"
    >
      {/* A4 Paper — sized precisely to fit the container */}
      {paperSize.w > 0 && (
        <div
          className="relative bg-white shadow-[0_4px_30px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200/80 dark:ring-neutral-700/50 flex-shrink-0"
          style={{
            width: `${paperSize.w}px`,
            height: `${paperSize.h}px`,
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
      )}
    </div>
  );
}
