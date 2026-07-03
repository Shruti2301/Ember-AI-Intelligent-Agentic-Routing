import type { CacheEstimate } from "@/types";

interface CacheAnalysis {
  staticBlocks: string[];
  dynamicBlocks: string[];
  estimate: CacheEstimate;
}

export function analyzeCache(prompt: string): CacheAnalysis {
  // System prompt prefixes that are typically cached
  const staticPatterns = [
    "You are a helpful assistant",
    "You are an expert",
    "You are a coding assistant",
    "System:",
    "Instructions:",
    "Follow the following",
    "You are a",
    "Your task is",
    "Role:",
  ];

  const staticBlocks: string[] = [];
  const dynamicBlocks: string[] = [];
  const lines = prompt.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isStatic = staticPatterns.some((p) =>
      trimmed.toLowerCase().startsWith(p.toLowerCase())
    );
    if (isStatic) {
      staticBlocks.push(trimmed);
    } else {
      dynamicBlocks.push(trimmed);
    }
  }

  const staticChars = staticBlocks.reduce((a, b) => a + b.length, 0);
  const dynamicChars = dynamicBlocks.reduce((a, b) => a + b.length, 0);
  const total = staticChars + dynamicChars || 1;

  // Estimate cache percentage based on ratio of static to dynamic content
  const ratio = staticChars / total;
  const percentage = Math.min(Math.round(ratio * 100), 80); // Cap at 80% for realism

  const tokensSaved = Math.round((ratio * (total / 4)) * (percentage / 100));
  const latencyImprovement = Math.min(percentage * 0.6, 60); // Max 60% improvement

  const estimate: CacheEstimate = {
    percentage: Math.max(percentage, 5),
    tokensSaved: Math.max(tokensSaved, 1),
    latencyImprovement: Math.max(latencyImprovement, 1),
  };

  return { staticBlocks, dynamicBlocks, estimate };
}

export function formatCacheEstimate(estimate: CacheEstimate): string {
  return `${estimate.percentage}% cache hit · ~${estimate.tokensSaved} tokens saved · ${estimate.latencyImprovement.toFixed(0)}% faster`;
}
