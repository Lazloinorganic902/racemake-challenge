<p align="center">
  <img src="https://img.shields.io/badge/RACEMAKE-Product_Engineer_Challenge-000?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Bun-000?style=flat-square&logo=bun&logoColor=white" />
  <img src="https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=000" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-000?style=flat-square&logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Prague-CZ-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Experience-15+_years-333?style=flat-square" />
  <img src="https://img.shields.io/badge/Exits-3_founded_&_sold-333?style=flat-square" />
</p>

---

## Structure

Turborepo monorepo. Each challenge is a self-contained package.

```
packages/
  challenge-easy/   # Telemetry analysis pipeline — bug fix, stint extension, scaling answer
  challenge-hard/   # Bun/Hono API — ingest, laps, analysis endpoints
```

### Quick Start

```bash
pnpm install

# Easy challenge — runs analysis, prints all 3 levels
pnpm --filter @repo/challenge-easy start

# Hard challenge — starts API server on :3111
pnpm --filter @repo/challenge-hard start

# Hard challenge — integration test (Node/tsx)
npx tsx packages/challenge-hard/src/test.ts
```

---

## Challenge Solutions

### Easy — `@repo/challenge-easy`

**Level 1 (Fix it):** The sort comparator in `analyzeLap` was `a.delta - b.delta` — ascending. Since `generateCoaching` picks `findings[0]` as the worst sector, it was returning the *least* time lost instead of the most. Fix: `b.delta - a.delta`. One-line diff.

**Level 2 (Extend it):** Added `analyzeStint()` that runs `analyzeLap` for each driver lap and detects sector-level trends across the stint. Tracks delta progression per sector, classifies trends as worsening/stable/improving, and generates a PitGPT stint summary that catches compensation patterns (e.g., early lifts masking traction loss from degraded tyres).

**Level 3 (Think about it):** See the comment block in `challenge.ts`. TL;DR — memory dies first at 20 cars x 50 laps x 120 Hz. Stream-process into a time-series store, isolate per-car in workers, add backpressure, debounce coaching at sector boundaries.

### Hard — `@repo/challenge-hard`

Three endpoints built on Hono:

| Endpoint | What it does |
|---|---|
| `POST /ingest` | Accepts raw telemetry frames, stores in memory |
| `GET /laps` | Returns completed lap summaries with sector splits, speed metrics |
| `GET /analysis` | Compares laps, finds worst sector of worst lap, detects issue, returns PitGPT coaching |

Edge cases handled:
- **Out-lap excluded** — lap 0 starts at pos 0.541, not from the start/finish line
- **Incomplete lap excluded** — lap 4 only has S1 data
- **Stationary frames filtered** — speed < 5 with unchanged position
- **Issue detection** — tyre overheat (>110C) correctly identified in lap 3 S2

---

## IRL Challenge: Reverse Engineering & Telemetry Pipelines

> The job listing says *"Debug and fix telemetry format changes from game updates rapidly."*
> Here's how I'd actually do it — and have been doing it.

### The Problem

Sim racing telemetry is extracted from game memory or APIs. When the game patches, offsets shift, structs change, and your pipeline breaks. The community waits for someone to reverse-engineer the new offsets. That wait kills your product.

### The Solution: Runtime Schema Extraction

I built this exact system for Source 2 games. Instead of hardcoding offsets that break every patch:

1. **Inject at runtime** — Manual PE mapping (no LoadLibrary, invisible to module list). DLL hooks into the game process via vtable interception.

2. **Extract the schema from the game itself** — Source 2 exposes its own `SchemaSystem` at runtime. Walk it programmatically to dump every class, field, offset, and inheritance chain. The game *tells you* its own structure.

3. **Generate a patch-proof SDK** — Field offsets resolve dynamically at runtime through the schema, not through hardcoded values. When the game patches, the schema changes — but the resolution mechanism doesn't. Zero manual work.

4. **Ship it downstream** — The extracted schema feeds directly into SDK generators, producing typed C++ headers (2,400+ structs, 229 entity classes) and complete JSON exports for tooling consumers.

This is what [dezlock-dump](https://github.com/dougwithseismic/dezlock-dump) does. 82 commits, built from scratch.

### Applied to Racing Telemetry

The pattern is identical for sim racing:

```
Game Process -> DLL Injection -> Schema Extraction -> Typed SDK -> Telemetry Pipeline -> Analysis
```

For RACEMAKE's stack specifically:

- **Game update drops** -> Run the schema extractor -> New offsets in minutes, not days
- **Telemetry format changes** -> The SDK regenerates automatically, typed against the game's own definitions
- **New data fields appear** -> They show up in the schema dump before anyone documents them

### Staying Current: Offsets & Dumps

The key insight: you don't reverse-engineer offsets manually anymore. You build systems that extract them. Relevant tooling:

| Tool | What it does | Repo |
|---|---|---|
| **dezlock-dump** | Runtime RTTI + schema extraction, auto SDK generation, signature scanning across 58+ DLLs | [Link](https://github.com/dougwithseismic/dezlock-dump) |
| **s2-framework** | ML bot training via DLL injection + TCP telemetry streaming to Python/PyTorch. The exact inject-extract-stream pattern. | [Link](https://github.com/dougwithseismic/s2-framework) |
| **memory-hooking-tool** | Process memory R/W with TypeScript scripting. Pattern scanning, PE parsing, full automation layer. | [Link](https://github.com/dougwithseismic/memory-hooking-tool) |
| **arc-probe** | AI-agent-driven process inspector. DLL injection, disassembly, struct mapping — all controllable via Claude Code skills. Tauri v2 app (Rust + React). | [Link](https://github.com/vzco/arc-probe) |

### Optimal Approaches

**For schema stability:**
- Runtime resolution over hardcoded offsets. Always.
- Pattern signatures (byte sequences) as fallback — they survive minor patches where full schema extraction isn't available.
- Version-tagged schema caches so you can diff between game versions and auto-detect what changed.

**For pipeline resilience:**
- Protobuf/flatbuffers for wire format — schema evolution is built into the protocol.
- The recorder (Tauri/Rust side) should be schema-aware, not just dumping raw bytes. If a field moves, the recorder adapts.
- Canary checks: on game startup, validate a handful of known field values against expected ranges. If they're wrong, the schema shifted — alert before sending garbage downstream.

**For staying ahead of the community:**
- Build your own extractor. Don't wait for community dumps.
- Automate the dump pipeline: game update detected -> inject -> extract -> diff -> PR -> deploy. CI for reverse engineering.
- Monitor game beta branches — schema changes usually land there first.

---

<p align="center">
  <a href="https://github.com/dougwithseismic">github.com/dougwithseismic</a>
</p>
