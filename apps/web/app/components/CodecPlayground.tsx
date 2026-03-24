"use client";

import { useState } from "react";

const SAMPLE_FRAME = JSON.stringify([{
  ts: 12.5,
  lap: 2,
  pos: 0.341,
  spd: 247,
  thr: 0.92,
  brk: 0.0,
  str: -0.12,
  gear: 6,
  rpm: 8400,
  tyres: { fl: 97, fr: 99, rl: 94, rr: 95 }
}], null, 2);

interface EncodeResult { frames: number; bytesPerFrame: number; totalBytes: number; jsonEquivalentBytes: number; hex: string[] }

export function CodecPlayground() {
  const [input, setInput] = useState(SAMPLE_FRAME);
  const [encoded, setEncoded] = useState<EncodeResult | null>(null);
  const [decoded, setDecoded] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const encode = async () => {
    setLoading("encode");
    setError(null);
    setDecoded(null);
    try {
      const r = await fetch("/api/v2/irl/codec/encode", { method: "POST", headers: { "Content-Type": "application/json" }, body: input });
      if (!r.ok) { const e = await r.json(); setError(e.error); return; }
      setEncoded(await r.json());
    } catch (e) { setError(String(e)); } finally { setLoading(null); }
  };

  const decode = async () => {
    if (!encoded) return;
    setLoading("decode");
    setError(null);
    try {
      const r = await fetch("/api/v2/irl/codec/decode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hex: encoded.hex }) });
      if (!r.ok) { const e = await r.json(); setError(e.error); return; }
      setDecoded(await r.json());
    } catch (e) { setError(String(e)); } finally { setLoading(null); }
  };

  const reset = () => { setInput(SAMPLE_FRAME); setEncoded(null); setDecoded(null); setError(null); };

  const jsonBytes = new TextEncoder().encode(input).length;

  return (
    <div className="pb-px">
      <div className="border border-border bg-bg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-t2">Encode / Decode Playground</span>
          {(encoded || decoded) && (
            <button onClick={reset} className="font-mono text-[11px] font-medium tracking-wider uppercase px-4 py-2 border border-border bg-bg text-t2 hover:text-t1 transition-colors">Reset</button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
          {/* Input JSON */}
          <div className="bg-bg flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">JSON Input</span>
              <span className="font-mono text-[10px] tabular-nums text-t4">{jsonBytes}B</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setEncoded(null); setDecoded(null); }}
              spellCheck={false}
              className="flex-1 min-h-[200px] bg-black text-t2 font-mono text-[12px] leading-relaxed p-4 resize-none border-0 outline-none focus:ring-0"
            />
            <div className="p-3 border-t border-border">
              <button onClick={encode} disabled={loading === "encode"}
                className="w-full font-mono text-[11px] font-medium tracking-wider uppercase py-2 border border-lime bg-lime text-black hover:bg-[#00dd00] transition-colors disabled:opacity-50">
                {loading === "encode" ? "Encoding..." : "Encode →"}
              </button>
            </div>
          </div>

          {/* Binary output */}
          <div className="bg-bg flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">Binary (Hex)</span>
              {encoded && <span className="font-mono text-[10px] tabular-nums text-lime">{encoded.totalBytes}B</span>}
            </div>
            <div className="flex-1 min-h-[200px] bg-black p-4 font-mono text-[12px] leading-relaxed overflow-auto">
              {encoded ? (
                <>
                  {encoded.hex.map((h, i) => (
                    <div key={i} className="text-warn break-all mb-1">{h}</div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-border text-t4 text-[11px] space-y-1">
                    <p>{encoded.bytesPerFrame}B/frame × {encoded.frames} frame{encoded.frames > 1 ? "s" : ""}</p>
                    <p className="text-lime">{((1 - encoded.totalBytes / encoded.jsonEquivalentBytes) * 100).toFixed(1)}% smaller than JSON</p>
                  </div>
                </>
              ) : (
                <span className="text-t4">Encode JSON to see binary output</span>
              )}
            </div>
            <div className="p-3 border-t border-border">
              <button onClick={decode} disabled={!encoded || loading === "decode"}
                className="w-full font-mono text-[11px] font-medium tracking-wider uppercase py-2 border transition-colors disabled:opacity-30 border-lime bg-lime text-black hover:bg-[#00dd00] disabled:hover:bg-lime">
                {loading === "decode" ? "Decoding..." : "← Decode"}
              </button>
            </div>
          </div>

          {/* Decoded output */}
          <div className="bg-bg flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-t4">Decoded JSON</span>
              {decoded && <span className="font-mono text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border text-lime border-lime/20 bg-lime-dim">Lossless</span>}
            </div>
            <div className="flex-1 min-h-[200px] bg-black p-4 font-mono text-[12px] leading-relaxed overflow-auto">
              {decoded ? (
                <pre className="text-t2">{JSON.stringify(decoded, null, 2)}</pre>
              ) : (
                <span className="text-t4">Decode binary to verify roundtrip</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 border-t border-border">
            <p className="font-mono text-[11px] text-danger">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
