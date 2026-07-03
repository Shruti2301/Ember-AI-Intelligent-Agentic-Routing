"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Key,
  Thermometer,
  Route,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store/useChatStore";
import { FIREWORKS_MODELS } from "@/lib/models";
import type { RouterRule } from "@/types";

export default function SettingsPage() {
  const { settings, updateSettings, updateRoutingRules, hasApiKey } = useChatStore();
  const [localKey, setLocalKey] = useState(settings.fireworksApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ fireworksApiKey: localKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKey = () => {
    setLocalKey("");
    updateSettings({ fireworksApiKey: "" });
  };

  const addRule = () => {
    const newRule: RouterRule = {
      id: `rule-${Date.now()}`,
      name: "New Rule",
      pattern: "",
      model: "accounts/fireworks/models/deepseek-v4-flash",
      enabled: true,
    };
    updateRoutingRules([...settings.routingRules, newRule]);
  };

  const removeRule = (id: string) => {
    updateRoutingRules(settings.routingRules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, data: Partial<RouterRule>) => {
    updateRoutingRules(
      settings.routingRules.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  };

  const modelOptions = FIREWORKS_MODELS.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222]">Settings</h1>
        <p className="text-sm text-[#888] mt-0.5">Configure your Ember AI workspace</p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-[#FF7A6E]" />
            Fireworks API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            {hasApiKey() ? (
              <Badge variant="accent" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Key configured
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-amber-700 border-amber-200 bg-amber-50">
                <AlertCircle className="w-3 h-3" />
                No key — add one to use Ember
              </Badge>
            )}
          </div>
          <Input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="fw_... or fpk_..."
          />
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs text-[#888]">
                Stored in your browser only. Sent with each request — never saved on our server.
              </p>
              <Link
                href="https://app.fireworks.ai/settings/users/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#FF7A6E] hover:underline"
              >
                Get a free Fireworks API key
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-2 shrink-0">
              {localKey && (
                <Button variant="ghost" size="sm" onClick={handleClearKey}>
                  Clear
                </Button>
              )}
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#FF7A6E]" />
            Model Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#222]">Temperature</span>
              <span className="text-sm text-[#888] font-mono">{settings.temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={([v]) => updateSettings({ temperature: v })}
              min={0}
              max={2}
              step={0.1}
            />
            <p className="text-[10px] text-[#888] mt-1">
              Lower = deterministic, Higher = creative
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#222]">Max Tokens</span>
              <span className="text-sm text-[#888] font-mono">{settings.maxTokens}</span>
            </div>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([v]) => updateSettings({ maxTokens: v })}
              min={256}
              max={8192}
              step={256}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-[#222]">Dark Mode</span>
              <p className="text-[10px] text-[#888]">Coming soon</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) => {
                updateSettings({ darkMode: v });
                if (typeof document !== "undefined") {
                  document.documentElement.classList.toggle("dark", v);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Routing Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Route className="w-4 h-4 text-[#FF7A6E]" />
              Routing Rules
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={addRule} className="gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.routingRules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F0E4E0] space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  value={rule.name}
                  onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                  className="text-sm font-medium text-[#222] bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Rule name"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(v) => updateRule(rule.id, { enabled: v })}
                  />
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#888] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={rule.pattern}
                  onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                  className="flex-1 h-8 px-3 rounded-lg border border-[#F0E4E0] bg-white text-xs text-[#666] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30"
                  placeholder="Regex pattern"
                />
                <select
                  value={rule.model}
                  onChange={(e) => updateRule(rule.id, { model: e.target.value })}
                  className="h-8 rounded-lg border border-[#F0E4E0] bg-white px-2 text-xs text-[#666] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30"
                >
                  {modelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
