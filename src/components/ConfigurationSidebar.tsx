"use client";

import { Minus, Plus, Maximize, Grid3X3, Scissors, Move, Globe, FileSpreadsheet, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  COUNTRY_PRESETS,
  PAPER_SIZES,
  BACKGROUND_COLORS,
  PaperSizeConfig,
} from "@/config/countryPresets";

interface ConfigurationSidebarProps {
  quantity: number;
  setQuantity: (val: number) => void;
  photoWidthMm: number;
  setPhotoWidthMm: (val: number) => void;
  photoHeightMm: number;
  setPhotoHeightMm: (val: number) => void;
  gapMm: number;
  setGapMm: (val: number) => void;
  marginMm: number;
  setMarginMm: (val: number) => void;
  selectedPaper: PaperSizeConfig;
  setSelectedPaper: (paper: PaperSizeConfig) => void;
  selectedBgColor: string;
  setSelectedBgColor: (colorHex: string) => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  disabled: boolean;
  maxFit?: number;
}

// Reusable slider control with card styling
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
  photoHeightMm,
  setPhotoHeightMm,
  gapMm,
  setGapMm,
  marginMm,
  setMarginMm,
  selectedPaper,
  setSelectedPaper,
  selectedBgColor,
  setSelectedBgColor,
  selectedPresetId,
  setSelectedPresetId,
  disabled,
  maxFit,
}: ConfigurationSidebarProps) {
  const quantityMax = maxFit && maxFit > 0 ? maxFit : 100;

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === "custom") return;

    const preset = COUNTRY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPhotoWidthMm(preset.widthMm);
      setPhotoHeightMm(preset.heightMm);
      // Auto-switch to recommended background color for this country
      const recColor = BACKGROUND_COLORS.find((c) => c.id === preset.recommendedBg);
      if (recColor) {
        setSelectedBgColor(recColor.hex);
      }
    }
  };

  const activePreset = COUNTRY_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="space-y-4">
      {/* ── Document / Country Preset Selector ── */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/60 text-indigo-600 dark:text-indigo-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">Document Standard</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Official global requirements</p>
          </div>
        </div>

        <select
          value={selectedPresetId}
          disabled={disabled}
          onChange={(e) => handlePresetSelect(e.target.value)}
          className="w-full text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          {COUNTRY_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.flagEmoji} {preset.name}
            </option>
          ))}
          <option value="custom">⚙️ Custom Dimensions...</option>
        </select>

        {activePreset?.notes && (
          <p className="text-[10px] text-indigo-600/90 dark:text-indigo-400/90 font-medium bg-indigo-50/60 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
            {activePreset.notes}
          </p>
        )}
      </div>

      {/* ── Paper Sheet Size Selector ── */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/60 text-indigo-600 dark:text-indigo-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">Paper Size</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Print medium format</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PAPER_SIZES.map((paper) => {
            const isSelected = selectedPaper.id === paper.id;
            return (
              <button
                key={paper.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedPaper(paper)}
                className={`p-2 rounded-lg text-left transition-all border relative ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                    : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate">{paper.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </div>
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block truncate mt-0.5">
                  {paper.widthMm} × {paper.heightMm} mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Background Color Palette ── */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700/60 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">Passport Background</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Official consular colors</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {BACKGROUND_COLORS.map((bg) => {
            const isSelected = selectedBgColor.toLowerCase() === bg.hex.toLowerCase();
            return (
              <button
                key={bg.id}
                type="button"
                title={bg.name}
                disabled={disabled}
                onClick={() => setSelectedBgColor(bg.hex)}
                className={`relative w-8 h-8 rounded-full border-2 transition-transform duration-150 flex items-center justify-center ${
                  bg.borderClass
                } ${isSelected ? "scale-115 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-neutral-900" : "hover:scale-105"}`}
                style={{
                  backgroundColor: bg.hex === "transparent" ? "transparent" : bg.hex,
                }}
              >
                {bg.hex === "transparent" && (
                  <span className="text-[9px] font-bold text-neutral-500">PNG</span>
                )}
                {isSelected && bg.hex !== "transparent" && (
                  <Check
                    className={`w-4 h-4 ${
                      bg.hex === "#ffffff" || bg.hex === "#f8f8f6" || bg.hex === "#e2e8f0"
                        ? "text-neutral-900"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quantity Stepper ── */}
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

      {/* ── Custom Photo Size (if custom selected) ── */}
      {selectedPresetId === "custom" && (
        <div className="space-y-3">
          <SliderControl
            icon={Maximize}
            label="Photo Width"
            hint="Custom photo width in mm"
            value={photoWidthMm}
            min={15}
            max={100}
            disabled={disabled}
            onChange={setPhotoWidthMm}
          />
          <SliderControl
            icon={Maximize}
            label="Photo Height"
            hint="Custom photo height in mm"
            value={photoHeightMm}
            min={15}
            max={120}
            disabled={disabled}
            onChange={setPhotoHeightMm}
          />
        </div>
      )}

      {/* ── Spacing & Margins ── */}
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

      <SliderControl
        icon={Move}
        label="Margin"
        hint="Outer edge spacing on paper"
        value={marginMm}
        min={0}
        max={30}
        disabled={disabled}
        onChange={setMarginMm}
      />
    </div>
  );
}
