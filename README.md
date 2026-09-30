<div align="center">

# 🔥 Ember AI

**Fast ideas deserve fast intelligence.**

A warm, minimal AI workspace that demonstrates intelligent model routing, observability, and agentic workflows — built on [Fireworks AI](https://fireworks.ai).

[![Live Demo](https://img.shields.io/badge/demo-live-FF7A6E?style=for-the-badge)](https://shrutimandaokar.com/emberai)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fireworks AI](https://img.shields.io/badge/Fireworks%20AI-OpenAI--compatible-FFD89B?style=flat-square)](https://fireworks.ai)

[**Live Demo**](https://shrutimandaokar.com/emberai) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [Model Routing](#-model-routing)

</div>

---

## What is this?

Ember AI is a portfolio-grade AI workspace, not just a chat wrapper. It routes every prompt to the Fireworks model best suited for it, tracks the cost/latency tradeoff of that decision in real time, and runs a visible agent loop (plan → generate → review → improve) instead of hiding the reasoning behind a spinner.

## ✨ Features

| | |
|---|---|
| 🧠 **AI Chat** | Conversational interface — every request is intelligently routed to the optimal Fireworks model |
| 🔀 **Model Router** | Automatic prompt analysis routes coding to GLM 5.2, math to DeepSeek V4 Pro, simple Q&A to Flash |
| 📊 **Observability Dashboard** | Real-time telemetry: latency, tokens, cost, cache estimates, model usage charts |
| 🤖 **Agent Loop Demo** | Autonomous coding agent with a live Plan → Generate → Review → Improve → Final trace |
| ⚖️ **Model Comparison** | Run one prompt across multiple Fireworks models side-by-side |
| ⚡ **Prompt Cache Simulator** | Visualizes cache reuse, tokens saved, and latency improvements |
| ⚙️ **Settings** | Bring-your-own Fireworks API key, temperature, max tokens, routing rules |
| 🔑 **BYOK** | Visitors use their own API key, stored in-browser — no server-side secrets required |

## 🔑 Bring Your Own Key (BYOK)

Ember AI is designed as a **zero-inference-cost portfolio demo**:

1. **You** deploy the app with no `FIREWORKS_API_KEY` in production.
2. **Visitors** add their own free Fireworks key in Settings (or the onboarding modal).
3. Keys live in `localStorage` and are sent per-request — never persisted server-side.

For local dev, you can set `FIREWORKS_API_KEY` in `.env.local` as a fallback so you don't have to paste a key every time.

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Run locally
npm run dev
```

Open [localhost:3000](http://localhost:3000), go to **Settings**, and add your Fireworks API key — get one free at [fireworks.ai](https://app.fireworks.ai/settings/users/api-keys).

Or, for local convenience:

```bash
cp .env.example .env.local
# then set FIREWORKS_API_KEY=fw_your_key_here
```

### Deploy

1. Push to GitHub — **don't** commit `.env.local`.
2. Deploy to Vercel, AWS Amplify, or similar.
3. Leave `FIREWORKS_API_KEY` unset in production (unless you want a shared demo key footing the bill).
4. Point your DNS (e.g. Route 53) at the host once it's live.

## 🧱 Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── (app)/                # App routes (with sidebar)
│   │   ├── chat/             # AI Chat
│   │   ├── dashboard/        # Observability
│   │   ├── router/           # Model Router
│   │   ├── agent-loop/       # Agent Loop Demo
│   │   ├── comparison/       # Model Comparison
│   │   └── settings/         # Settings
│   └── api/
│       ├── chat/             # Chat completion
│       ├── chat/stream/      # Streaming chat
│       ├── router/           # Routing logic
│       ├── observability/    # Telemetry
│       └── models/           # Models catalog
├── components/
│   ├── ui/                   # UI primitives
│   └── Sidebar.tsx           # App navigation
├── services/
│   ├── fireworks.ts          # Fireworks API client
│   ├── router.ts             # Prompt routing
│   ├── telemetry.ts          # Telemetry store
│   └── cacheEstimator.ts     # Cache estimation
├── store/
│   └── useChatStore.ts       # Zustand state
├── types/
│   └── index.ts              # TypeScript types
└── lib/
    └── utils.ts, models.ts, rules.ts
```

## 🔀 Model Routing

| Category | Target Model | Cost (in / out per Mtok) |
|---|---|---|
| Coding | GLM 5.2 | $1.40 / $4.40 |
| Math / Reasoning | DeepSeek V4 Pro | $1.74 / $3.48 |
| Creative Writing | GLM 5.1 | $1.40 / $4.40 |
| Translation / Summary | DeepSeek V4 Flash | $0.14 / $0.28 |
| General Q&A | DeepSeek V4 Flash | $0.14 / $0.28 |

## 🛠️ Tech Stack

`Next.js 15` · `TypeScript` · `TailwindCSS v4` · `Framer Motion` · `Zustand` · `Fireworks AI (OpenAI-compatible)` · `Lucide Icons`

## 🎨 Theme

| | |
|---|---|
| Background | `#FFF9F5` |
| Accent — Warm Coral | `#FF7A6E` |
| Secondary — Dusty Rose | `#F6D7D3` |
| Highlight — Soft Gold | `#FFD89B` |
| Text / Muted | `#222222` / `#888888` |

---

<div align="center">

Built with ❤️ and [Fireworks AI](https://fireworks.ai)

</div>
