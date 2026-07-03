# Ember AI

> Fast ideas deserve fast intelligence.

A warm, romantic, minimal AI workspace built with Next.js 15 that demonstrates intelligent model routing, observability, and agentic workflows using **Fireworks AI**.

## Features

- **🧠 AI Chat** — Conversational interface. Every request is intelligently routed to the optimal Fireworks model.
- **🔀 Model Router** — Automatic prompt analysis routes coding to GLM 5.2, math to DeepSeek V4 Pro, simple Q&A to Flash.
- **📊 Observability Dashboard** — Real-time telemetry: latency, tokens, cost, cache estimates, and model usage charts.
- **🤖 Agent Loop Demo** — Autonomous coding agent with live Plan → Generate → Review → Improve → Final execution.
- **⚖️ Model Comparison** — Run one prompt across multiple Fireworks models side-by-side.
- **⚡ Prompt Cache Simulator** — Visualizes cache reuse, tokens saved, and latency improvements.
- **⚙️ Settings** — Bring-your-own Fireworks API key, temperature, max tokens, and routing rules.
- **🔑 BYOK** — Visitors use their own API key (stored in browser). No server-side secrets required for deployment.

## Bring Your Own Key (BYOK)

Ember AI is designed as a **portfolio demo** you can deploy without paying for inference:

1. **You** deploy the app with **no** `FIREWORKS_API_KEY` in production.
2. **Visitors** add their own free Fireworks key in **Settings** (or via the onboarding modal).
3. Keys are stored in **localStorage** and sent with each request — never saved on the server.

For local development, you can optionally set `FIREWORKS_API_KEY` in `.env.local` as a fallback.

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Settings**, and add your Fireworks API key.

Optionally, for dev convenience:

```bash
cp .env.example .env.local
# Add FIREWORKS_API_KEY=fw_your_key_here
```

Get a key at [fireworks.ai](https://app.fireworks.ai/settings/users/api-keys).

### 3. Deploy (GitHub + hosting)

1. Push to GitHub — **do not** commit `.env.local`.
2. Deploy to Vercel, AWS Amplify, or similar.
3. **Do not** set `FIREWORKS_API_KEY` in production env vars (unless you want a shared demo key).
4. Point Route 53 DNS to your host when ready.

4. Point Route 53 DNS to your host when ready.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS v4**
- **Framer Motion**
- **Zustand**
- **Fireworks AI** (OpenAI-compatible API)
- **Lucide Icons**

## Architecture

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
    ├── utils.ts, models.ts, rules.ts
```

## Model Routing

| Category | Target Model | Cost (in/out per Mtok) |
|---|---|---|
| Coding | GLM 5.2 | $1.40 / $4.40 |
| Math / Reasoning | DeepSeek V4 Pro | $1.74 / $3.48 |
| Creative Writing | GLM 5.1 | $1.40 / $4.40 |
| Translation / Summary | DeepSeek V4 Flash | $0.14 / $0.28 |
| General Q&A | DeepSeek V4 Flash | $0.14 / $0.28 |

## Theme

- Background: `#FFF9F5`
- Accent: Warm Coral `#FF7A6E`
- Secondary: Dusty Rose `#F6D7D3`
- Highlight: Soft Gold `#FFD89B`
- Text: `#222222`, Muted: `#888888`

---

Built with ❤️ and [Fireworks AI](https://fireworks.ai).
