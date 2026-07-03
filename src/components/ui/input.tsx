import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#F0E4E0] bg-white px-4 py-2 text-sm text-[#222] placeholder:text-[#888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A6E]/30 focus-visible:border-[#FF7A6E]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
