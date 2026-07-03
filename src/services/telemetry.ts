import type { TelemetryEntry, TokenUsage, CacheEstimate } from "@/types";

class TelemetryStore {
  private entries: TelemetryEntry[] = [];
  private listeners: Set<() => void> = new Set();

  add(entry: Omit<TelemetryEntry, "id" | "timestamp">) {
    const newEntry: TelemetryEntry = {
      ...entry,
      id: `tel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
    };
    this.entries.unshift(newEntry);
    this.notify();
    return newEntry;
  }

  getAll(): TelemetryEntry[] {
    return [...this.entries];
  }

  getRecent(n: number = 10): TelemetryEntry[] {
    return this.entries.slice(0, n);
  }

  clear() {
    this.entries = [];
    this.notify();
  }

  getStats() {
    const total = this.entries.length;
    const totalTokens = this.entries.reduce(
      (s, e) => s + e.tokens.input + e.tokens.output,
      0
    );
    const totalCost = this.entries.reduce((s, e) => s + e.estimatedCost, 0);
    const avgLatency =
      total > 0
        ? this.entries.reduce((s, e) => s + e.latency, 0) / total
        : 0;
    const errors = this.entries.filter((e) => e.status === "error").length;
    const avgCache =
      total > 0
        ? this.entries.reduce((s, e) => s + e.cacheEstimate.percentage, 0) /
          total
        : 0;

    return { total, totalTokens, totalCost, avgLatency, errors, avgCache };
  }

  getTimeSeries() {
    return this.entries
      .slice()
      .reverse()
      .map((e) => ({
        time: e.timestamp.toISOString(),
        latency: e.latency,
        tokens: e.tokens.total,
        cost: e.estimatedCost,
        model: e.model,
      }));
  }

  getModelBreakdown() {
    const breakdown: Record<string, number> = {};
    for (const e of this.entries) {
      breakdown[e.model] = (breakdown[e.model] || 0) + 1;
    }
    return Object.entries(breakdown).map(([name, value]) => ({
      name: name.split("/").pop() || name,
      value,
    }));
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const telemetry = new TelemetryStore();
