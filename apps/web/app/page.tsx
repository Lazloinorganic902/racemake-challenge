import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { SectionDivider } from "./components/SectionDivider";
import { AboutSection } from "./components/AboutSection";
import { InsightsSection } from "./components/InsightsSection";
import { EasyChallenge } from "./components/EasyChallenge";
import { HardChallenge } from "./components/HardChallenge";
import { IrlStream } from "./components/IrlStream";
import { CodecCompare } from "./components/CodecCompare";
import { CodecPlayground } from "./components/CodecPlayground";
import { RoundtripProof } from "./components/RoundtripProof";

function Badge({ color, children }: { color: "lime" | "danger" | "warn" | "info"; children: React.ReactNode }) {
  const s: Record<string, string> = {
    lime: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    danger: "text-red-400 border-red-500/20 bg-red-500/10",
    warn: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    info: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  };
  return <span className={`rounded-full text-[10px] font-semibold tracking-wider uppercase px-3 py-1 border ${s[color]}`}>{children}</span>;
}

function GridCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-[#111] p-6">
      <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-2">{title}</p>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SectionHeader({ label, labelColor, title, desc }: { label: string; labelColor: string; title: string; desc: string }) {
  return (
    <div className="pt-16 md:pt-20 pb-0">
      <p className={`text-xs font-medium tracking-[0.3em] uppercase ${labelColor} mb-3`}>{label}</p>
      <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-3">{title}</h2>
      <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-[560px] mb-12">{desc}</p>
    </div>
  );
}

function ContentGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800/30 rounded-2xl border border-neutral-800/50 overflow-hidden">{children}</div>;
}

function CardHeader({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50 bg-[#111]">
      <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">{title}</span>
      {badge}
    </div>
  );
}

function PipelineStep({ num, title, desc, done }: { num: number; title: string; desc: string; done?: boolean }) {
  return (
    <div className="flex gap-4 items-start py-4 border-b border-neutral-800/30 last:border-b-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${done ? "bg-emerald-500 text-black" : "border border-neutral-700 text-neutral-600"}`}>
        {done ? "✓" : num}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[13px] font-medium mb-0.5 text-neutral-300">{title}</p>
        <p className="text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}

const archItems = [
  { title: "Stream processing", desc: "Don't buffer sessions. Ingest into a time-series store and compute sector aggregates incrementally via sliding window." },
  { title: "Per-car isolation", desc: "Each car runs in its own worker. A supervisor fans out by car ID. One malformed feed doesn't crash the session." },
  { title: "Reference caching", desc: "The reference lap is immutable mid-session. Compute once, cache, pass an ID to each worker." },
  { title: "Backpressure", desc: "120Hz × 20 cars = 2,400 frames/sec. Drop intermediate frames if coaching can't keep up." },
  { title: "Coaching debounce", desc: "Don't regenerate per-frame. Analyze at sector boundaries or on a 5–10s interval, whichever is longer." },
  { title: "Storage tier", desc: "Hot path: in-memory ring buffer per car. Warm: time-series DB for session history. Cold: object storage for replay." },
];

const implItems = [
  { title: "Boundary interpolation", desc: "At 10Hz, frames are ~3s apart. Sector boundaries are linearly interpolated between frames — snapping to nearest frame would be off by up to 1s." },
  { title: "Out-lap detection", desc: "If the first frame starts at pos > 0.05, it's an out-lap. The car entered the track mid-circuit and the lap is excluded." },
  { title: "Stationary filtering", desc: "Frames with speed < 5 kph and unchanged position are pit or idle data. Filtered before any analysis runs." },
  { title: "Issue classification", desc: "Tyre overheat (>110°C), heavy braking (brk > 0.8 at speed), low throttle (avg < 0.6), inconsistency (speed stddev > 40)." },
];

const optimalApproaches = [
  { title: "Schema Stability", desc: "Runtime resolution over hardcoded offsets — always. Pattern signatures as fallback. Version-tagged schema caches to diff between game versions and auto-detect changes." },
  { title: "Pipeline Resilience", desc: "Protobuf/FlatBuffers for wire format — schema evolution built into the protocol. Canary checks on startup validate known field values before sending garbage downstream." },
  { title: "Staying Ahead", desc: "Build your own extractor. Don't wait for community dumps. Automate: game update detected → inject → extract → diff → PR → deploy. CI for reverse engineering." },
];

const tools = [
  { name: "dezlock-dump", desc: "Runtime RTTI + schema extraction, auto SDK generation, signature scanning across 58+ DLLs", url: "https://github.com/dougwithseismic/dezlock-dump" },
  { name: "s2-framework", desc: "ML bot training via DLL injection + TCP telemetry streaming to Python/PyTorch", url: "https://github.com/dougwithseismic/s2-framework" },
  { name: "memory-hooking-tool", desc: "Process memory R/W with TypeScript scripting. Pattern scanning, PE parsing, full automation layer.", url: "https://github.com/dougwithseismic/memory-hooking-tool" },
  { name: "arc-probe", desc: "AI-agent-driven process inspector. DLL injection, disassembly, struct mapping. Tauri v2 (Rust + React).", url: "https://github.com/vzco/arc-probe" },
];

const projects = [
  {
    name: "s2-framework", subtitle: "Reinforcement Learning Platform",
    badges: [["C++", "lime"], ["Rust", "warn"], ["Python", "info"]] as [string, "lime" | "warn" | "info"][],
    desc: "Spins up Counter-Strike matches at 20x speed to build complex bots powered by a self-improving model with an LLM pilot. C++, Rust, Python, React — including Tauri overlays with a shared-memory approach to live data. The exact inject-extract-stream pattern that applies to racing telemetry.",
    links: [
      { label: "Source Code", url: "https://github.com/dougwithseismic/s2-framework" },
      { label: "Video Demo", url: "https://www.youtube.com/watch?v=Cj94lSUH5io" },
    ],
  },
  {
    name: "arc-probe", subtitle: "AI-Agent Process Inspector",
    badges: [["Rust", "warn"], ["React", "info"]] as [string, "warn" | "info"][],
    desc: <>Built to hook into thousands of games and build data pipelines for esports, game assist tools, and patches/mods. DLL injection, disassembly, and struct mapping — all controllable via AI agent skills. Tauri v2 app. Used by the team at <a href="https://wand.com" target="_blank" rel="noopener noreferrer" className="text-white border-b border-neutral-600 hover:border-neutral-400 transition-colors">wand.com</a> (WeMod).</>,
    links: [{ label: "Source Code", url: "https://github.com/vzco/arc-probe" }],
  },
  {
    name: "dezlock-dump", subtitle: "Runtime Schema Extraction",
    badges: [["C++", "lime"]] as [string, "lime"][],
    desc: "Runtime RTTI and schema extraction for Source 2 games. Auto-generates typed C++ headers (2,400+ structs, 229 entity classes), complete JSON exports, and signature scanning across 58+ DLLs. The foundation that makes patch-proof telemetry pipelines possible.",
    links: [{ label: "Source Code", url: "https://github.com/dougwithseismic/dezlock-dump" }],
  },
];

const API_DOCS_URL = "https://racemake-challenge-production.up.railway.app/docs";

export default function Home() {
  const apiUrl = process.env.API_URL || "";
  const streamUrl = apiUrl ? `${apiUrl}/api/v2/irl/stream` : "/api/v2/irl/stream";

  return (
    <main className="bg-black">
      {/* ── HERO ── */}
      <div className="app-hero-wrapper relative overflow-hidden">
        {/* BG layer 0: solid fill */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: "#FBFDFD" }} />

        {/* BG layer 1: video */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[55%] z-[1] opacity-30 md:opacity-100">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="video-plus-darker w-full h-full object-cover object-top"
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131232_feeda0b7-d00d-4bfa-a9d5-5d38648a4214.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Content layer */}
        <div className="relative z-[2] min-h-screen md:h-screen flex flex-col">
          <Navbar />
          <HeroSection />
        </div>

        {/* Diagonal divider */}
        <SectionDivider />
      </div>

      {/* ── ABOUT ── */}
      <AboutSection />

      {/* ── INSIGHTS (Tabbed) ── */}
      <InsightsSection />

      {/* ── CHALLENGE SECTIONS ── */}
      <div style={{ backgroundColor: "#0F0F0F" }}>
        {/* ── Challenge 1 ── */}
        <section id="easy" className="border-b border-neutral-800/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <SectionHeader label="Challenge 1 — Easy" labelColor="text-emerald-400" title="Telemetry Analysis Pipeline" desc="Sector-level analysis comparing driver laps against a reference. Three levels: fix a bug, extend to stint analysis, think about scale." />
            <EasyChallenge />
          </div>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-16 mt-4">
            <div className="rounded-t-2xl border border-b-0 border-neutral-800/50 bg-[#111]">
              <CardHeader title="Level 3 — What breaks at scale" badge={<Badge color="info">Architecture</Badge>} />
            </div>
            <ContentGrid>{archItems.map((i) => <GridCard key={i.title} {...i} />)}</ContentGrid>
          </div>
        </section>

        {/* ── Challenge 2 ── */}
        <section id="hard" className="border-b border-neutral-800/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <SectionHeader label="Challenge 2 — Hard" labelColor="text-amber-400" title="Raw Telemetry API" desc="Three API endpoints from raw 10Hz telemetry. Ingest, compute lap summaries with sector splits, generate coaching — handling edge cases." />
            <HardChallenge />
          </div>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-16 mt-4">
            <div className="rounded-t-2xl border border-b-0 border-neutral-800/50 bg-[#111]">
              <CardHeader title="Implementation" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800/30 rounded-b-2xl border border-neutral-800/50 border-t-0 overflow-hidden">
              {implItems.map((i) => <GridCard key={i.title} {...i} />)}
            </div>
          </div>
        </section>

        {/* ── Architecture ── */}
        <section id="architecture" className="border-b border-neutral-800/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <SectionHeader label="Beyond the Challenge" labelColor="text-blue-400" title="Production Architecture" desc="The API includes a working IRL section with streaming telemetry, a binary wire format codec, and a versioned schema registry. Everything below is interactive — hit the buttons." />
            <ContentGrid>
              {[
                { title: "SSE Streaming", badge: <Badge color="lime">Live</Badge>, desc: "Real-time telemetry replay via Server-Sent Events with incremental sector analysis and coaching at sector boundaries." },
                { title: "Binary Codec", badge: <Badge color="warn">v1 + v2</Badge>, desc: "v1: fixed 19-byte frames vs ~131 bytes JSON — 85% reduction. v2: delta-encoded at ~6 bytes avg. Lossless roundtrip." },
                { title: "Schema Registry", badge: <Badge color="info">Versioned</Badge>, desc: "Runtime schema extraction maps telemetry fields to binary positions. Forward-compatible — new fields don't break old decoders." },
              ].map((i) => (
                <div key={i.title} className="bg-[#111] p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">{i.title}</p>
                    {i.badge}
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">{i.desc}</p>
                </div>
              ))}
            </ContentGrid>
          </div>

          {/* Live SSE Stream */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6">
            <IrlStream streamUrl={streamUrl} />
          </div>

          {/* Codec Comparison */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-4">
            <CodecCompare />
          </div>

          {/* Encode / Decode Playground */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-4">
            <CodecPlayground />
          </div>

          {/* Roundtrip Proof */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-4 pb-16">
            <RoundtripProof />
          </div>
        </section>

        {/* ── IRL: Reverse Engineering ── */}
        <section id="irl" className="border-b border-neutral-800/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <SectionHeader label="IRL Challenge" labelColor="text-emerald-400" title="Reverse Engineering & Telemetry Pipelines" desc='The job listing says "debug and fix telemetry format changes from game updates rapidly." Here&apos;s how I&apos;d actually do it — and have been doing it.' />
          </div>

          {/* Problem / Solution */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-4">
            <div className="rounded-2xl border border-neutral-800/50 bg-[#111] p-6">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-600 mb-3">The Problem</p>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Sim racing telemetry is extracted from game memory or APIs. When the game patches, offsets shift, structs change, and your pipeline breaks. The community waits for someone to reverse-engineer the new offsets. That wait kills your product.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800/50 bg-[#111] p-6">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 mb-3">The Solution: Runtime Schema Extraction</p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-5">
                I built this exact system for Source 2 games. Instead of hardcoding offsets that break every patch:
              </p>
              <div className="flex flex-col">
                <PipelineStep num={1} title="Inject at runtime" desc="Manual PE mapping (no LoadLibrary, invisible to module list). DLL hooks into the game process via vtable interception." done />
                <PipelineStep num={2} title="Extract the schema from the game itself" desc="Source 2 exposes its own SchemaSystem at runtime. Walk it programmatically to dump every class, field, offset, and inheritance chain." done />
                <PipelineStep num={3} title="Generate a patch-proof SDK" desc="Field offsets resolve dynamically at runtime through the schema, not through hardcoded values. When the game patches, the schema changes — but the resolution mechanism doesn't." done />
                <PipelineStep num={4} title="Ship it downstream" desc="The extracted schema feeds directly into SDK generators, producing typed C++ headers (2,400+ structs, 229 entity classes) and complete JSON exports." done />
              </div>
            </div>
          </div>

          {/* Applied to racing */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-t-2xl border border-neutral-800/50 bg-[#0a0a0a] overflow-hidden">
              <div className="flex justify-between px-6 py-3.5 border-b border-neutral-800/30 text-[11px] tracking-wider uppercase text-neutral-500">
                <span>Applied to Racing Telemetry</span><span>Same Pattern</span>
              </div>
              <pre className="p-6 font-mono text-[13px] text-emerald-400 overflow-x-auto">
{`Game Process → DLL Injection → Schema Extraction → Typed SDK → Telemetry Pipeline → Analysis`}</pre>
            </div>
            <ContentGrid>
              <GridCard title="Game update drops" desc="Run the schema extractor — new offsets in minutes, not days." />
              <GridCard title="Telemetry format changes" desc="The SDK regenerates automatically, typed against the game's own definitions." />
              <GridCard title="New data fields appear" desc="They show up in the schema dump before anyone documents them." />
            </ContentGrid>
          </div>

          {/* Tooling table */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
              <CardHeader title="Tooling — Built from scratch" badge={<Badge color="lime">Open Source</Badge>} />
              <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-3.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50">Tool</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50">What it does</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50">Link</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-400">
                  {tools.map((t) => (
                    <tr key={t.name} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-3.5 border-b border-neutral-800/30 text-white font-medium">{t.name}</td>
                      <td className="px-6 py-3.5 border-b border-neutral-800/30">{t.desc}</td>
                      <td className="px-6 py-3.5 border-b border-neutral-800/30"><a href={t.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">GitHub</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Optimal Approaches */}
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6 pb-16">
            <div className="rounded-t-2xl border border-b-0 border-neutral-800/50 bg-[#111]">
              <CardHeader title="Optimal Approaches" badge={<Badge color="info">Production</Badge>} />
            </div>
            <ContentGrid>{optimalApproaches.map((i) => <GridCard key={i.title} {...i} />)}</ContentGrid>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section id="portfolio" className="border-b border-neutral-800/30">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <SectionHeader label="Previous Work" labelColor="text-amber-400" title="Relevant Projects" desc="Gaming tools, reverse engineering, and AI — the intersection where I've been building for the last few years." />
          </div>

          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-16">
            <div className="flex flex-col gap-4">
              {projects.map((p) => (
                <div key={p.name} className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-neutral-800/30 gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.subtitle}</p>
                    </div>
                    <div className="flex gap-2">{p.badges.map(([label, color]) => <Badge key={label} color={color}>{label}</Badge>)}</div>
                  </div>
                  <div className="px-6 py-6">
                    <p className="text-sm text-neutral-400 leading-relaxed mb-5">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.links.map((l) => (
                        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                          className="rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Challenge callout */}
            <div className="mt-6 rounded-2xl bg-[#0a0a0a] border border-emerald-500/20 p-6 relative">
              <span className="absolute -top-2.5 left-5 text-[10px] font-semibold tracking-widest text-emerald-400 bg-[#0F0F0F] px-2 uppercase">Open Challenge</span>
              <p className="text-[15px] text-neutral-400 leading-relaxed italic">
                Give me a race sim title on Steam — I&apos;ll build the entire data pipeline, storage, API layer, realtime overlay, and fullstack React app from scratch.
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-16 text-center">
          <p className="text-xs tracking-wider text-neutral-600">
            Built by{" "}
            <a href="https://github.com/dougwithseismic" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">dougwithseismic</a>
          </p>
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 rounded-full text-xs font-medium tracking-wider uppercase px-6 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            API Documentation
          </a>
        </footer>
      </div>
    </main>
  );
}
