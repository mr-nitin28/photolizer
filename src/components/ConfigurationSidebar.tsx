"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Props interface for all user-configurable layout parameters
interface ConfigurationSidebarProps {
  quantity: number;
  setQuantity: (val: number) => void;
  photoWidthMm: number;
  setPhotoWidthMm: (val: number) => void;
  gapMm: number;
  setGapMm: (val: number) => void;
  marginMm: number;
  setMarginMm: (val: number) => void;
  disabled: boolean;
  /** Maximum photos that physically fit on the sheet (disables + beyond this) */
  maxFit?: number;
  /** Computed photo height in mm (derived from width via 35:45 ratio) */
  photoHeightMm?: number;
}

// Reusable slider row to keep each control DRY
function SliderControl({
  label,
  hint,
  value,
  unit = "mm",
  min,
  max,
  step = 1,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  disabled: boolean;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{label}</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">{hint}</p>
        </div>
        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg tabular-nums">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-neutral-900 dark:accent-white disabled:opacity-40 disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function ConfigurationSidebar({
  quantity,
  setQuantity,
  photoWidthMm,
  setPhotoWidthMm,
  gapMm,
  setGapMm,
  marginMm,
  setMarginMm,
  disabled,
  maxFit,
  photoHeightMm,
}: ConfigurationSidebarProps) {
  // Quantity upper bound: don't allow more than what fits on the sheet
  const quantityMax = maxFit && maxFit > 0 ? maxFit : 100;

  return (
    <div className="space-y-6">
      {/* Quantity stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Quantity</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Photos on sheet</p>
          </div>
          {maxFit !== undefined && maxFit > 0 && (
            <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
              max {maxFit}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-all"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1 || disabled}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-2xl font-extrabold text-neutral-900 dark:text-white w-12 text-center tabular-nums">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-all"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= quantityMax || disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* Photo size slider */}
      <SliderControl
        label="Photo Width"
        hint={`Height: ${photoHeightMm ?? Math.round(photoWidthMm * (45 / 35))} mm (35:45 ratio)`}
        value={photoWidthMm}
        min={20}
        max={100}
        disabled={disabled}
        onChange={setPhotoWidthMm}
      />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* Gap spacing slider */}
      <SliderControl
        label="Gap Spacing"
        hint="Cutter padding between photos"
        value={gapMm}
        min={0}
        max={25}
        disabled={disabled}
        onChange={setGapMm}
      />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* Margin slider */}
      <SliderControl
        label="Margin"
        hint="Outer edge spacing on A4"
        value={marginMm}
        min={0}
        max={30}
        disabled={disabled}
        onChange={setMarginMm}
      />
    </div>
  );
}
