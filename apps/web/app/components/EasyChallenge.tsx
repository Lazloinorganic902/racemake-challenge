"use client";

import { useState } from "react";

interface SectorFinding { sector: number; delta: number; issue: string; details: string }
interface LapAnalysis { findings: SectorFinding[]; totalDelta: number }
interface CoachingOutput { problemSector: number; issue: string; timeLost: number; coachingMessage: string }
interface StintTrend { sector: number; issue: string; trend: "worsening" | "stable" | "improving"; deltaProgression: number[] }

interface AnalyzeRes { lap: { totalTime: number }; analysis: LapAnalysis; coaching: CoachingOutput }
interface StintRes { stint: { lapAnalyses: { lapLabel: string; analysis: LapAnalysis; coaching: CoachingOutput }[]; trends: StintTrend[]; stintSummary: string } }
interface DataRes { referenceLap: { totalTime: number } }

const trendColors = { worsening: "text-red-400 bg-red-500/10 border-red-500/20", improving: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", stable: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20" };
const trendArrows = { worsening: "↑", improving: "↓", stable: "→" };

export function EasyChallenge() {
  const [codeView, setCodeView] = useState<"buggy" | "fixed">("buggy");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showStint, setShowStint] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeRes | null>(null);
  const [stintData, setStintData] = useState<StintRes | null>(null);
  const [lapData, setLapData] = useState<DataRes | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (analyzeData) { setShowAnalysis(true); return; }
    setLoading("analyze");
    try {
      const [a, d] = await Promise.all([fetch("/api/v2/easy/analyze"), fetch("/api/v2/easy/data")]);
      setAnalyzeData(await a.json()); setLapData(await d.json()); setShowAnalysis(true);
    } catch (e) { console.error(e); } finally { setLoading(null); }
  };

  const fetchStint = async () => {
    if (stintData) { setShowStint(true); return; }
    setLoading("stint");
    try { const r = await fetch("/api/v2/easy/stint"); setStintData(await r.json()); setShowStint(true); }
    catch (e) { console.error(e); } finally { setLoading(null); }
  };

  const a = analyzeData?.analysis;
  const c = analyzeData?.coaching;
  const s = stintData?.stint;

  return (
    <div className="space-y-4">
      {/* Bug card */}
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Level 1 — Find & fix the bug</span>
          <span className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase border border-red-500/20 bg-red-500/10 text-red-400">Bug</span>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-neutral-400 leading-relaxed">
            The analysis pipeline runs but validation fails. <code className="font-mono text-xs bg-neutral-800/60 border border-neutral-700/50 rounded px-1.5 py-0.5 text-neutral-300">generateCoaching</code> picks <code className="font-mono text-xs bg-neutral-800/60 border border-neutral-700/50 rounded px-1.5 py-0.5 text-neutral-300">findings[0]</code> as the worst sector — but the sort puts the smallest delta first.
          </p>
        </div>
      </div>

      {/* Code tabs + block */}
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex border-b border-neutral-800/50">
          <button onClick={() => setCodeView("buggy")} className={`flex-1 py-3.5 text-xs font-medium tracking-wider uppercase text-center transition-colors ${codeView === "buggy" ? "bg-[#111] text-red-400" : "bg-[#0a0a0a] text-neutral-500 hover:text-neutral-300"}`}>Original (Buggy)</button>
          <button onClick={() => setCodeView("fixed")} className={`flex-1 py-3.5 text-xs font-medium tracking-wider uppercase text-center transition-colors border-l border-neutral-800/50 ${codeView === "fixed" ? "bg-[#111] text-emerald-400" : "bg-[#0a0a0a] text-neutral-500 hover:text-neutral-300"}`}>Fixed</button>
        </div>
        <div className="bg-[#0a0a0a]">
          <div className="flex justify-between px-6 py-3 border-b border-neutral-800/30 text-[11px] tracking-wider uppercase text-neutral-500">
            <span>challenge.ts — analyzeLap()</span>
            <span>{codeView === "buggy" ? "Line 42" : "Line 42 (fixed)"}</span>
          </div>
          <pre className="p-6 font-mono text-[13px] leading-loose text-neutral-400 overflow-x-auto">
            {codeView === "buggy" ? (
              <>{"  // Sort by time lost — worst sector first\n"}<span className="block -mx-6 px-6 bg-red-500/8 text-red-400">{"  findings.sort((a, b) => a.delta - b.delta);"}</span>{"\n  // ↑ ascending sort → smallest delta first\n  // findings[0] is sector 3 (+0.070s) not sector 2 (+1.198s)\n  // generateCoaching picks the wrong sector"}</>
            ) : (
              <>{"  // Sort by time lost — worst sector first\n"}<span className="block -mx-6 px-6 bg-emerald-500/8 text-emerald-400">{"  findings.sort((a, b) => b.delta - a.delta);"}</span>{"\n  // ↑ descending sort → largest delta first\n  // findings[0] is now sector 2 (+1.198s) ✓\n  // One-line fix. Ship it."}</>
            )}
          </pre>
        </div>
      </div>

      {/* Analysis */}
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Live analysis output</span>
          <button onClick={() => showAnalysis ? setShowAnalysis(false) : fetchAnalysis()} disabled={loading === "analyze"}
            className={`rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 transition-colors ${showAnalysis ? "border border-neutral-700 text-neutral-400 hover:text-white" : "bg-white text-black hover:bg-neutral-200"}`}>
            {loading === "analyze" ? "Loading..." : showAnalysis ? "Hide" : "Run Analysis"}
          </button>
        </div>

        {showAnalysis && a && c && lapData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800/30">
              {[
                { v: `${lapData.referenceLap.totalTime.toFixed(3)}s`, l: "Reference", color: "text-neutral-400" },
                { v: `${analyzeData!.lap.totalTime.toFixed(3)}s`, l: "Driver Lap", color: "text-white" },
                { v: `+${a.totalDelta.toFixed(3)}s`, l: "Total Delta", color: "text-red-400" },
                { v: `S${c.problemSector}`, l: "Problem Sector", color: "text-amber-400" },
              ].map((s) => (
                <div key={s.l} className="bg-[#111] px-5 py-5 text-center">
                  <p className={`font-mono text-xl font-semibold tabular-nums mb-1 ${s.color}`}>{s.v}</p>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="p-6 flex flex-col gap-2">
              {a.findings.map((f) => {
                const max = Math.max(...a.findings.map((x) => x.delta));
                const pct = (f.delta / max) * 100;
                const bg = f.delta > 1 ? "bg-red-500" : f.delta > 0.3 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={f.sector} className="flex items-center gap-3">
                    <span className="text-[10px] font-medium tracking-wider text-neutral-500 w-5 shrink-0">S{f.sector}</span>
                    <div className="flex-1 h-7 bg-[#0a0a0a] rounded-lg overflow-hidden">
                      <div className={`h-full ${bg} rounded-lg flex items-center justify-end pr-3 text-[10px] font-semibold text-black min-w-[70px] transition-all duration-500`} style={{ width: `${Math.max(pct, 15)}%` }}>
                        {f.issue.replace("_", " ")}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-red-400 w-16 text-right shrink-0">+{f.delta.toFixed(3)}s</span>
                  </div>
                );
              })}
            </div>
            <div className="mx-6 mb-6 p-5 bg-[#0a0a0a] rounded-xl border border-emerald-500/20 relative">
              <span className="absolute -top-2.5 left-4 text-[10px] font-semibold tracking-widest text-emerald-400 bg-[#111] px-2 uppercase">PitGPT</span>
              <p className="italic text-sm text-neutral-400 leading-relaxed">{c.coachingMessage}</p>
            </div>
          </>
        )}
      </div>

      {/* Stint */}
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Level 2 — Stint analysis</span>
          <button onClick={() => showStint ? setShowStint(false) : fetchStint()} disabled={loading === "stint"}
            className={`rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 transition-colors ${showStint ? "border border-neutral-700 text-neutral-400 hover:text-white" : "bg-white text-black hover:bg-neutral-200"}`}>
            {loading === "stint" ? "Loading..." : showStint ? "Hide" : "Analyze Stint"}
          </button>
        </div>
        {!showStint && (
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-400 leading-relaxed">Two laps from the same stint: Lap 1 (fresh tyres) vs Lap 14 (degraded). Detect how issues evolve as the stint progresses.</p>
          </div>
        )}
        {showStint && s && (
          <>
            <div className="grid grid-cols-2 gap-px bg-neutral-800/30">
              {s.lapAnalyses.map((la) => (
                <div key={la.lapLabel} className="bg-[#111] px-5 py-5">
                  <p className="text-xs font-semibold tracking-wider uppercase text-neutral-300 mb-1">{la.lapLabel}</p>
                  <p className="text-xs text-neutral-500">Delta: <span className="text-red-400">+{la.analysis.totalDelta.toFixed(3)}s</span></p>
                  <p className="text-xs text-neutral-500">Worst: S{la.coaching.problemSector} — {la.coaching.issue.replace("_", " ")}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse min-w-[500px]">
              <thead>
                <tr>
                  {["Sector", "Issue", "Trend", "Lap 1", "Lap 14"].map((h, i) => (
                    <th key={h} className={`${i >= 3 ? "text-right" : "text-left"} px-6 py-3.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                {s.trends.map((t) => (
                  <tr key={t.sector} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-3.5 border-b border-neutral-800/30 font-medium text-neutral-300">S{t.sector}</td>
                    <td className="px-6 py-3.5 border-b border-neutral-800/30">{t.issue.replace("_", " ")}</td>
                    <td className="px-6 py-3.5 border-b border-neutral-800/30">
                      <span className={`rounded-full text-[10px] font-semibold tracking-wider uppercase px-3 py-1 border ${trendColors[t.trend]}`}>
                        {trendArrows[t.trend]} {t.trend}
                      </span>
                    </td>
                    <td className="text-right px-6 py-3.5 border-b border-neutral-800/30 text-red-400 font-mono tabular-nums">+{t.deltaProgression[0]?.toFixed(3)}s</td>
                    <td className="text-right px-6 py-3.5 border-b border-neutral-800/30 text-red-400 font-mono tabular-nums">+{t.deltaProgression[t.deltaProgression.length - 1]?.toFixed(3)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="p-6">
              <div className="p-5 bg-[#0a0a0a] rounded-xl border border-emerald-500/20 relative">
                <span className="absolute -top-2.5 left-4 text-[10px] font-semibold tracking-widest text-emerald-400 bg-[#111] px-2 uppercase">PitGPT</span>
                <p className="italic text-sm text-neutral-400 leading-relaxed">{s.stintSummary}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
