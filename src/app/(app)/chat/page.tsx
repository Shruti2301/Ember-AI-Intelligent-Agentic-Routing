"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  StopCircle,
  Route,
  Zap,
  Clock,
  DollarSign,
  Copy,
  Check,
  Trash2,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useChatStore } from "@/store/useChatStore";
import { routePrompt } from "@/services/router";
import { telemetry } from "@/services/telemetry";
import { FIREWORKS_MODELS } from "@/lib/models";
import { formatTokens, formatCost, formatDuration } from "@/lib/utils";
import { chatFetch, ApiKeyMissingError } from "@/lib/apiClient";
import { EMBER_SYSTEM_PROMPT } from "@/lib/prompts";
import MarkdownContent from "@/components/MarkdownContent";
import type { Message, RouteDecision } from "@/types";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF7A6E]/20 to-[#FFD89B]/20 flex items-center justify-center">
        <Bot className="w-3.5 h-3.5 text-[#FF7A6E]" />
      </div>
      <div className="flex">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function RouteCard({ route }: { route: RouteDecision | null }) {
  if (!route) return null;
  const model = FIREWORKS_MODELS.find((m) => m.id === route.model);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A6E]/5 to-[#FFD89B]/5 border border-[#F0E4E0] text-sm"
    >
      <Route className="w-4 h-4 text-[#FF7A6E]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#222] truncate">
            {model?.name || route.model.split("/").pop()}
          </span>
          <Badge variant={route.expectedSpeed === "fast" ? "accent" : "gold"} className="text-[10px]">
            {route.expectedSpeed}
          </Badge>
        </div>
        <p className="text-[11px] text-[#888] truncate">{route.reason}</p>
      </div>
      <div className="text-right text-[11px] text-[#888] whitespace-nowrap">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {formatCost(route.estimatedCost)}
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {route.expectedSpeed}
        </div>
      </div>
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-[#FFF9F5]"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[#888]" />}
    </button>
  );
}

const suggestions = [
  "Write a React hook for debounced search",
  "Explain how attention works in transformers",
  "Summarize the key principles of clean code",
  "Write a poem about AI and creativity",
];

const systemPrompt = EMBER_SYSTEM_PROMPT;

export default function ChatPage() {
  const { messages, isStreaming, addMessage, setStreaming, clearMessages, currentRoute, setCurrentRoute, hasApiKey } = useChatStore();
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    if (!hasApiKey()) {
      addMessage({
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "Add your Fireworks API key in **Settings** to start chatting.",
        timestamp: new Date(),
        status: "error",
      });
      return;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMsg);
    setInput("");
    setStreaming(true);

    // Route the prompt
    const route = selectedModel
      ? { ...routePrompt(input), model: selectedModel, userOverridden: true, originalModel: routePrompt(input).model }
      : routePrompt(input);
    setCurrentRoute(route);

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages.concat(userMsg).map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await chatFetch({
        messages: allMessages,
        model: route.model,
        temperature: useChatStore.getState().settings.temperature || 0.7,
        maxTokens: useChatStore.getState().settings.maxTokens || 2048,
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        model: data.model,
        latency: data.latency,
        tokens: data.tokens,
        cost: data.cost,
        cacheEstimate: data.cacheEstimate,
        status: "complete",
      };

      addMessage(assistantMsg);

      // Record telemetry
      telemetry.add({
        prompt: userMsg.content,
        response: data.content,
        model: data.model,
        latency: data.latency,
        tokens: data.tokens,
        estimatedCost: data.cost,
        cacheEstimate: data.cacheEstimate,
        status: "success",
        routeReason: data.routeReason,
      });
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content:
          err instanceof ApiKeyMissingError
            ? "Add your Fireworks API key in **Settings** to start chatting."
            : `Sorry, something went wrong: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: new Date(),
        status: "error",
      };
      addMessage(errorMsg);
    } finally {
      setStreaming(false);
      setCurrentRoute(null);
      setSelectedModel(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modelOptions = FIREWORKS_MODELS.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.category})`,
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#222]">Chat</h1>
          <p className="text-sm text-[#888] mt-0.5">Ask anything — Ember routes to the best model</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-[#888]">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7A6E]/10 to-[#FFD89B]/10 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-[#FF7A6E]" />
            </div>
            <h2 className="text-xl font-semibold text-[#222] mb-2">
              What would you like to explore?
            </h2>
            <p className="text-sm text-[#888] max-w-sm mb-8">
              Ask a coding question, brainstorm ideas, or get help with anything.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="text-left p-3 rounded-xl border border-[#F0E4E0] bg-white text-xs text-[#666] hover:border-[#FF7A6E]/30 hover:text-[#222] transition-all duration-200 hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF7A6E]/20 to-[#FFD89B]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-[#FF7A6E]" />
                </div>
              )}

              <div className={`max-w-[75%] ${msg.role === "user" ? "order-[-1]" : ""}`}>
                {msg.role === "user" ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-[#FF7A6E] text-white text-sm leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-4 py-3 rounded-2xl bg-white border border-[#F0E4E0] text-sm leading-relaxed text-[#333] shadow-sm">
                      {msg.status === "error" ? (
                        <p className="text-red-600">{msg.content}</p>
                      ) : (
                        <MarkdownContent content={msg.content} />
                      )}
                    </div>
                    {msg.tokens && (
                      <div className="flex items-center gap-3 px-4 py-1.5 text-[11px] text-[#888]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(msg.latency || 0)}
                        </span>
                        <span>
                          {formatTokens(msg.tokens.input)} in / {formatTokens(msg.tokens.output)} out
                        </span>
                        {msg.cost !== undefined && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCost(msg.cost)}
                          </span>
                        )}
                        <CopyButton text={msg.content} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF7A6E]/20 to-[#FFD89B]/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#FF7A6E]" />
            </div>
            <div className="bg-white border border-[#F0E4E0] rounded-2xl shadow-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {currentRoute && <RouteCard route={currentRoute} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-[#F0E4E0]">
        <AnimatePresence>
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="flex items-center gap-2 text-xs text-[#888]">
                <Badge variant="accent">Override: {FIREWORKS_MODELS.find((m) => m.id === selectedModel)?.name || selectedModel.split("/").pop()}</Badge>
                <button onClick={() => setSelectedModel(null)} className="hover:text-[#FF7A6E] transition-colors">Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <select
            value={selectedModel || ""}
            onChange={(e) => setSelectedModel(e.target.value || null)}
            className="h-10 rounded-xl border border-[#F0E4E0] bg-white px-3 text-xs text-[#666] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30 transition-all"
          >
            <option value="">Auto Route</option>
            {modelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full h-10 pl-4 pr-12 rounded-xl border border-[#F0E4E0] bg-white text-sm text-[#222] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#FF7A6E]/30 focus:border-[#FF7A6E]/50 transition-all"
              disabled={isStreaming}
            />
            <button
              onClick={isStreaming ? () => {} : handleSend}
              disabled={!input.trim() || isStreaming}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#FF7A6E] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#e86a5f] transition-all active:scale-95"
            >
              {isStreaming ? (
                <StopCircle className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-[#888] text-center mt-2">
          Ember AI routes through Fireworks AI · Responses are model-dependent
        </p>
      </div>
    </div>
  );
}
