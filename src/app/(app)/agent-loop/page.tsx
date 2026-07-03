"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  Terminal,
  FileCode,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatTokens, formatCost } from "@/lib/utils";
import { chatFetch } from "@/lib/apiClient";
import { useChatStore } from "@/store/useChatStore";
import { FIREWORKS_MODELS } from "@/lib/models";
import type { AgentLoop, AgentLoopStep as AgentLoopStepType } from "@/types";

const stepIcons: Record<string, any> = {
  plan: FileText,
  generate: FileCode,
  review: Search,
  improve: Sparkles,
  final: CheckCircle2,
};

const stepLabels: Record<string, string> = {
  plan: "Plan",
  generate: "Generate",
  review: "Review",
  improve: "Improve",
  final: "Final Answer",
};

function AgentStep({ step, index }: { step: AgentLoopStepType; index: number }) {
  const Icon = stepIcons[step.phase] || Terminal;
  const isRunning = step.status === "running";
  const isComplete = step.status === "complete";
  const isPending = step.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-10 pb-6 last:pb-0"
    >
      {/* Connector line */}
      {index < 4 && (
        <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
          isComplete ? "bg-[#FF7A6E]" : "bg-[#F0E4E0]"
        }`} />
      )}

      {/* Step circle */}
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
        isComplete
          ? "bg-[#FF7A6E] border-[#FF7A6E]"
          : isRunning
          ? "bg-white border-[#FF7A6E] animate-glow"
          : "bg-white border-[#F0E4E0]"
      }`}>
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-white" />
        ) : isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-[#FF7A6E] animate-spin" />
        ) : (
          <Icon className="w-3.5 h-3.5 text-[#888]" />
        )}
      </div>

      {/* Content */}
      <div className={`rounded-xl border p-4 transition-all duration-300 ${
        isRunning
          ? "border-[#FF7A6E]/30 bg-gradient-to-r from-[#FF7A6E]/5 to-[#FFD89B]/5 shadow-sm"
          : isComplete
          ? "border-[#F0E4E0] bg-white"
          : "border-[#F0E4E0] bg-white/50 opacity-60"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#222]">
            {stepLabels[step.phase] || step.label}
          </span>
          <div className="flex items-center gap-2">
            {step.duration > 0 && (
              <span className="text-[10px] text-[#888] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(step.duration)}
              </span>
            )}
            {step.model && (
              <Badge variant="outline" className="text-[9px]">
                {step.model.split("/").pop()}
              </Badge>
            )}
          </div>
        </div>

        {step.content && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <pre className="text-[11px] text-[#666] bg-[#FFF9F5] rounded-lg p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                {step.content}
              </pre>
            </motion.div>
          </AnimatePresence>
        )}

        {step.tokens && step.tokens.total > 0 && (
          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#888]">
            <span>{formatTokens(step.tokens.input)} in</span>
            <span>{formatTokens(step.tokens.output)} out</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AgentLoopPage() {
  const [loop, setLoop] = useState<AgentLoop | null>(null);
  const [prompt, setPrompt] = useState("Write a function that finds the longest palindrome substring in a string");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasApiKey = useChatStore((s) => s.hasApiKey);

  const generateSteps = async () => {
    if (!hasApiKey()) {
      setError("Add your Fireworks API key in Settings first.");
      return;
    }

    setError(null);
    const id = `loop-${Date.now()}`;
    const steps: AgentLoopStepType[] = [
      { id: `${id}-plan`, phase: "plan", label: "Planning approach", content: "", model: "accounts/fireworks/models/deepseek-v4-pro", duration: 0, tokens: { input: 0, output: 0, total: 0 }, status: "pending" },
      { id: `${id}-gen`, phase: "generate", label: "Writing code", content: "", model: "accounts/fireworks/models/glm-5p2", duration: 0, tokens: { input: 0, output: 0, total: 0 }, status: "pending" },
      { id: `${id}-review`, phase: "review", label: "Reviewing output", content: "", model: "accounts/fireworks/models/deepseek-v4-pro", duration: 0, tokens: { input: 0, output: 0, total: 0 }, status: "pending" },
      { id: `${id}-improve`, phase: "improve", label: "Improving solution", content: "", model: "accounts/fireworks/models/glm-5p2", duration: 0, tokens: { input: 0, output: 0, total: 0 }, status: "pending" },
      { id: `${id}-final`, phase: "final", label: "Final answer", content: "", model: "accounts/fireworks/models/glm-5p2", duration: 0, tokens: { input: 0, output: 0, total: 0 }, status: "pending" },
    ];

    const newLoop: AgentLoop = {
      id,
      prompt,
      steps,
      startedAt: new Date(),
      status: "running",
    };

    setLoop(newLoop);
    setRunning(true);

    const phasePrompts: Record<string, string> = {
      plan: `Plan an approach for: ${prompt}. Output a clear, step-by-step plan.`,
      generate: `Write clean code for: ${prompt}. Output only the implementation.`,
      review: `Review this code for bugs, edge cases, and improvements. Output your findings.`,
      improve: `Improve the solution based on the review. Output the final improved code.`,
      final: `Provide the final, polished solution with a brief explanation.`,
    };

    // Simulate agent steps with Fireworks calls
    for (let i = 0; i < steps.length; i++) {
      const stepId = steps[i].id;

      // Mark as running
      setLoop((prev) => {
        if (!prev) return prev;
        const updatedSteps = prev.steps.map((s) =>
          s.id === stepId ? { ...s, status: "running" as const } : s
        );
        return { ...prev, steps: updatedSteps };
      });

      const stepStart = performance.now();
      const model = steps[i].model;

      try {
        const res = await chatFetch({
          messages: [{ role: "user", content: phasePrompts[steps[i].phase] }],
          model,
          temperature: 0.7,
          maxTokens: 512,
        });

        const data = await res.json();
        const duration = performance.now() - stepStart;

        if (data.error) throw new Error(data.error);

        setLoop((prev) => {
          if (!prev) return prev;
          const updatedSteps = prev.steps.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  content: data.content,
                  duration,
                  tokens: data.tokens,
                  status: "complete" as const,
                }
              : s
          );
          return {
            ...prev,
            steps: updatedSteps,
            completedAt: i === steps.length - 1 ? new Date() : undefined,
            status: i === steps.length - 1 ? ("complete" as const) : prev.status,
          };
        });
      } catch {
        setLoop((prev) => {
          if (!prev) return prev;
          const updatedSteps = prev.steps.map((s) =>
            s.id === stepId ? { ...s, status: "error" as const, duration: performance.now() - stepStart } : s
          );
          return { ...prev, steps: updatedSteps, status: "error" as const };
        });
      }
    }

    setRunning(false);
  };

  const totalTokens = loop?.steps.reduce((s, st) => s + (st.tokens?.total || 0), 0) || 0;
  const totalDuration = loop?.steps.reduce((s, st) => s + st.duration, 0) || 0;
  const completedSteps = loop?.steps.filter((s) => s.status === "complete").length || 0;
  const totalSteps = loop?.steps.length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222]">Agent Loop Demo</h1>
        <p className="text-sm text-[#888] mt-0.5">
          Autonomous coding agent with live step-by-step execution through Fireworks models.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#FF7A6E]" />
            Agent Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should the agent build?"
              className="flex-1 h-10 px-4 rounded-xl border border-[#F0E4E0] bg-white text-sm text-[#222] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30 transition-all"
              disabled={running}
            />
            <Button onClick={generateSteps} disabled={running || !prompt.trim()} className="gap-2">
              {running ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {running ? "Running..." : "Run Agent"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          {/* Flow diagram */}
          <div className="flex items-center justify-between mt-6 px-4">
            {["Plan", "Generate", "Review", "Improve", "Final"].map((phase, i) => (
              <div key={phase} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  loop && loop.steps[i]?.status === "complete"
                    ? "bg-[#FF7A6E] text-white"
                    : loop?.steps[i]?.status === "running"
                    ? "bg-[#FF7A6E]/10 text-[#FF7A6E] border border-[#FF7A6E]/30"
                    : "bg-[#FFF9F5] text-[#888] border border-[#F0E4E0]"
                }`}>
                  {loop?.steps[i]?.status === "complete" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : loop?.steps[i]?.status === "running" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  {phase}
                </div>
                {i < 4 && <div className="w-6 h-0.5 bg-[#F0E4E0] mx-1" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats if running/completed */}
      {loop && completedSteps > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white border border-[#F0E4E0] text-center">
            <div className="text-lg font-bold text-[#222]">{completedSteps}/{totalSteps}</div>
            <div className="text-[10px] text-[#888]">Steps Done</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#F0E4E0] text-center">
            <div className="text-lg font-bold text-[#222]">{formatDuration(totalDuration)}</div>
            <div className="text-[10px] text-[#888]">Total Time</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#F0E4E0] text-center">
            <div className="text-lg font-bold text-[#222]">{formatTokens(totalTokens)}</div>
            <div className="text-[10px] text-[#888]">Total Tokens</div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#F0E4E0] text-center">
            <div className="text-lg font-bold text-[#222">{loop.status}</div>
            <div className="text-[10px] text-[#888]">Status</div>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-0">
        {loop ? (
          loop.steps.map((step, i) => <AgentStep key={step.id} step={step} index={i} />)
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7A6E]/10 to-[#FFD89B]/10 flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-7 h-7 text-[#FF7A6E]" />
            </div>
            <p className="text-sm text-[#888]">Enter a prompt and run the agent to see it work through each step</p>
          </div>
        )}
      </div>
    </div>
  );
}
