"use client";

import { LayoutGrid, Layers, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  currentLayout: number;
  onChange: (val: number) => void;
  disabled: boolean;
}

const layouts = [
  { value: 4, label: "4 Photos", icon: <LayoutGrid className="w-6 h-6 mb-2 text-blue-500" /> },
  { value: 5, label: "5 Photos", icon: <Layers className="w-6 h-6 mb-2 text-indigo-500" /> },
  { value: 6, label: "6 Photos", icon: <Grid3x3 className="w-6 h-6 mb-2 text-purple-500" /> },
];

export default function LayoutSelector({ currentLayout, onChange, disabled }: Props) {
  return (
    <div className="space-y-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
      <h3 className="font-semibold text-neutral-900 tracking-tight">Layout Options</h3>
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
        {layouts.map((l) => (
          <Button
            key={l.value}
            variant="outline"
            className={`h-24 flex flex-col items-center justify-center rounded-2xl transition-all border-2 ${
              currentLayout === l.value 
                ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm scale-[1.02]" 
                : "border-neutral-100 hover:border-blue-200 hover:bg-neutral-50 text-neutral-600"
            }`}
            onClick={() => onChange(l.value)}
            disabled={disabled}
          >
            {l.icon}
            <span className="font-semibold">{l.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
