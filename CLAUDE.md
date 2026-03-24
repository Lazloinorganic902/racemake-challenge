# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Turborepo monorepo for the RACEMAKE product engineer challenge. Contains a Hono API, two Next.js apps (web + docs scaffolds), and two challenge packages (telemetry analysis).

## Commands

```bash
pnpm install                          # install all deps
pnpm dev                              # run all apps in dev mode (turbo)
pnpm build                            # build all packages
pnpm lint                             # lint all packages
pnpm check-types                      # typecheck all packages
pnpm format                           # prettier format

# API (apps/api)
pnpm --filter api dev                 # dev with watch (bun, port 3000)
pnpm --filter api start               # start with bun
pnpm --filter api start:node          # start with tsx (Node fallback)

# Challenges
pnpm --filter @repo/challenge-easy start      # run easy challenge solution
npx tsx packages/challenge-hard/src/test.ts   # integration test for hard challenge

# Web / Docs
pnpm --filter web dev                 # Next.js on :3000
pnpm --filter docs dev                # Next.js on :3001
```

## Architecture

**Monorepo layout:** `pnpm-workspace.yaml` declares `apps/*` and `packages/*`. Turbo orchestrates build/dev/lint/check-types.

### apps/api
- **Hono v4** server, runs on Bun natively with `@hono/node-server` fallback for Node/Railway deployment.
- Routes in `src/routes/` — `easy.ts`, `hard.ts`, `irl.ts` (SSE streaming), `irl-codec.ts` (binary wire format).
- Exposes OpenAPI spec at `/openapi.json` and Scalar docs UI at `/docs`.
- Imports challenge packages as workspace dependencies (`@repo/challenge-easy`, `@repo/challenge-hard`).
- Deployed to Railway via Dockerfile (`apps/api/Dockerfile`) using Node 20 + tsx (not Bun in container).
- Only env var: `PORT` (defaults to 3000).

### packages/challenge-easy
- Self-contained TypeScript telemetry analysis. Has `original/` (buggy) and `solution/` subdirectories.
- No test framework — validation is inline console.log checks in the runner section.

### packages/challenge-hard
- Hono app that exposes `/ingest`, `/laps`, `/analysis` endpoints for telemetry processing.
- Exports both the Hono app and types via workspace package exports (`.` and `./telemetry`).
- `test.ts` is a hand-rolled integration test (not Jest/Vitest) — starts server, POSTs data, validates responses.

### packages/ui
- React 19 components consumed as raw `.tsx` source (no build step). Wildcard export: `@repo/ui/button`, `@repo/ui/card`, `@repo/ui/code`.

### Shared config packages
- `packages/eslint-config` — ESLint flat configs: `base`, `next-js`, `react-internal`.
- `packages/typescript-config` — tsconfig presets: `base.json`, `nextjs.json`, `react-library.json`.

## Key Patterns

- **No formal test runner** — challenges use inline validation scripts and hand-rolled integration tests.
- **In-memory state only** — no database, no external services, no `.env` files needed.
- **Dual runtime** — API code runs on both Bun (local dev) and Node/tsx (Docker/Railway). Keep imports compatible with both.
- **TypeScript strict mode** with `noUncheckedIndexedAccess` enabled in base tsconfig.
