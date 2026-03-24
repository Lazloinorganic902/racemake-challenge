"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TrackMap } from "./TrackMap";

interface Frame { ts: number; lap: number; pos: number; spd: number; thr: number; brk: number; str: number; gear: number; rpm: number; sector: number }
interface Sector { lap: number; sector: number; time: number; frames: number; maxSpeed: number; avgThrottle: number }
interface LapComplete { lapNumber: number; lapTime: number; sectors: { sector: number; time: number }[]; avgSpeed: number; maxSpeed: number }
interface Coaching { bestLap: number; worstLap: number; problemSector: number; issue: string; delta: number; coachingMessage: string }
interface LapSkipped { lap: number; reason: string }
interface Done { totalLaps: number; message: string }

type StreamEvent =
  | { type: "frame"; data: Frame }
  | { type: "sector"; data: Sector }
  | { type: "lap_complete"; data: LapComplete }
  | { type: "coaching"; data: Coaching }
  | { type: "lap_skipped"; data: LapSkipped }
  | { type: "done"; data: Done };

export function IrlStream({ streamUrl = "/api/v2/irl/stream" }: { streamUrl?: string }) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [latestFrame, setLatestFrame] = useState<Frame | null>(null);
  const [laps, setLaps] = useState<LapComplete[]>([]);
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [events, scrollToBottom]);

  const connect = () => {
    if (esRef.current) return;
    setEvents([]);
    setLatestFrame(null);
    setLaps([]);
    setCoaching(null);
    setDone(null);
    setFrameCount(0);
    setConnected(true);

    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.addEventListener("frame", (e) => {
      const data: Frame = JSON.parse(e.data);
      setLatestFrame(data);
      setFrameCount((c) => c + 1);
    });

    es.addEventListener("sector", (e) => {
      const data: Sector = JSON.parse(e.data);
      setEvents((prev) => [...prev, { type: "sector", data }]);
    });

    es.addEventListener("lap_complete", (e) => {
      const data: LapComplete = JSON.parse(e.data);
      setLaps((prev) => [...prev, data]);
      setEvents((prev) => [...prev, { type: "lap_complete", data }]);
    });

    es.addEventListener("coaching", (e) => {
      const data: Coaching = JSON.parse(e.data);
      setCoaching(data);
      setEvents((prev) => [...prev, { type: "coaching", data }]);
    });

    es.addEventListener("lap_skipped", (e) => {
      const data: LapSkipped = JSON.parse(e.data);
      setEvents((prev) => [...prev, { type: "lap_skipped", data }]);
    });

    es.addEventListener("done", (e) => {
      const data: Done = JSON.parse(e.data);
      setDone(data);
      setEvents((prev) => [...prev, { type: "done", data }]);
      es.close();
      esRef.current = null;
      setConnected(false);
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  };

  const disconnect = () => {
    esRef.current?.close();
    esRef.current = null;
    setConnected(false);
  };

  const sectorBar = (pos: number) => {
    const pct = Math.round(pos * 100);
    return (
      <div className="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-100" style={{ width: `${pct}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800/50 bg-[#111] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
          <span className="text-sm font-medium text-neutral-300">Live Telemetry Stream</span>
          <div className="flex items-center gap-3">
            {connected && (
              <span className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
            <button
              onClick={connected ? disconnect : connect}
              className={`rounded-full text-xs font-medium tracking-wider uppercase px-5 py-2.5 transition-colors ${
                connected
                  ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {connected ? "Disconnect" : done ? "Replay" : "Connect"}
            </button>
          </div>
        </div>

        {/* Track map */}
        <TrackMap
          carPos={latestFrame?.pos ?? 0}
          speed={latestFrame?.spd ?? 0}
          sector={latestFrame?.sector ?? 1}
          lap={latestFrame?.lap ?? 0}
          gear={latestFrame?.gear}
          throttle={latestFrame?.thr}
          brake={latestFrame?.brk}
          rpm={latestFrame?.rpm}
          active={connected}
        />

        {/* Live gauges */}
        {(latestFrame || done) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-800/30">
            <div className="bg-[#111] px-5 py-5 text-center">
              <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-white">{frameCount}</p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Frames</p>
            </div>
            <div className="bg-[#111] px-5 py-5 text-center">
              <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-emerald-400">{laps.length}</p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Laps</p>
            </div>
            <div className="bg-[#111] px-5 py-5 text-center">
              <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-white">{latestFrame ? `${latestFrame.spd}` : "—"}<span className="text-sm text-neutral-500"> kph</span></p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Speed</p>
            </div>
            <div className="bg-[#111] px-5 py-5 text-center">
              <p className="font-mono text-xl font-semibold tabular-nums mb-1 text-white">S{latestFrame?.sector ?? "—"}</p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-600">Sector</p>
            </div>
          </div>
        )}

        {/* Track position bar */}
        {latestFrame && connected && (
          <div className="px-6 py-4 border-t border-neutral-800/30 flex items-center gap-3">
            <span className="text-[10px] font-medium tracking-wider text-neutral-500 shrink-0">POS</span>
            {sectorBar(latestFrame.pos)}
            <span className="font-mono text-[11px] tabular-nums text-neutral-400 shrink-0 w-12 text-right">{(latestFrame.pos * 100).toFixed(1)}%</span>
          </div>
        )}

        {/* Lap table */}
        {laps.length > 0 && (
          <div className="border-t border-neutral-800/30 overflow-x-auto">
            <table className="w-full text-[13px] border-collapse min-w-[500px]">
              <thead>
                <tr>
                  {["Lap", "Time", "S1", "S2", "S3", "Avg", "Max"].map((h, i) => (
                    <th key={h} className={`${i > 0 ? "text-right" : "text-left"} px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-neutral-600 border-b border-neutral-800/50`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                {laps.map((lap) => {
                  const best = laps.length > 1 && lap.lapTime === Math.min(...laps.map((l) => l.lapTime));
                  return (
                    <tr key={lap.lapNumber} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-6 py-3 border-b border-neutral-800/30">
                        <span className="font-medium text-neutral-300">{lap.lapNumber}</span>
                        {best && <span className="ml-2 rounded-full text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">Best</span>}
                      </td>
                      <td className={`text-right px-6 py-3 border-b border-neutral-800/30 font-mono tabular-nums ${best ? "text-emerald-400" : ""}`}>{lap.lapTime.toFixed(3)}s</td>
                      {lap.sectors.map((s) => (
                        <td key={s.sector} className="text-right px-6 py-3 border-b border-neutral-800/30 font-mono tabular-nums">{s.time.toFixed(3)}s</td>
                      ))}
                      <td className="text-right px-6 py-3 border-b border-neutral-800/30 font-mono tabular-nums">{lap.avgSpeed} kph</td>
                      <td className="text-right px-6 py-3 border-b border-neutral-800/30 font-mono tabular-nums">{lap.maxSpeed} kph</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Coaching message */}
        {coaching && (
          <div className="p-6 border-t border-neutral-800/30">
            <div className="p-5 bg-[#0a0a0a] rounded-xl border border-emerald-500/20 relative">
              <span className="absolute -top-2.5 left-4 text-[10px] font-semibold tracking-widest text-emerald-400 bg-[#111] px-2 uppercase">PitGPT — Live</span>
              <p className="italic text-sm text-neutral-400 leading-relaxed mb-2">{coaching.coachingMessage}</p>
              <p className="font-mono text-[11px] text-neutral-500">
                Problem: S{coaching.problemSector} — {coaching.issue.replace("_", " ")} — +{coaching.delta.toFixed(3)}s vs best
              </p>
            </div>
          </div>
        )}

        {/* Event log */}
        {events.length > 0 && (
          <div className="border-t border-neutral-800/30">
            <div className="px-6 py-3">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600">Event Log</span>
            </div>
            <div ref={logRef} className="max-h-48 overflow-y-auto font-mono text-[12px] leading-relaxed">
              {events.map((ev, i) => {
                let icon = "";
                let color = "text-neutral-500";
                let text = "";
                switch (ev.type) {
                  case "sector":
                    icon = "◆"; color = "text-neutral-400";
                    text = `Lap ${ev.data.lap} S${ev.data.sector} — ${ev.data.time.toFixed(3)}s — max ${ev.data.maxSpeed} kph`;
                    break;
                  case "lap_complete":
                    icon = "✓"; color = "text-emerald-400";
                    text = `Lap ${ev.data.lapNumber} complete — ${ev.data.lapTime.toFixed(3)}s`;
                    break;
                  case "coaching":
                    icon = "▶"; color = "text-amber-400";
                    text = `Coaching: S${ev.data.problemSector} ${ev.data.issue.replace("_", " ")} (+${ev.data.delta.toFixed(3)}s)`;
                    break;
                  case "lap_skipped":
                    icon = "✕"; color = "text-neutral-600";
                    text = `Lap ${ev.data.lap} skipped — ${ev.data.reason}`;
                    break;
                  case "done":
                    icon = "■"; color = "text-blue-400";
                    text = `Stream complete — ${ev.data.totalLaps} laps processed`;
                    break;
                }
                return (
                  <div key={i} className={`px-6 py-1.5 border-b border-neutral-800/20 last:border-b-0 ${color}`}>
                    <span className="inline-block w-4">{icon}</span> {text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!latestFrame && !done && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-neutral-500">Connect to stream real-time telemetry from the server. Frames arrive at 20Hz with live sector analysis and coaching.</p>
          </div>
        )}
      </div>
    </div>
  );
}
