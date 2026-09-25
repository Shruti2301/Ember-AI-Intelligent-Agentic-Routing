import type { TokenUsage, CacheEstimate } from "@/types";
import { analyzeCache } from "./cacheEstimator";
import { sharedKeyAllowed } from "@/lib/apiKey";
import { FIREWORKS_MODELS } from "@/lib/models";

const BASE_URL = process.env.FIREWORKS_BASE_URL || "https://api.fireworks.ai/inference/v1";

export interface FireworksCompletionParams {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey: string;
}

function resolveApiKey(apiKey?: string): string {
  const provided = apiKey?.trim();
  const fallback = sharedKeyAllowed() ? process.env.FIREWORKS_API_KEY?.trim() : "";
  const key = provided || fallback || "";
  if (!key) {
    throw new Error("Fireworks API key required. Add your key in Settings.");
  }
  return key;
}

export interface FireworksCompletionResult {
  content: string;
  tokens: TokenUsage;
  latency: number;
  cacheEstimate: CacheEstimate;
  cost: number;
}

function estimateCost(model: string, tokens: TokenUsage): number {
  const m = FIREWORKS_MODELS.find((x) => x.id === model);
  const p = m ? { input: m.inputPrice, output: m.outputPrice } : { input: 1.0, output: 3.0 };
  const inputCost = (tokens.input / 1_000_000) * p.input;
  const outputCost = (tokens.output / 1_000_000) * p.output;
  return inputCost + outputCost;
}

export async function complete(params: FireworksCompletionParams): Promise<FireworksCompletionResult> {
  const start = performance.now();
  const apiKey = resolveApiKey(params.apiKey);

  const fullPrompt = params.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const cacheEstimate = analyzeCache(fullPrompt);

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fireworks API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const latency = performance.now() - start;
    const content = data.choices?.[0]?.message?.content || "";

    const tokens: TokenUsage = {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
      total: (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0),
    };

    const cost = estimateCost(params.model, tokens);

    return { content, tokens, latency, cacheEstimate: cacheEstimate.estimate, cost };
  } catch (error) {
    const latency = performance.now() - start;
    throw error;
  }
}

export async function* completeStream(params: FireworksCompletionParams): AsyncGenerator<string> {
  const apiKey = resolveApiKey(params.apiKey);

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fireworks API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {}
    }
  }
}
