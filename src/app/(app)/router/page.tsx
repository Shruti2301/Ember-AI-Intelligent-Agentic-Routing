"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Route, Zap, DollarSign, Gauge, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routePrompt } from "@/services/router";
import { FIREWORKS_MODELS } from "@/lib/models";
import { formatCost } from "@/lib/utils";
import type { RouteDecision } from "@/types";

export default function RouterPage() {
  const [prompt, setPrompt] = useState("");
  const [decision, setDecision] = useState<RouteDecision | null>(null);
  const [history, setHistory] = useState<{ prompt: string; decision: RouteDecision }[]>([]);

  const handleRoute = () => {
    if (!prompt.trim()) return;
    const result = routePrompt(prompt);
    setDecision(result);
    setHistory((prev) => [{ prompt: prompt.trim(), decision: result }, ...prev].slice(0, 10));
  };

  const model = decision ? FIREWORKS_MODELS.find((m) => m.id === decision.model) : null;

  const speedColor = {
    fast: "text-green-600 bg-green-50",
    moderate: "text-[#8B6914] bg-[#FFD89B]/20",
    slow: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222]">Model Router</h1>
        <p className="text-sm text-[#888] mt-0.5">
          See how Ember intelligently routes each prompt to the optimal Fireworks model.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Input */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Analyze a Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type a prompt to see which model it routes to..."
                rows={5}
                className="w-full rounded-xl border border-[#F0E4E0] bg-white p-4 text-sm text-[#222] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30 focus:border-[#FF7A6E]/50 resize-none transition-all"
              />
              <div className="flex justify-end mt-3">
                <Button onClick={handleRoute} disabled={!prompt.trim()} className="gap-2">
                  <Route className="w-4 h-4" />
                  Route It
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Routing Rules Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#FF7A6E]" />
                Routing Logic
              </CardTitle>
              <p className="text-xs text-[#888]">
                Ember uses keyword-matching heuristics and configurable rules.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9F5] text-xs">
                  <span className="font-medium text-[#666] w-24">Coding</span>
                  <span className="text-[#222] font-medium">→ GLM 5.2</span>
                  <Badge variant="accent" className="text-[9px]">$1.40/$4.40</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9F5] text-xs">
                  <span className="font-medium text-[#666] w-24">Math / Reasoning</span>
                  <span className="text-[#222] font-medium">→ DeepSeek V4 Pro</span>
                  <Badge variant="accent" className="text-[9px]">$1.74/$3.48</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9F5] text-xs">
                  <span className="font-medium text-[#666] w-24">Simple Q&A</span>
                  <span className="text-[#222] font-medium">→ DeepSeek V4 Flash</span>
                  <Badge variant="accent" className="text-[9px]">$0.14/$0.28</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9F5] text-xs">
                  <span className="font-medium text-[#666] w-24">Creative Writing</span>
                  <span className="text-[#222] font-medium">→ GLM 5.1</span>
                  <Badge variant="accent" className="text-[9px]">$1.40/$4.40</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Panel */}
        <div className="md:col-span-2">
          <AnimatedDecision decision={decision} model={model} speedColor={speedColor} />

          {/* Model details */}
          {model && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Model Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888]">Provider</span>
                  <span className="text-[#222] font-medium">{model.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Context Window</span>
                  <span className="text-[#222] font-medium">{(model.contextWindow / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Caching</span>
                  <span className="text-[#222] font-medium">{model.cachingSupported ? "Supported" : "N/A"}</span>
                </div>
                <div className="pt-2 border-t border-[#F0E4E0]">
                  <span className="text-[#888] block mb-1">Strengths:</span>
                  <div className="flex flex-wrap gap-1">
                    {model.strengths.map((s) => (
                      <Badge key={s} variant="default" className="text-[9px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF9F5] border border-[#F0E4E0] text-xs"
                >
                  <span className="flex-1 truncate text-[#666]">{h.prompt}</span>
                  <ArrowRight className="w-3 h-3 text-[#888]" />
                  <Badge variant="accent" className="text-[9px]">
                    {h.decision.model.split("/").pop()}
                  </Badge>
                  <Badge variant={h.decision.expectedSpeed === "fast" ? "accent" : "gold"} className="text-[9px]">
                    {h.decision.expectedSpeed}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AnimatedDecision({
  decision,
  model,
  speedColor,
}: {
  decision: RouteDecision | null;
  model: any;
  speedColor: Record<string, string>;
}) {
  if (!decision) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-[#FF7A6E]" />
            Route Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Route className="w-10 h-10 text-[#E0D5D0] mb-3" />
            <p className="text-sm text-[#888]">Enter a prompt to see the routing decision</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-[#FF7A6E]" />
            Route Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FF7A6E]/5 to-[#FFD89B]/5 border border-[#F0E4E0] text-center">
            <div className="text-lg font-bold text-[#222]">
              {model?.name || decision.model.split("/").pop()}
            </div>
            <div className="text-[10px] text-[#888] uppercase tracking-wider mt-0.5">
              {decision.model}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F5]">
              <Zap className="w-4 h-4 text-[#FF7A6E]" />
              <span className="flex-1 text-[#666]">Reason</span>
              <span className="text-[#222] font-medium text-right max-w-[60%]">{decision.reason}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F5]">
              <Gauge className="w-4 h-4 text-[#FF7A6E]" />
              <span className="flex-1 text-[#666]">Speed</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${speedColor[decision.expectedSpeed]}`}>
                {decision.expectedSpeed}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF9F5]">
              <DollarSign className="w-4 h-4 text-[#FF7A6E]" />
              <span className="flex-1 text-[#666]">Est. Cost</span>
              <span className="text-[#222] font-medium">{formatCost(decision.estimatedCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
