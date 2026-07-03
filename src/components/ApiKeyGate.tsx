"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/useChatStore";

export default function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, updateSettings } = useChatStore();
  const [localKey, setLocalKey] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setLocalKey(settings.fireworksApiKey);
  }, [settings.fireworksApiKey]);

  const hasKey = Boolean(settings.fireworksApiKey.trim());
  const onSettingsPage = pathname === "/settings";
  const showGate = hydrated && !hasKey && !onSettingsPage;

  const handleSave = () => {
    const trimmed = localKey.trim();
    if (!trimmed) return;
    updateSettings({ fireworksApiKey: trimmed });
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#222]/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-white border border-[#F0E4E0] shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A6E] to-[#FFD89B] flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#222]">Bring your own key</h2>
                  <p className="text-xs text-[#888]">Your key stays in your browser — never on our servers</p>
                </div>
              </div>

              <p className="text-sm text-[#666] leading-relaxed mb-4">
                Ember AI uses Fireworks for inference. Add your free API key to try chat, routing,
                agent loops, and model comparison. You won&apos;t be charged through this app — usage
                goes to your Fireworks account.
              </p>

              <div className="space-y-3">
                <Input
                  type="password"
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="fw_... or fpk_..."
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <Button className="w-full gap-2" onClick={handleSave} disabled={!localKey.trim()}>
                  <Sparkles className="w-4 h-4" />
                  Save &amp; Continue
                </Button>
                <Link
                  href="https://app.fireworks.ai/settings/users/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-[#888] hover:text-[#FF7A6E] transition-colors"
                >
                  Get a free Fireworks API key
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
