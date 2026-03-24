"use client";

import { useState } from "react";

interface LapSummary { lapNumber: number; lapTime: number; sectors: { sector: number; time: number }[]; avgSpeed: number; maxSpeed: number }
interface AnalysisResult { bestLap: { lapNumber: number; lapTime: number }; worstLap: { lapNumber: number; lapTime: number; delta: number }; problemSector: number; issue: string; coachingMessage: string }

export function HardChallenge() {
  const [step, setStep] = useState(0);
  const [laps, setLaps] = useState<LapSummary[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawData, setRawData] = useState<{ frames: number; source: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/v2/hard/data"); const data = await d.json();
      setRawData({ frames: data.frames, source: data.source });
      const l = await fetch("/api/v2/hard/laps"); setLaps(await l.json()); setStep(1);
      const a = await fetch("/api/v2/hard/analysis"); setAnalysis(await a.json()); setStep(2);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const advance = async () => {
    setLoading(true);
    try {
      if (step === 0) {
        const d = await fetch("/api/v2/hard/data"); const data = await d.json();
        setRawData({ frames: data.frames, source: data.source });
        const l = await fetch("/api/v2/hard/laps"); setLaps(await l.json()); setStep(1);
      } else if (step === 1) {
        const a = await fetch("/api/v2/hard/analysis"); setAnalysis(await a.json()); setStep(2);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const steps = [
    { title: "POST /ingest", desc: "Raw 10Hz telemetry frames — unfiltered, edge cases baked in." },
    { title: "GET /laps", desc: "Filter, exclude out-laps and incomplete laps, compute sector splits." },
    { title: "GET /analysis", desc: "Compare laps, find worst sector, detect issue, generate coaching." },
  ];

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Telemetry Pipeline</span>
          <div className="flex gap-2">
            {step === 2 ? (
              <button onClick={() => { setStep(0); setLaps(null); setAnalysis(null); setRawData(null); }} className="rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white transition-colors">Reset</button>
            ) : step === 0 && !rawData ? (
              <>
                <button onClick={run} disabled={loading} className="rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">{loading ? "Processing..." : "Run Full Pipeline"}</button>
                <button onClick={advance} disabled={loading} className="rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 border border-neutral-700 text-neutral-400 hover:text-white transition-colors">Step →</button>
              </>
            ) : (
              <button onClick={advance} disabled={loading} className="rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">{loading ? "Processing..." : "Next Step →"}</button>
            )}
          </div>
        </div>
        <div className="px-6 py-5">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start py-3.5 border-b border-neutral-800/30 last:border-b-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${i < step ? "bg-emerald-500 text-black" : i === step ? "border-2 border-emerald-500 text-emerald-400" : "border border-neutral-700 text-neutral-600"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <div>
                <p className={`font-mono text-[13px] font-medium mb-0.5 ${i === step ? "text-white" : "text-neutral-500"}`}>{s.title}</p>
                <p className="text-sm text-neutral-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge cases */}
      {step === 0 && (
        <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-800/50">
            <span className="text-sm font-medium text-neutral-300">Edge cases</span>
          </div>
          <div className="px-6 py-5">
            {rawData && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#0a0a0a] rounded-xl px-5 py-4 text-center">
                  <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-white">{rawData.frames}</p>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Raw Frames</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl px-5 py-4 text-center">
                  <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-neutral-400">{rawData.source}</p>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Source</p>
                </div>
              </div>
            )}
            {[
              ["Lap 0 (out-lap)", "starts at pos 0.541, mid-track."],
              ["Lap 4 (incomplete)", "only S1 frames, never reaches S3."],
              ["Stationary frames", "speed < 5 kph, unchanged position."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3 items-start py-3 border-b border-neutral-800/30 last:border-b-0">
                <span className="rounded-full text-[9px] font-semibold tracking-wider text-red-400 border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 shrink-0 uppercase">Skip</span>
                <p className="text-sm text-neutral-500"><strong className="text-neutral-300 font-medium">{title}</strong> — {desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Laps */}
      {step >= 1 && laps && (
        <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
            <span className="text-sm font-medium text-neutral-300">Lap summaries</span>
            <span className="rounded-full text-[10px] font-semibold tracking-wider uppercase px-3 py-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">{laps.length} Complete</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse min-w-[600px]">
              <thead>
                <tr>
                  {["Lap", "Time", "S1", "S2", "S3", "Avg Spd", "Max Spd"].map((h, i) => (
                    <th key={h} className={`${i > 0 ? "text-right" : "text-left"} px-6 py-3.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                {laps.map((lap) => {
                  const isBest = analysis && lap.lapNumber === analysis.bestLap.lapNumber;
                  const isWorst = analysis && lap.lapNumber === analysis.worstLap.lapNumber;
                  return (
                    <tr key={lap.lapNumber} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-3.5 border-b border-neutral-800/30">
                        <span className="font-medium text-neutral-300">{lap.lapNumber}</span>
                        {isBest && <span className="ml-2 rounded-full text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">Best</span>}
                        {isWorst && <span className="ml-2 rounded-full text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-red-500/20 bg-red-500/10 text-red-400">Worst</span>}
                      </td>
                      <td className={`text-right px-6 py-3.5 border-b border-neutral-800/30 font-mono tabular-nums ${isBest ? "text-emerald-400" : isWorst ? "text-red-400" : ""}`}>{lap.lapTime.toFixed(3)}s</td>
                      {lap.sectors.map((s) => <td key={s.sector} className="text-right px-6 py-3.5 border-b border-neutral-800/30 font-mono tabular-nums">{s.time.toFixed(3)}s</td>)}
                      <td className="text-right px-6 py-3.5 border-b border-neutral-800/30 font-mono tabular-nums">{lap.avgSpeed} kph</td>
                      <td className="text-right px-6 py-3.5 border-b border-neutral-800/30 font-mono tabular-nums">{lap.maxSpeed} kph</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis */}
      {step === 2 && analysis && (
        <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
            <span className="text-sm font-medium text-neutral-300">Coaching analysis</span>
            <span className="rounded-full text-[10px] font-semibold tracking-wider uppercase px-3 py-1 border border-amber-500/20 bg-amber-500/10 text-amber-400">{analysis.issue.replace("_", " ")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800/30">
            {[
              { v: `Lap ${analysis.bestLap.lapNumber}`, l: "Best Lap", c: "text-emerald-400" },
              { v: `Lap ${analysis.worstLap.lapNumber}`, l: "Worst Lap", c: "text-red-400" },
              { v: `+${analysis.worstLap.delta.toFixed(3)}s`, l: "Delta", c: "text-red-400" },
              { v: `S${analysis.problemSector}`, l: "Problem Sector", c: "text-amber-400" },
            ].map((s) => (
              <div key={s.l} className="bg-[#111] px-5 py-5 text-center">
                <p className={`font-mono text-xl font-semibold tabular-nums mb-1 ${s.c}`}>{s.v}</p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="p-6">
            <div className="p-5 bg-[#0a0a0a] rounded-xl border border-emerald-500/20 relative">
              <span className="absolute -top-2.5 left-4 text-[10px] font-semibold tracking-widest text-emerald-400 bg-[#111] px-2 uppercase">PitGPT</span>
              <p className="italic text-sm text-neutral-400 leading-relaxed">{analysis.coachingMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
