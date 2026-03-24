"use client";

import { useRef, useEffect, useCallback } from "react";

// Simplified Spa-Francorchamps layout — 20 control points
// Normalized to 0-1 range, mapped from real track GPS data approximation
const SPA_POINTS: [number, number][] = [
  [0.52, 0.95],  // Start/finish
  [0.52, 0.88],  // Approach La Source
  [0.48, 0.84],  // La Source hairpin apex
  [0.50, 0.78],  // Exit La Source
  [0.54, 0.68],  // Eau Rouge entry
  [0.52, 0.62],  // Eau Rouge bottom
  [0.56, 0.54],  // Raidillon top
  [0.62, 0.46],  // Kemmel straight
  [0.72, 0.34],  // Les Combes approach
  [0.76, 0.28],  // Les Combes apex
  [0.72, 0.22],  // Malmedy
  [0.64, 0.18],  // Rivage entry
  [0.58, 0.20],  // Rivage exit
  [0.46, 0.24],  // Pouhon entry
  [0.36, 0.30],  // Pouhon apex
  [0.30, 0.38],  // Fagnes
  [0.28, 0.50],  // Stavelot
  [0.32, 0.60],  // Blanchimont entry
  [0.38, 0.72],  // Blanchimont apex
  [0.42, 0.82],  // Bus Stop entry
  [0.48, 0.90],  // Bus Stop exit
  [0.52, 0.95],  // Back to start/finish
];

// Sector boundaries at pos 0.333 and 0.667
const S1_END = 0.333;
const S2_END = 0.667;

function catmullRom(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], t: number): [number, number] {
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

function getTrackPoint(pos: number): [number, number] {
  const n = SPA_POINTS.length - 1;
  const scaled = pos * n;
  const i = Math.floor(scaled);
  const t = scaled - i;

  const p0 = SPA_POINTS[(i - 1 + n) % n]!;
  const p1 = SPA_POINTS[i % n]!;
  const p2 = SPA_POINTS[(i + 1) % n]!;
  const p3 = SPA_POINTS[(i + 2) % n]!;

  return catmullRom(p0, p1, p2, p3, t);
}

function getSectorColor(pos: number): string {
  if (pos < S1_END) return "#4d65ff"; // info/blue for S1
  if (pos < S2_END) return "#ff8800"; // warn/orange for S2
  return "#00ff00"; // lime for S3
}

interface TrackMapProps {
  carPos: number;
  speed: number;
  sector: number;
  lap: number;
  bestPositions?: number[]; // array of positions for ghost trail
  active: boolean;
}

export function TrackMap({ carPos, speed, sector, lap, active }: TrackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const trailRef = useRef<{ pos: number; spd: number }[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = 24;
    const drawW = w - pad * 2;
    const drawH = h - pad * 2;

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    // Helper to convert track coords to canvas coords
    const toCanvas = (p: [number, number]): [number, number] => [
      pad + p[0] * drawW,
      pad + p[1] * drawH,
    ];

    // Draw track outline with sector colors
    const segments = 200;
    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 1) / segments;
      const p0 = toCanvas(getTrackPoint(t0));
      const p1 = toCanvas(getTrackPoint(t1));

      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.strokeStyle = getSectorColor(t0);
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Sector boundary markers
    [S1_END, S2_END, 0].forEach((sPos) => {
      const p = toCanvas(getTrackPoint(sPos));
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
      ctx.fillStyle = "#333333";
      ctx.fill();
    });

    // Sector labels
    const s1Mid = toCanvas(getTrackPoint(0.15));
    const s2Mid = toCanvas(getTrackPoint(0.5));
    const s3Mid = toCanvas(getTrackPoint(0.83));
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    [
      { p: s1Mid, label: "S1", color: "#4d65ff" },
      { p: s2Mid, label: "S2", color: "#ff8800" },
      { p: s3Mid, label: "S3", color: "#00ff00" },
    ].forEach(({ p, label, color }) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillText(label, p[0] - 16, p[1] - 8);
      ctx.globalAlpha = 1;
    });

    // Start/finish line
    const sf = toCanvas(getTrackPoint(0));
    ctx.beginPath();
    ctx.moveTo(sf[0] - 8, sf[1]);
    ctx.lineTo(sf[0] + 8, sf[1]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Trail behind car
    const trail = trailRef.current;
    if (trail.length > 1) {
      for (let i = Math.max(0, trail.length - 40); i < trail.length - 1; i++) {
        const t = trail[i]!;
        const p = toCanvas(getTrackPoint(t.pos));
        const age = (trail.length - 1 - i) / 40;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
        ctx.fillStyle = getSectorColor(t.pos);
        ctx.globalAlpha = Math.max(0, 0.6 - age * 0.6);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Car dot
    if (active || trail.length > 0) {
      const cp = toCanvas(getTrackPoint(carPos));
      const spdNorm = Math.min(speed / 320, 1);
      const radius = 4 + spdNorm * 4;

      // Glow
      const glow = ctx.createRadialGradient(cp[0], cp[1], 0, cp[0], cp[1], radius * 3);
      const sectorCol = getSectorColor(carPos);
      glow.addColorStop(0, sectorCol);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cp[0], cp[1], radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Dot
      ctx.beginPath();
      ctx.arc(cp[0], cp[1], radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cp[0], cp[1], radius - 1.5, 0, Math.PI * 2);
      ctx.fillStyle = sectorCol;
      ctx.fill();
    }

    // HUD overlay
    if (active) {
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "#333333";
      ctx.fillText(`LAP ${lap}`, 8, 14);
      ctx.fillStyle = getSectorColor(carPos);
      ctx.fillText(`S${sector}`, 8, 26);
      ctx.fillStyle = "#555555";
      ctx.fillText(`${speed} KPH`, 8, 38);
    }
  }, [carPos, speed, sector, lap, active]);

  // Update trail
  useEffect(() => {
    if (active && carPos > 0) {
      trailRef.current.push({ pos: carPos, spd: speed });
      if (trailRef.current.length > 200) trailRef.current = trailRef.current.slice(-200);
    }
  }, [carPos, speed, active]);

  // Reset trail on new connection
  useEffect(() => {
    if (!active && carPos === 0) {
      trailRef.current = [];
    }
  }, [active, carPos]);

  // Render loop
  useEffect(() => {
    const render = () => {
      draw();
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full bg-black border border-border"
      style={{ height: 320, imageRendering: "auto" }}
    />
  );
}
