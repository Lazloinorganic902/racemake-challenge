"use client";

import { useState } from "react";

interface RoundtripSample {
  original: Record<string, unknown>;
  encoded: { hex: string; bytes: number };
  decoded: Record<string, unknown>;
  lossless: boolean;
}

interface RoundtripData {
  description: string;
  totalFrames: number;
  allLossless: boolean;
  quantizationNotes: string;
  sample: RoundtripSample[];
}

export function RoundtripProof() {
  const [data, setData] = useState<RoundtripData | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (data) { setData(null); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/v2/irl/codec/roundtrip");
      setData(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Roundtrip Verification</span>
          <button onClick={run} disabled={loading}
            className={`rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 transition-colors ${data ? "border border-neutral-700 text-neutral-400 hover:text-white" : "bg-white text-black hover:bg-neutral-200"}`}>
            {loading ? "Verifying..." : data ? "Hide" : "Verify Roundtrip"}
          </button>
        </div>

        {!data && (
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-400 leading-relaxed">Encode every telemetry frame to binary and decode it back. Proves the two-way schema map is lossless within quantization tolerance.</p>
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-neutral-800/30">
              <div className="bg-[#111] px-5 py-5 text-center">
                <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-white">{data.totalFrames}</p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Frames Tested</p>
              </div>
              <div className="bg-[#111] px-5 py-5 text-center">
                <p className={`font-mono text-xl font-semibold mb-1 ${data.allLossless ? "text-emerald-400" : "text-red-400"}`}>{data.allLossless ? "PASS" : "FAIL"}</p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">All Lossless</p>
              </div>
              <div className="bg-[#111] px-5 py-5 text-center col-span-2 sm:col-span-1">
                <p className="font-mono text-xl font-semibold mb-1 text-neutral-300">19B</p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Per Frame</p>
              </div>
            </div>

            {/* Quantization note */}
            <div className="px-6 py-4 border-t border-neutral-800/30">
              <p className="font-mono text-[11px] text-neutral-500 leading-relaxed">{data.quantizationNotes}</p>
            </div>

            {/* Sample roundtrips */}
            <div className="border-t border-neutral-800/30">
              <div className="px-6 py-3">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600">Sample Frames</span>
              </div>
              {data.sample.slice(0, 4).map((s, i) => (
                <div key={i} className="border-t border-neutral-800/30">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-neutral-800/30">
                    <div className="bg-[#0a0a0a] p-5 rounded-none">
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600 mb-2">Original</p>
                      <pre className="font-mono text-[11px] text-neutral-400 leading-relaxed">{JSON.stringify(s.original, null, 2)}</pre>
                    </div>
                    <div className="bg-[#0a0a0a] p-5">
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600 mb-2">Encoded — {s.encoded.bytes}B</p>
                      <p className="font-mono text-[11px] text-amber-400 break-all leading-relaxed">{s.encoded.hex}</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600">Decoded</p>
                        <span className={`rounded-full text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border ${s.lossless ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
                          {s.lossless ? "Match" : "Diff"}
                        </span>
                      </div>
                      <pre className="font-mono text-[11px] text-neutral-400 leading-relaxed">{JSON.stringify(s.decoded, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
