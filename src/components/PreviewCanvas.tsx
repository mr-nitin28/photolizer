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
  // rectangle that fits entirely inside it, deducting container padding. ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const computeSize = () => {
      const style = window.getComputedStyle(el);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

      // Leave 56px room for the CAD rule guides around the sheet
      const cw = el.clientWidth - paddingX - 56;
      const ch = el.clientHeight - paddingY - 56;

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
      className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#262626_1.5px,transparent_1.5px)] [background-size:20px_20px] border border-neutral-100 dark:border-neutral-900 overflow-hidden"
    >
      {/* A4 Paper Wrapper — contains both the sheet and CAD layout guides */}
      {paperSize.w > 0 && (
        <div
          className="absolute flex items-center justify-center transition-all duration-300"
          style={{
            width: `${paperSize.w}px`,
            height: `${paperSize.h}px`,
          }}
        >
          {/* Physical A4 Paper */}
          <div
            className="absolute inset-0 bg-white dark:bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-neutral-200/80 dark:ring-neutral-300/40"
            style={{
              padding: `${marginPct}%`,
            }}
          >
            {/* Photo grid inside margins */}
            <div
              className="w-full h-full grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${photoWidthPct}%)`,
                columnGap: `${colGapPct}%`,
                rowGap: `${rowGapPct}%`,
                justifyContent: "start",
                alignContent: "start",
              }}
            >
              {Array.from({ length: actualCount }).map((_, i) => (
                <div
                  key={i}
                  className="relative border border-dashed border-neutral-200/80 dark:border-neutral-300/90 transition-all duration-200"
                  style={{
                    width: "100%",
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

          {/* Width Dimension Indicator (CAD Style) */}
          <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between text-neutral-400 dark:text-neutral-500 text-[10px] font-bold select-none">
            <div className="h-2 w-px bg-neutral-300 dark:bg-neutral-800" />
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800 mx-2 relative flex items-center justify-center">
              <span className="bg-neutral-50 dark:bg-neutral-950 px-2 text-neutral-500 dark:text-neutral-400 tabular-nums">
                210 mm (A4 Width)
              </span>
            </div>
            <div className="h-2 w-px bg-neutral-300 dark:bg-neutral-800" />
          </div>

          {/* Height Dimension Indicator (CAD Style) */}
          <div className="absolute -right-8 top-0 bottom-0 flex flex-col items-center justify-between text-neutral-400 dark:text-neutral-500 text-[10px] font-bold select-none">
            <div className="w-2 h-px bg-neutral-300 dark:bg-neutral-800" />
            <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 relative flex items-center justify-center">
              <span className="bg-neutral-50 dark:bg-neutral-950 py-1 px-1.5 absolute whitespace-nowrap rotate-90 origin-center text-neutral-500 dark:text-neutral-400 tabular-nums">
                297 mm (A4 Height)
              </span>
            </div>
            <div className="w-2 h-px bg-neutral-300 dark:bg-neutral-800" />
          </div>
        </div>
      )}
    </div>
  );
}
