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
    <div className="pb-px">
      <div className="border border-border bg-bg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Wire Format Comparison</span>
          <button onClick={run} disabled={loading}
            className={`font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border transition-colors ${data ? "border-border bg-bg text-t2 hover:text-t1" : "border-lime bg-lime text-black hover:bg-[#00dd00]"}`}>
            {loading ? "Loading..." : data ? "Hide" : "Run Comparison"}
          </button>
        </div>

        {!data && (
          <div className="px-6 py-5">
            <p className="text-sm font-light text-t2 leading-relaxed">Encode 10 telemetry frames three ways — JSON, fixed binary, delta-encoded — and compare the wire sizes. Calls the live API.</p>
          </div>
        )}

        {data && (
          <>
            {/* Size bars */}
            <div className="p-5 flex flex-col gap-3">
              {[
                { label: "JSON", bytes: data.sample.jsonBytes, color: "bg-danger", textColor: "text-danger" },
                { label: "Binary v1", bytes: data.sample.binaryBytes, color: "bg-warn", textColor: "text-warn" },
                { label: "Delta v2", bytes: data.sample.deltaBytes, color: "bg-lime", textColor: "text-lime" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-wider text-t4 w-16 shrink-0">{row.label}</span>
                  <div className="flex-1 h-7 bg-black border border-border overflow-hidden">
                    <div
                      className={`h-full ${row.color} flex items-center justify-end pr-2 font-mono text-[10px] font-medium text-black transition-all duration-700`}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-t border-border">
              {[
                { v: data.atProductionScale.jsonBandwidth, l: "JSON", c: "text-danger" },
                { v: data.atProductionScale.binaryBandwidth, l: "Binary", c: "text-warn" },
                { v: data.atProductionScale.deltaBandwidth, l: "Delta", c: "text-lime" },
                { v: data.atProductionScale.scenario, l: "Scale", c: "text-t2" },
              ].map((s) => (
                <div key={s.l} className="bg-bg px-5 py-4 text-center">
                  <p className={`font-mono text-lg font-semibold tabular-nums mb-1 ${s.c}`}>{s.v}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-t4">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Delta detail */}
            {data.deltaDetail.frames.length > 0 && (
              <div className="border-t border-border">
                <div className="px-6 py-2.5 border-b border-border">
                  <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">Per-Frame Delta Detail</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-[12px] border-collapse min-w-[400px]">
                    <thead>
                      <tr>
                        {["Frame", "Changed", "Bytes", "Unchanged"].map((h, i) => (
                          <th key={h} className={`${i > 1 ? "text-right" : "text-left"} px-4 sm:px-6 py-2 text-[10px] font-semibold tracking-widest uppercase text-t4 border-b border-border`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-t2">
                      {data.deltaDetail.frames.slice(0, 8).map((f) => (
                        <tr key={f.frame}>
                          <td className="px-4 sm:px-6 py-2 border-b border-border">{f.frame}</td>
                          <td className="px-4 sm:px-6 py-2 border-b border-border text-lime">{f.changedFields.join(", ")}</td>
                          <td className="text-right px-4 sm:px-6 py-2 border-b border-border tabular-nums">{f.bytes}B</td>
                          <td className="text-right px-4 sm:px-6 py-2 border-b border-border tabular-nums text-t4">{f.unchangedFields}</td>
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
