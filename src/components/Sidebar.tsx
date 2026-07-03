"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  Route,
  GitBranch,
  Table2,
  Settings,
  Key,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Observability", icon: LayoutDashboard },
  { href: "/router", label: "Model Router", icon: Route },
  { href: "/agent-loop", label: "Agent Loop", icon: GitBranch },
  { href: "/comparison", label: "Compare Models", icon: Table2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const hasApiKey = useChatStore((s) => s.hasApiKey());
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar (hidden on desktop) */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 z-50 flex items-center justify-between px-4 glass border-b border-[#F0E4E0]">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#FF7A6E] to-[#FFD89B] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#222] truncate">Ember AI</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 -mr-2 flex items-center justify-center rounded-xl text-[#666] hover:text-[#222] hover:bg-white/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-50 bg-[#222]/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar / drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 glass border-r border-[#F0E4E0] flex flex-col z-50",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Logo + mobile close button */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#FF7A6E] to-[#FFD89B] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-[#222] truncate">Ember AI</h1>
              <p className="text-[10px] text-[#888] font-medium uppercase tracking-wider">Fireworks</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden w-9 h-9 -mr-2 flex items-center justify-center rounded-xl text-[#666] hover:text-[#222] hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "text-[#222] bg-white shadow-sm"
                    : "text-[#666] hover:text-[#222] hover:bg-white/50"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-5 bg-[#FF7A6E] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* API Key Status */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-r from-[#FF7A6E]/5 to-[#FFD89B]/5 border border-[#F0E4E0]">
          {hasApiKey ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                <span className="text-xs font-medium text-[#666]">API key connected</span>
              </div>
              <p className="text-[10px] text-[#888] mt-0.5">Ready for inference</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-[#666]">No API key</span>
              </div>
              <Link
                href="/settings"
                className="text-[10px] text-[#FF7A6E] hover:underline mt-0.5 inline-block"
              >
                Add your Fireworks key →
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
