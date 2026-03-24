"use client";

import { useState } from "react";

interface CompareData {
  sample: { frames: number; jsonBytes: number; binaryBytes: number; deltaBytes: number; compressionRatio: { binaryVsJson: string; deltaVsJson: string; deltaVsBinary: string } };
  perFrame: { json: string; binary: string; deltaAvg: string };
  atProductionScale: { scenario: string; jsonBandwidth: string; binaryBandwidth: string; deltaBandwidth: string };
  deltaDetail: { description: string; frames: { frame: number; changedFields: string[]; bytes: number; unchangedFields: number }[] };
}

export function CodecCompare() {
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (data) { setData(null); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/v2/irl/codec/compare");
      setData(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const maxBytes = data ? data.sample.jsonBytes : 1;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Wire Format Comparison</span>
          <button onClick={run} disabled={loading}
            className={`rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 transition-colors ${data ? "border border-neutral-700 text-neutral-400 hover:text-white" : "bg-white text-black hover:bg-neutral-200"}`}>
            {loading ? "Loading..." : data ? "Hide" : "Run Comparison"}
          </button>
        </div>

        {!data && (
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-400 leading-relaxed">Encode 10 telemetry frames three ways — JSON, fixed binary, delta-encoded — and compare the wire sizes. Calls the live API.</p>
          </div>
        )}

        {data && (
          <>
            {/* Size bars */}
            <div className="p-6 flex flex-col gap-3">
              {[
                { label: "JSON", bytes: data.sample.jsonBytes, color: "bg-red-500", textColor: "text-red-400" },
                { label: "Binary v1", bytes: data.sample.binaryBytes, color: "bg-amber-500", textColor: "text-amber-400" },
                { label: "Delta v2", bytes: data.sample.deltaBytes, color: "bg-emerald-500", textColor: "text-emerald-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium tracking-wider text-neutral-500 w-16 shrink-0">{row.label}</span>
                  <div className="flex-1 h-8 bg-[#0a0a0a] rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-lg flex items-center justify-end pr-3 text-[10px] font-semibold text-black transition-all duration-700`}
                      style={{ width: `${Math.max((row.bytes / maxBytes) * 100, 8)}%` }}
                    >
                      {row.bytes}B
                    </div>
                  </div>
                  <span className={`font-mono text-[11px] tabular-nums ${row.textColor} w-20 text-right shrink-0`}>
                    {row.label === "JSON" ? `${data.sample.frames} frames` : row.label === "Binary v1" ? data.sample.compressionRatio.binaryVsJson : data.sample.compressionRatio.deltaVsJson}
                  </span>
                </div>
              ))}
            </div>

            {/* Production scale */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-800/30 border-t border-neutral-800/30">
              {[
                { v: data.atProductionScale.jsonBandwidth, l: "JSON", c: "text-red-400" },
                { v: data.atProductionScale.binaryBandwidth, l: "Binary", c: "text-amber-400" },
                { v: data.atProductionScale.deltaBandwidth, l: "Delta", c: "text-emerald-400" },
                { v: data.atProductionScale.scenario, l: "Scale", c: "text-neutral-300" },
              ].map((s) => (
                <div key={s.l} className="bg-[#111] px-5 py-5 text-center">
                  <p className={`font-mono text-lg font-semibold tabular-nums mb-1 ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Delta detail */}
            {data.deltaDetail.frames.length > 0 && (
              <div className="border-t border-neutral-800/30">
                <div className="px-6 py-3">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600">Per-Frame Delta Detail</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-[12px] border-collapse min-w-[400px]">
                    <thead>
                      <tr>
                        {["Frame", "Changed", "Bytes", "Unchanged"].map((h, i) => (
                          <th key={h} className={`${i > 1 ? "text-right" : "text-left"} px-6 py-2.5 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-neutral-400">
                      {data.deltaDetail.frames.slice(0, 8).map((f) => (
                        <tr key={f.frame} className="hover:bg-neutral-800/20 transition-colors">
                          <td className="px-6 py-2.5 border-b border-neutral-800/30 text-neutral-300">{f.frame}</td>
                          <td className="px-6 py-2.5 border-b border-neutral-800/30 text-emerald-400">{f.changedFields.join(", ")}</td>
                          <td className="text-right px-6 py-2.5 border-b border-neutral-800/30 tabular-nums">{f.bytes}B</td>
                          <td className="text-right px-6 py-2.5 border-b border-neutral-800/30 tabular-nums text-neutral-600">{f.unchangedFields}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
