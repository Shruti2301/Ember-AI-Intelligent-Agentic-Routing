import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, RouteDecision, TelemetryEntry, AgentLoop, AppSettings, ComparisonResult, RouterRule } from "@/types";
import { DEFAULT_ROUTING_RULES } from "@/lib/rules";
import { RETIRED_MODELS } from "@/lib/models";

// Rules saved before a model remap still name the old models. Built-in rules
// the user never edited take the new default; anything else keeps the user's
// choice, swapped to the replacement if that model was retired.
function migrateRules(rules: RouterRule[]): RouterRule[] {
  return rules.map((r) => {
    const d = DEFAULT_ROUTING_RULES.find((x) => x.id === r.id);
    if (d && d.pattern === r.pattern) return { ...r, model: d.model };
    return { ...r, model: RETIRED_MODELS[r.model] ?? r.model };
  });
}

interface ChatStore {
  // Chat
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
  currentRoute: RouteDecision | null;
  setCurrentRoute: (r: RouteDecision | null) => void;

  // Telemetry
  telemetryEntries: TelemetryEntry[];
  setTelemetryEntries: (entries: TelemetryEntry[]) => void;
  addTelemetryEntry: (entry: TelemetryEntry) => void;

  // Agent Loop
  agentLoops: AgentLoop[];
  currentAgentLoop: AgentLoop | null;
  setCurrentAgentLoop: (loop: AgentLoop | null) => void;
  updateAgentStep: (loopId: string, stepId: string, data: Partial<AgentLoop["steps"][0]>) => void;
  addAgentLoop: (loop: AgentLoop) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateRoutingRules: (rules: RouterRule[]) => void;
  hasApiKey: () => boolean;

  // Comparison
  comparisonResults: ComparisonResult[];
  setComparisonResults: (results: ComparisonResult[]) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultSettings: AppSettings = {
  fireworksApiKey: "",
  temperature: 0.7,
  maxTokens: 2048,
  darkMode: false,
  routingRules: DEFAULT_ROUTING_RULES,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      currentRoute: null,
      telemetryEntries: [],
      agentLoops: [],
      currentAgentLoop: null,
      comparisonResults: [],
      sidebarOpen: true,

      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          if (last && last.role === "assistant") {
            msgs[msgs.length - 1] = { ...last, content };
          }
          return { messages: msgs };
        }),
      setStreaming: (v) => set({ isStreaming: v }),
      clearMessages: () => set({ messages: [] }),
      setCurrentRoute: (r) => set({ currentRoute: r }),

      setTelemetryEntries: (entries) => set({ telemetryEntries: entries }),
      addTelemetryEntry: (entry) =>
        set((s) => ({ telemetryEntries: [entry, ...s.telemetryEntries] })),

      setCurrentAgentLoop: (loop) => set({ currentAgentLoop: loop }),
      addAgentLoop: (loop) => set((s) => ({ agentLoops: [...s.agentLoops, loop] })),
      updateAgentStep: (loopId, stepId, data) =>
        set((s) => ({
          agentLoops: s.agentLoops.map((l) =>
            l.id === loopId
              ? {
                  ...l,
                  steps: l.steps.map((st) =>
                    st.id === stepId ? { ...st, ...data } : st
                  ),
                }
              : l
          ),
          currentAgentLoop:
            s.currentAgentLoop?.id === loopId
              ? {
                  ...s.currentAgentLoop,
                  steps: s.currentAgentLoop.steps.map((st) =>
                    st.id === stepId ? { ...st, ...data } : st
                  ),
                }
              : s.currentAgentLoop,
        })),

      settings: defaultSettings,
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      updateRoutingRules: (rules) =>
        set((s) => ({ settings: { ...s.settings, routingRules: rules } })),
      hasApiKey: () => Boolean(get().settings.fireworksApiKey.trim()),

      setComparisonResults: (results) => set({ comparisonResults: results }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "ember-ai-storage",
      version: 1,
      partialize: (state) => ({ settings: state.settings }),
      migrate: (persisted, version) => {
        const state = persisted as { settings?: AppSettings };
        if (version < 1 && state?.settings?.routingRules) {
          state.settings.routingRules = migrateRules(state.settings.routingRules);
        }
        return state as unknown as ChatStore;
      },
    }
  )
);
