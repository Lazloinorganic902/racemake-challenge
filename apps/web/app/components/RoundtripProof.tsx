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
    <div className="pb-px">
      <div className="border border-border bg-bg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Roundtrip Verification</span>
          <button onClick={run} disabled={loading}
            className={`font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border transition-colors ${data ? "border-border bg-bg text-t2 hover:text-t1" : "border-lime bg-lime text-black hover:bg-[#00dd00]"}`}>
            {loading ? "Verifying..." : data ? "Hide" : "Verify Roundtrip"}
          </button>
        </div>

        {!data && (
          <div className="px-6 py-5">
            <p className="text-sm font-light text-t2 leading-relaxed">Encode every telemetry frame to binary and decode it back. Proves the two-way schema map is lossless within quantization tolerance.</p>
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
              <div className="bg-bg px-5 py-4 text-center">
                <p className="font-mono text-xl font-semibold tabular-nums mb-1">{data.totalFrames}</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-t4">Frames Tested</p>
              </div>
              <div className="bg-bg px-5 py-4 text-center">
                <p className={`font-mono text-xl font-semibold mb-1 ${data.allLossless ? "text-lime" : "text-danger"}`}>{data.allLossless ? "PASS" : "FAIL"}</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-t4">All Lossless</p>
              </div>
              <div className="bg-bg px-5 py-4 text-center col-span-2 sm:col-span-1">
                <p className="font-mono text-xl font-semibold mb-1 text-t2">19B</p>
                <p className="font-mono text-[10px] tracking-widest uppercase text-t4">Per Frame</p>
              </div>
            </div>

            {/* Quantization note */}
            <div className="px-6 py-3 border-t border-border">
              <p className="font-mono text-[11px] text-t3 leading-relaxed">{data.quantizationNotes}</p>
            </div>

            {/* Sample roundtrips */}
            <div className="border-t border-border">
              <div className="px-6 py-2.5 border-b border-border">
                <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">Sample Frames</span>
              </div>
              {data.sample.slice(0, 4).map((s, i) => (
                <div key={i} className="border-b border-border last:border-b-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
                    <div className="bg-black p-4">
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4 mb-2">Original</p>
                      <pre className="font-mono text-[11px] text-t2 leading-relaxed">{JSON.stringify(s.original, null, 2)}</pre>
                    </div>
                    <div className="bg-black p-4">
                      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4 mb-2">Encoded — {s.encoded.bytes}B</p>
                      <p className="font-mono text-[11px] text-warn break-all leading-relaxed">{s.encoded.hex}</p>
                    </div>
                    <div className="bg-black p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">Decoded</p>
                        <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border ${s.lossless ? "text-lime border-lime/20 bg-lime-dim" : "text-danger border-danger/20 bg-danger-dim"}`}>
                          {s.lossless ? "Match" : "Diff"}
                        </span>
                      </div>
                      <pre className="font-mono text-[11px] text-t2 leading-relaxed">{JSON.stringify(s.decoded, null, 2)}</pre>
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
