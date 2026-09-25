"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table2,
  Play,
  Clock,
  DollarSign,
  Heart,
  TrendingUp,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FIREWORKS_MODELS } from "@/lib/models";
import { formatDuration, formatTokens, formatCost } from "@/lib/utils";
import { chatFetch } from "@/lib/apiClient";
import { useChatStore } from "@/store/useChatStore";
import type { ComparisonResult, ModelInfo } from "@/types";

const compareModels = FIREWORKS_MODELS.filter((m) =>
  ["accounts/fireworks/models/deepseek-v4p1-flash", "accounts/fireworks/models/kimi-k2p7-code", "accounts/fireworks/models/deepseek-v4-pro-0813", "accounts/fireworks/models/glm-5p3"].includes(m.id)
);

export default function ComparisonPage() {
  const [prompt, setPrompt] = useState("Explain the concept of attention mechanisms in transformer models");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const hasApiKey = useChatStore((s) => s.hasApiKey);

  const handleCompare = async () => {
    if (!prompt.trim() || running) return;

    if (!hasApiKey()) {
      setError("Add your Fireworks API key in Settings first.");
      return;
    }

    setError(null);
    setRunning(true);
    setResults([]);

    const newResults: ComparisonResult[] = [];

    for (const model of compareModels) {
      const start = performance.now();
      try {
        const res = await chatFetch({
          messages: [{ role: "user", content: prompt }],
          model: model.id,
          temperature: 0.7,
          maxTokens: 512,
        });

        const data = await res.json();
        const latency = performance.now() - start;

        newResults.push({
          modelId: model.id,
          response: data.content,
          latency,
          tokens: data.tokens || { input: 0, output: 0, total: 0 },
          cost: data.cost || 0,
        });
      } catch {
        newResults.push({
          modelId: model.id,
          response: "Error",
          latency: performance.now() - start,
          tokens: { input: 0, output: 0, total: 0 },
          cost: 0,
        });
      }

      setResults([...newResults]);
    }

    setRunning(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222]">Model Comparison</h1>
        <p className="text-sm text-[#888] mt-0.5">
          Run the same prompt across multiple Fireworks models side-by-side.
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to compare across models..."
              className="flex-1 h-10 px-4 rounded-xl border border-[#F0E4E0] bg-white text-sm text-[#222] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30 transition-all"
              disabled={running}
            />
            <Button onClick={handleCompare} disabled={running || !prompt.trim()} className="gap-2">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? "Running..." : "Compare"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {compareModels.map((model, i) => {
          const result = results.find((r) => r.modelId === model.id);
          const isFav = favorites.has(model.id);

          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className={`h-full ${isFav ? "ring-2 ring-[#FF7A6E]/30" : ""}`}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{model.name}</CardTitle>
                    <p className="text-[10px] text-[#888] mt-0.5">{model.id.split("/").pop()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={model.category === "fast" ? "accent" : model.category === "reasoning" ? "gold" : "default"} className="text-[9px]">
                      {model.category}
                    </Badge>
                    <button
                      onClick={() => toggleFavorite(model.id)}
                      className="p-1.5 rounded-lg hover:bg-[#FFF9F5] transition-colors"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-[#FF7A6E] text-[#FF7A6E]" : "text-[#888]"}`} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-[#FFF9F5] text-center">
                      <div className="flex items-center justify-center gap-1 text-[#888] text-[10px]">
                        <Clock className="w-3 h-3" />
                        Latency
                      </div>
                      <div className="text-sm font-semibold text-[#222] mt-0.5">
                        {result ? formatDuration(result.latency) : "—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FFF9F5] text-center">
                      <div className="flex items-center justify-center gap-1 text-[#888] text-[10px]">
                        <TrendingUp className="w-3 h-3" />
                        Tokens
                      </div>
                      <div className="text-sm font-semibold text-[#222] mt-0.5">
                        {result ? formatTokens(result.tokens.total) : "—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FFF9F5] text-center">
                      <div className="flex items-center justify-center gap-1 text-[#888] text-[10px]">
                        <DollarSign className="w-3 h-3" />
                        Cost
                      </div>
                      <div className="text-sm font-semibold text-[#222] mt-0.5">
                        {result ? formatCost(result.cost) : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Response */}
                  {result && (
                    <div className="relative">
                      <div className="text-xs text-[#666] bg-[#FFF9F5] rounded-xl p-3 leading-relaxed max-h-40 overflow-y-auto">
                        {result.response}
                      </div>
                    </div>
                  )}

                  {!result && running && (
                    <div className="flex items-center justify-center py-6 text-[#888]">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs">Running...</span>
                    </div>
                  )}

                  {!result && !running && (
                    <div className="text-center py-6 text-xs text-[#888]">
                      Click "Compare" to run
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
