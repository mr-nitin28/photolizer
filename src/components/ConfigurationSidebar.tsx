"use client";

import { Minus, Plus, Maximize, Grid3X3, Scissors, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

// Reusable slider control with custom card styling and icons
function SliderControl({
  icon: Icon,
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
  icon: React.ComponentType<{ className?: string }>;
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
    <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 transition-all duration-200 hover:border-neutral-200 dark:hover:border-neutral-700/60">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/60 text-neutral-500 dark:text-neutral-400 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">{label}</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-snug">{hint}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg tabular-nums">
          {value} {unit}
        </span>
      </div>
      <div className="pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed touch-action-none"
        />
        <div className="flex justify-between text-[9px] font-medium text-neutral-400 dark:text-neutral-500 mt-1 px-0.5">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
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
    <div className="space-y-4">
      {/* Quantity stepper with premium card packaging */}
      <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 transition-all duration-200 hover:border-neutral-200 dark:hover:border-neutral-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/60 text-neutral-500 dark:text-neutral-400 mt-0.5">
              <Grid3X3 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">Quantity</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Photos on sheet</p>
            </div>
          </div>
          {maxFit !== undefined && maxFit > 0 && (
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200/50 dark:border-neutral-700/50">
              max {maxFit}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/60 rounded-xl p-1 mt-1 border border-neutral-200/20 dark:border-neutral-700/10">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 hover:shadow-sm transition-all"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1 || disabled}
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
          
          <div className="overflow-hidden h-7 flex items-center justify-center relative w-16">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={quantity}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="text-xl font-extrabold text-neutral-900 dark:text-white text-center tabular-nums block absolute"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 hover:shadow-sm transition-all"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= quantityMax || disabled}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Photo size slider */}
      <SliderControl
        icon={Maximize}
        label="Photo Width"
        hint={`Height: ${photoHeightMm ?? Math.round(photoWidthMm * (45 / 35))} mm (35:45 ratio)`}
        value={photoWidthMm}
        min={20}
        max={100}
        disabled={disabled}
        onChange={setPhotoWidthMm}
      />

      {/* Gap spacing slider */}
      <SliderControl
        icon={Scissors}
        label="Gap Spacing"
        hint="Cutter padding between photos"
        value={gapMm}
        min={0}
        max={25}
        disabled={disabled}
        onChange={setGapMm}
      />

      {/* Margin slider */}
      <SliderControl
        icon={Move}
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
