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
  paperWidthMm?: number;
  paperHeightMm?: number;
  paperName?: string;
  backgroundColorHex?: string;
  onLayoutInfoChange?: (info: {
    maxFit: number;
    actualCount: number;
    cols: number;
    rows: number;
  }) => void;
}

export default function PreviewCanvas({
  imageBase64,
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm,
  paperWidthMm = 210,
  paperHeightMm = 297,
  paperName = "A4",
  backgroundColorHex = "#ffffff",
  onLayoutInfoChange,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState({ w: 0, h: 0 });

  const paperW = paperWidthMm || 210;
  const paperH = paperHeightMm || 297;
  const paperRatio = paperH / paperW;

  // Calculate grid based on physical bounds
  const printableW = paperW - 2 * marginMm;
  const printableH = paperH - 2 * marginMm;

  const cols = Math.max(1, Math.floor((printableW + gapMm) / (photoWidthMm + gapMm)));
  const rows = Math.max(1, Math.floor((printableH + gapMm) / (photoHeightMm + gapMm)));

  const maxFit = cols * rows;
  const actualCount = Math.min(quantity, maxFit);

  // Notify parent of layout metrics
  useEffect(() => {
    onLayoutInfoChange?.({ maxFit, actualCount, cols, rows });
  }, [maxFit, actualCount, cols, rows, onLayoutInfoChange]);

  // Smart scaling: compute largest rectangle fitting container while preserving paper ratio
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const computeSize = () => {
      const style = window.getComputedStyle(el);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

      // Leave 56px margin for the CAD rule guides around the sheet
      const cw = el.clientWidth - paddingX - 56;
      const ch = el.clientHeight - paddingY - 56;

      let w = cw;
      let h = w * paperRatio;

      if (h > ch) {
        h = ch;
        w = h / paperRatio;
      }

      setPaperSize({ w: Math.floor(w), h: Math.floor(h) });
    };

    computeSize();

    const ro = new ResizeObserver(computeSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paperRatio]);

  if (!imageBase64) return null;

  // CSS % padding is relative to element width
  const marginPct = (marginMm / paperW) * 100;

  // Gap percentages relative to printable area
  const colGapPct = printableW > 0 ? (gapMm / printableW) * 100 : 0;
  const rowGapPct = printableH > 0 ? (gapMm / printableH) * 100 : 0;

  // Each photo width as % of printable area
  const photoWidthPct = printableW > 0 ? (photoWidthMm / printableW) * 100 : 0;

  const isTransparent = backgroundColorHex.toLowerCase() === "transparent";

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#262626_1.5px,transparent_1.5px)] [background-size:20px_20px] border border-neutral-100 dark:border-neutral-900 overflow-hidden"
    >
      {/* Paper Wrapper — contains both sheet and CAD layout guides */}
      {paperSize.w > 0 && (
        <div
          className="absolute flex items-center justify-center transition-all duration-300"
          style={{
            width: `${paperSize.w}px`,
            height: `${paperSize.h}px`,
          }}
        >
          {/* Physical Sheet Paper */}
          <div
            id="printable-sheet"
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
                  className="relative border border-dashed border-neutral-300 dark:border-neutral-400 transition-all duration-200 overflow-hidden"
                  style={{
                    width: "100%",
                    aspectRatio: `${photoWidthMm}/${photoHeightMm}`,
                    backgroundColor: isTransparent ? "transparent" : backgroundColorHex,
                  }}
                >
                  {/* Subtle checkerboard if transparent */}
                  {isTransparent && (
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiPjwvcmVjdD48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZjBmMGYwIj48L3JlY3Q+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2YwZjBmMCI+PC9yZWN0Pjwvc3ZnPg==')] opacity-40 -z-10" />
                  )}

                  <Image
                    src={imageBase64}
                    alt={`Passport photo ${i + 1}`}
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
                {paperW} mm ({paperName} Width)
              </span>
            </div>
            <div className="h-2 w-px bg-neutral-300 dark:bg-neutral-800" />
          </div>

          {/* Height Dimension Indicator (CAD Style) */}
          <div className="absolute -right-8 top-0 bottom-0 flex flex-col items-center justify-between text-neutral-400 dark:text-neutral-500 text-[10px] font-bold select-none">
            <div className="w-2 h-px bg-neutral-300 dark:bg-neutral-800" />
            <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 relative flex items-center justify-center">
              <span className="bg-neutral-50 dark:bg-neutral-950 py-1 px-1.5 absolute whitespace-nowrap rotate-90 origin-center text-neutral-500 dark:text-neutral-400 tabular-nums">
                {paperH} mm ({paperName} Height)
              </span>
            </div>
            <div className="w-2 h-px bg-neutral-300 dark:bg-neutral-800" />
          </div>
        </div>
      )}
    </div>
  );
}
