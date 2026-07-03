"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  DollarSign,
  Zap,
  Activity,
  PieChart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { telemetry } from "@/services/telemetry";
import { formatTokens, formatCost, formatDuration } from "@/lib/utils";
import type { TelemetryEntry } from "@/types";

// Simple Bar Chart component
function BarChart({ data, bars, height = 200 }: {
  data: any[];
  bars: { key: string; color: string; label: string }[];
  height?: number;
}) {
  if (!data.length) return <div className="flex items-center justify-center h-[200px] text-sm text-[#888]">No data yet</div>;
  const maxVal = Math.max(...data.map((d) => Math.max(...bars.map((b) => d[b.key] || 0))), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          {bars.map((b) => {
            const val = d[b.key] || 0;
            const pct = (val / maxVal) * 100;
            return (
              <motion.div
                key={b.key}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                className="w-full rounded-t-sm min-h-[2px]"
                style={{ background: b.color, opacity: 0.8 }}
                title={`${b.label}: ${val}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Simple Pie Chart component
function PieChartView({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <div className="flex items-center justify-center h-[200px] text-sm text-[#888]">No data yet</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ["#FF7A6E", "#FFD89B", "#F6D7D3", "#FF9F8A", "#E8C5C0", "#D4B0A8"];
  let cum = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const slice = { name: d.name, pct, offset: cum, color: colors[i % colors.length] };
    cum += pct;
    return slice;
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-36 h-36">
        {slices.map((s, i) => {
          const r = 40;
          const circumference = 2 * Math.PI * r;
          const dashLen = s.pct * circumference;
          const dashOff = -s.offset * circumference;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[#666]">{s.name}</span>
            <span className="text-[#888]">{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<TelemetryEntry[]>([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const update = () => setEntries(telemetry.getAll());
    update();
    return telemetry.subscribe(update);
  }, []);

  const stats = telemetry.getStats();
  const timeSeries = telemetry.getTimeSeries();
  const modelBreakdown = telemetry.getModelBreakdown();
  const recentEntries = entries.slice(0, 20);

  const statCards = [
    { label: "Total Requests", value: stats.total.toString(), icon: Activity, color: "from-[#FF7A6E]/10 to-[#FFD89B]/10" },
    { label: "Avg Latency", value: formatDuration(stats.avgLatency), icon: Clock, color: "from-[#F6D7D3]/30 to-transparent" },
    { label: "Total Tokens", value: formatTokens(stats.totalTokens), icon: TrendingUp, color: "from-[#FFD89B]/20 to-transparent" },
    { label: "Total Cost", value: formatCost(stats.totalCost), icon: DollarSign, color: "from-[#FF7A6E]/5 to-[#F6D7D3]/20" },
    { label: "Avg Cache Hit", value: `${stats.avgCache.toFixed(0)}%`, icon: Zap, color: "from-green-50 to-transparent" },
    { label: "Errors", value: stats.errors.toString(), icon: AlertCircle, color: "from-red-50 to-transparent" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222]">Observability</h1>
        <p className="text-sm text-[#888] mt-0.5">Real-time telemetry for all model requests</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white border border-[#F0E4E0] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-[#FF7A6E]" />
                </div>
              </div>
              <div className="text-lg font-bold text-[#222]">{s.value}</div>
              <div className="text-[11px] text-[#888]">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF7A6E]" />
                  Requests Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={timeSeries.slice(-20)}
                  bars={[{ key: "latency", color: "#FF7A6E", label: "Latency" }]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#FF7A6E]" />
                  Model Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartView data={modelBreakdown} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="latency">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latency Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={timeSeries.slice(-30)}
                bars={[{ key: "latency", color: "#FF7A6E", label: "ms" }]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Token Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={timeSeries.slice(-30)}
                bars={[
                  { key: "tokens", color: "#FFD89B", label: "Tokens" },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cost Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={timeSeries.slice(-30)}
                bars={[{ key: "cost", color: "#F6D7D3", label: "Cost" }]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Request History</CardTitle>
          <p className="text-xs text-[#888]">Last {recentEntries.length} requests</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E4E0] text-[#888] text-[11px] uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Time</th>
                  <th className="text-left px-6 py-3 font-medium">Model</th>
                  <th className="text-right px-6 py-3 font-medium">Latency</th>
                  <th className="text-right px-6 py-3 font-medium">Tokens</th>
                  <th className="text-right px-6 py-3 font-medium">Cost</th>
                  <th className="text-center px-6 py-3 font-medium">Cache</th>
                  <th className="text-center px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[#F0E4E0]/50 hover:bg-[#FFF9F5] transition-colors"
                  >
                    <td className="px-6 py-3 text-[#666] text-xs">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {e.model.split("/").pop()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right text-[#666]">
                      {formatDuration(e.latency)}
                    </td>
                    <td className="px-6 py-3 text-right text-[#666]">
                      {formatTokens(e.tokens.total)}
                    </td>
                    <td className="px-6 py-3 text-right text-[#666]">
                      {formatCost(e.estimatedCost)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-xs text-green-600">{e.cacheEstimate.percentage}%</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Badge variant={e.status === "success" ? "success" : "error"} className="text-[10px]">
                        {e.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
                {recentEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sm text-[#888]">
                      No requests yet. Start a conversation in Chat!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
