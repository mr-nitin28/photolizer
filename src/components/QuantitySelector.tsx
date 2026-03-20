"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  quantity: number;
  onChange: (val: number) => void;
  disabled: boolean;
}

export default function QuantitySelector({ quantity, onChange, disabled }: Props) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 tracking-tight">Quantity</h3>
        <p className="text-sm text-neutral-500 mt-1">Number of photos on printed sheet</p>
      </div>
      
      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl p-2 shadow-inner">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 shrink-0 text-neutral-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" 
          onClick={() => onChange(quantity - 1)} 
          disabled={quantity <= 1 || disabled}
        >
          <Minus className="w-5 h-5" />
        </Button>
        <span className="text-2xl font-bold text-neutral-900 w-16 text-center tracking-tight">{quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 shrink-0 text-neutral-600 hover:bg-white hover:shadow-sm rounded-xl transition-all" 
          onClick={() => onChange(quantity + 1)} 
          disabled={quantity >= 30 || disabled}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
