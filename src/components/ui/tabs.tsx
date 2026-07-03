"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)} data-value={value} data-onchange={""}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            _value: value,
            _onValueChange: onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { _value?: string; _onValueChange?: (v: string) => void }) {
  const { _value, _onValueChange, ...rest } = props as any;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-[#FFF9F5] border border-[#F0E4E0] p-1",
        className
      )}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            _value,
            _onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({
  children,
  className,
  value,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  _value?: string;
  _onValueChange?: (v: string) => void;
}) {
  const { _value, _onValueChange, ...rest } = props as any;
  const isActive = _value === value;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white text-[#222] shadow-sm"
          : "text-[#888] hover:text-[#222]",
        className
      )}
      onClick={() => _onValueChange?.(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

function TabsContent({
  children,
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  _value?: string;
}) {
  const { _value, ...rest } = props as any;
  if (_value !== value) return null;
  return (
    <div className={cn("mt-4", className)} {...rest}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
