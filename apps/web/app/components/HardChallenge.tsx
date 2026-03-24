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
    <div className="pb-px">
      {/* Pipeline */}
      <div className="border border-border bg-bg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Telemetry Pipeline</span>
          <div className="flex gap-1">
            {step === 2 ? (
              <button onClick={() => { setStep(0); setLaps(null); setAnalysis(null); setRawData(null); }} className="font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border border-border bg-bg text-t2 hover:text-t1 transition-colors">Reset</button>
            ) : step === 0 && !rawData ? (
              <>
                <button onClick={run} disabled={loading} className="font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border border-lime bg-lime text-black hover:bg-[#00dd00] transition-colors disabled:opacity-50">{loading ? "Processing..." : "Run Full Pipeline"}</button>
                <button onClick={advance} disabled={loading} className="font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border border-border bg-bg text-t2 hover:text-t1 transition-colors">Step →</button>
              </>
            ) : (
              <button onClick={advance} disabled={loading} className="font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border border-lime bg-lime text-black hover:bg-[#00dd00] transition-colors disabled:opacity-50">{loading ? "Processing..." : "Next Step →"}</button>
            )}
          </div>
        </div>
        <div className="px-6 py-5">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start py-3 border-b border-border last:border-b-0">
              <div className={`w-7 h-7 flex items-center justify-center font-mono text-xs font-semibold shrink-0 ${i < step ? "border border-lime bg-lime text-black" : i === step ? "border border-lime text-lime" : "border border-border text-t4"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <div>
                <p className={`font-mono text-[13px] font-medium mb-0.5 ${i === step ? "text-t1" : "text-t4"}`}>{s.title}</p>
                <p className="text-sm text-t3">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge cases */}
      {step === 0 && (
        <div className="border border-border border-t-0 bg-bg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Edge cases</span>
          </div>
          <div className="px-6 py-5">
            {rawData && (
              <div className="grid grid-cols-2 gap-px bg-border border border-border mb-4">
                <div className="bg-bg px-5 py-4 text-center">
                  <p className="font-mono text-xl font-semibold tabular-nums mb-1">{rawData.frames}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-t4">Raw Frames</p>
                </div>
                <div className="bg-bg px-5 py-4 text-center">
                  <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-t3">{rawData.source}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-t4">Source</p>
                </div>
              </div>
            )}
            {[
              ["Lap 0 (out-lap)", "starts at pos 0.541, mid-track."],
              ["Lap 4 (incomplete)", "only S1 frames, never reaches S3."],
              ["Stationary frames", "speed < 5 kph, unchanged position."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3 items-start py-3 border-b border-border last:border-b-0">
                <span className="font-mono text-[9px] font-semibold tracking-wider text-danger border border-danger/20 bg-danger-dim px-1.5 py-0.5 shrink-0 uppercase">Skip</span>
                <p className="text-sm text-t3"><strong className="text-t2 font-medium">{title}</strong> — {desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Laps */}
      {step >= 1 && laps && (
        <div className="border border-border border-t-0 bg-bg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Lap summaries</span>
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border text-lime border-lime/20 bg-lime-dim">{laps.length} Complete</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-[13px] border-collapse min-w-[600px]">
              <thead>
                <tr>
                  {["Lap", "Time", "S1", "S2", "S3", "Avg Spd", "Max Spd"].map((h, i) => (
                    <th key={h} className={`${i > 0 ? "text-right" : "text-left"} px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-t4 border-b border-border`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-t2">
                {laps.map((lap) => {
                  const isBest = analysis && lap.lapNumber === analysis.bestLap.lapNumber;
                  const isWorst = analysis && lap.lapNumber === analysis.worstLap.lapNumber;
                  return (
                    <tr key={lap.lapNumber}>
                      <td className="px-6 py-3 border-b border-border">
                        {lap.lapNumber}
                        {isBest && <span className="ml-2 font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border text-lime border-lime/20 bg-lime-dim">Best</span>}
                        {isWorst && <span className="ml-2 font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border text-danger border-danger/20 bg-danger-dim">Worst</span>}
                      </td>
                      <td className={`text-right px-6 py-3 border-b border-border tabular-nums ${isBest ? "text-lime" : isWorst ? "text-danger" : ""}`}>{lap.lapTime.toFixed(3)}s</td>
                      {lap.sectors.map((s) => <td key={s.sector} className="text-right px-6 py-3 border-b border-border tabular-nums">{s.time.toFixed(3)}s</td>)}
                      <td className="text-right px-6 py-3 border-b border-border tabular-nums">{lap.avgSpeed} kph</td>
                      <td className="text-right px-6 py-3 border-b border-border tabular-nums">{lap.maxSpeed} kph</td>
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
        <div className="border border-border border-t-0 bg-bg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Coaching analysis</span>
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border text-warn border-warn/20 bg-warn-dim">{analysis.issue.replace("_", " ")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {[
              { v: `Lap ${analysis.bestLap.lapNumber}`, l: "Best Lap", c: "text-lime" },
              { v: `Lap ${analysis.worstLap.lapNumber}`, l: "Worst Lap", c: "text-danger" },
              { v: `+${analysis.worstLap.delta.toFixed(3)}s`, l: "Delta", c: "text-danger" },
              { v: `S${analysis.problemSector}`, l: "Problem Sector", c: "text-warn" },
            ].map((s) => (
              <div key={s.l} className="bg-bg px-5 py-4 text-center">
                <p className={`font-mono text-xl font-semibold tabular-nums mb-1 ${s.c}`}>{s.v}</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-t4">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="p-5">
            <div className="p-5 bg-black border border-border border-l-2 border-l-lime relative italic text-sm font-light text-t2 leading-relaxed">
              <span className="absolute -top-2.5 left-4 font-mono text-[10px] font-semibold tracking-widest text-lime bg-bg px-2 not-italic uppercase">PitGPT</span>
              {analysis.coachingMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
