"use client";

import { useEffect, useRef } from "react";

/**
 * MoleculeField — ambient "molecular / cellular network" animation for the
 * light theme. Drifting nodes connect with hairlines when close (molecules /
 * cells), and occasional signal pulses race along the bonds in a cheetah-amber
 * accent — tuned faint so it sits behind content. Respects reduced-motion.
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
type Pulse = { from: number; to: number; t: number; speed: number };

const LINK_DIST = 150;

export default function MoleculeField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const seed = () => {
      const count = Math.min(90, Math.floor((w * h) / 20000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: 1.4 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
      }));
      pulses = [];
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const spawnPulse = () => {
      if (nodes.length < 2 || pulses.length > 18) return;
      const from = Math.floor(Math.random() * nodes.length);
      let best = -1;
      let bestD = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue;
        const dx = nodes[i].x - nodes[from].x;
        const dy = nodes[i].y - nodes[from].y;
        const d = dx * dx + dy * dy;
        if (d < bestD && d < LINK_DIST * LINK_DIST) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) pulses.push({ from, to: best, t: 0, speed: 0.018 + Math.random() * 0.03 });
    };

    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.phase += 0.018 * dt;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // bonds
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(86, 105, 142, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes (breathing)
      for (const n of nodes) {
        const glow = 0.5 + Math.sin(n.phase) * 0.3;
        ctx.fillStyle = `rgba(30, 55, 104, ${0.18 + glow * 0.22})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // signal pulses
      if (Math.random() < 0.25 * dt) spawnPulse();
      pulses = pulses.filter((p) => p.t <= 1);
      for (const p of pulses) {
        p.t += p.speed * dt;
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = "rgba(200, 119, 46, 0.85)";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduced) {
      frame(performance.now());
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
