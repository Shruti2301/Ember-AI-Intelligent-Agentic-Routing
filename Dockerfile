# syntax=docker/dockerfile:1

# Reuse a node image you already have locally to avoid a pull, e.g.
#   docker build --build-arg NODE_IMAGE=node:22 .
# Alpine is the default because it keeps the runtime image small.
ARG NODE_IMAGE=node:22-alpine

# ---------------------------------------------------------------------------
# deps — full dependency tree (dev + prod) used only to build
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# libc6-compat helps native deps on Alpine; a no-op on Debian-based tags.
RUN apk add --no-cache libc6-compat 2>/dev/null || true
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# builder — next build
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat 2>/dev/null || true
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# IMPORTANT: next.config.ts inlines NEXT_PUBLIC_BASE_PATH into the client
# bundle, so the base path is fixed at BUILD time. Setting it only as a
# runtime env var has no effect. Pass "" to serve at the domain root.
ARG NEXT_PUBLIC_BASE_PATH=/emberai
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# prod-deps — runtime-only dependency tree
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat 2>/dev/null || true
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# next.config.ts is TypeScript and `next start` loads the config at boot.
# TypeScript is a devDependency, so keep a copy here rather than betting on
# how this Next version parses a .ts config. ~20MB, cheap insurance.
RUN npm i --no-save typescript

# ---------------------------------------------------------------------------
# runner — what actually ships
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat 2>/dev/null || true

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Mirrors the build arg so the healthcheck below knows where the app is served.
ARG NEXT_PUBLIC_BASE_PATH=/emberai
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# BYOK: no Fireworks key is baked in. Visitors supply their own in Settings.
# sharedKeyAllowed() also refuses an env key in production unless you set
# ALLOW_SHARED_KEY=true, so a stray FIREWORKS_API_KEY cannot be spent by
# anonymous visitors by accident.

COPY --from=prod-deps --chown=node:node /app/node_modules  ./node_modules
COPY --from=builder   --chown=node:node /app/.next         ./.next
COPY --from=builder   --chown=node:node /app/public        ./public
COPY --from=builder   --chown=node:node /app/package.json  ./package.json
COPY --from=builder   --chown=node:node /app/next.config.ts ./next.config.ts

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}${NEXT_PUBLIC_BASE_PATH}/" >/dev/null 2>&1 || exit 1

# exec so next replaces the shell and receives SIGTERM directly.
CMD exec ./node_modules/.bin/next start -H 0.0.0.0 -p ${PORT}
