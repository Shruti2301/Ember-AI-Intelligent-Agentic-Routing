"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full h-6 flex items-center", className)}>
      <div className="absolute w-full h-1.5 rounded-full bg-[#F0E4E0]" />
      <div
        className="absolute h-1.5 rounded-full bg-[#FF7A6E] transition-all duration-200"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF7A6E] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
      />
    </div>
  );
}

export { Slider };
