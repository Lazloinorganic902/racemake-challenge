FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ── Install dependencies ──
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile

# ── Build ──
FROM base AS builder
COPY --from=deps /app/ ./
COPY apps/web/ apps/web/
COPY packages/ui/ packages/ui/
COPY packages/typescript-config/ packages/typescript-config/
COPY packages/eslint-config/ packages/eslint-config/

ARG API_URL
ENV API_URL=$API_URL

RUN pnpm --filter web build

# ── Runtime ──
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Next.js standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
