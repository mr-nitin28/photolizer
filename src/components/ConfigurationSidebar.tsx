"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Props interface for all user-configurable layout parameters
interface Props {
  quantity: number;
  setQuantity: (val: number) => void;
  photoWidthMm: number;
  setPhotoWidthMm: (val: number) => void;
  gapMm: number;
  setGapMm: (val: number) => void;
  marginMm: number;
  setMarginMm: (val: number) => void;
  disabled: boolean;
}

export default function ConfigurationSidebar({ 
  quantity, setQuantity, 
  photoWidthMm, setPhotoWidthMm, 
  gapMm, setGapMm,
  marginMm, setMarginMm,
  disabled 
}: Props) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800 shadow-sm space-y-8">
      
      {/* Quantity Control */}
      <div>
        <div className="mb-4">
          <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight text-lg">Quantity</h3>
          <p className="text-xs text-neutral-500 font-medium mt-1">Total photos on physical sheet</p>
        </div>
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-1.5 shadow-inner">
          <Button variant="ghost" size="icon" className="h-12 w-12 shrink-0 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm rounded-xl transition-all" onClick={() => setQuantity(quantity - 1)} disabled={quantity <= 1 || disabled}>
            <Minus className="w-5 h-5" />
          </Button>
          <span className="text-3xl font-black text-neutral-900 dark:text-white w-16 text-center tracking-tight">{quantity}</span>
          <Button variant="ghost" size="icon" className="h-12 w-12 shrink-0 text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm rounded-xl transition-all" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= 100 || disabled}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/80"></div>

      {/* Photo Size Control */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight text-lg">Photo Size</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Width (keeps 35:45 ratio)</p>
          </div>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">{photoWidthMm} mm</span>
        </div>
        <input 
          type="range" 
          min="20" max="100" 
          value={photoWidthMm} 
          disabled={disabled}
          onChange={(e) => setPhotoWidthMm(parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-blue-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 mt-2 uppercase tracking-wider">
          <span>20mm</span>
          <span>100mm</span>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/80"></div>

      {/* Gap Spacing Control */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight text-lg">Gap Spacing</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Cutter padding between photos</p>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{gapMm} mm</span>
        </div>
        <input 
          type="range" 
          min="0" max="25" step="1"
          value={gapMm} 
          disabled={disabled}
          onChange={(e) => setGapMm(parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 mt-2 uppercase tracking-wider">
          <span>0mm</span>
          <span>25mm</span>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/80"></div>

      {/* Margin Control */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight text-lg">Margin</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Outer edge spacing on A4 sheet</p>
          </div>
          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{marginMm} mm</span>
        </div>
        <input 
          type="range" 
          min="0" max="30" step="1"
          value={marginMm} 
          disabled={disabled}
          onChange={(e) => setMarginMm(parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 mt-2 uppercase tracking-wider">
          <span>0mm</span>
          <span>30mm</span>
        </div>
      </div>

    </div>
  );
}
