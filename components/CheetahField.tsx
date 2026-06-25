"use client";

import { useEffect, useRef } from "react";

/**
 * CheetahField — ambient "speed & precision" animation for the light hero.
 *
 * Two layers convey the cheetah's signature: kinetic SPEED LINES racing
 * left → right at varying velocities, and slow-drifting CHEETAH-SPOT
 * rosettes parallaxing in the background. Paired with the running-cheetah
 * silhouette in <Hero/>, it reads as motion, agility, and precision —
 * tuned light so foreground copy stays crisp. Respects reduced-motion.
 */

type Streak = {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  gold: boolean;
};

type Spot = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  rot: number;
};

export default function CheetahField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let streaks: Streak[] = [];
    let spots: Spot[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const seed = () => {
      const streakCount = Math.min(70, Math.floor(w / 16));
      streaks = Array.from({ length: streakCount }, () => makeStreak(true));

      const spotCount = Math.min(26, Math.floor((w * h) / 70000));
      spots = Array.from({ length: spotCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 7 + Math.random() * 16,
        vx: 0.08 + Math.random() * 0.18,
        vy: (Math.random() - 0.5) * 0.06,
        rot: Math.random() * Math.PI,
      }));
    };

    const makeStreak = (anywhere: boolean): Streak => ({
      x: anywhere ? Math.random() * w : -Math.random() * 200,
      y: Math.random() * h,
      len: 40 + Math.random() * 220,
      speed: 2.5 + Math.random() * 9,
      alpha: 0.04 + Math.random() * 0.12,
      gold: Math.random() < 0.12,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    // a cheetah-spot rosette: a soft cluster of small marks
    const drawRosette = (s: Spot) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = "rgba(58, 42, 23, 0.05)";
      const marks = [
        [0, 0, s.r * 0.5],
        [s.r * 0.7, -s.r * 0.3, s.r * 0.26],
        [-s.r * 0.6, s.r * 0.5, s.r * 0.22],
        [s.r * 0.2, s.r * 0.75, s.r * 0.2],
        [-s.r * 0.7, -s.r * 0.55, s.r * 0.18],
      ];
      for (const [mx, my, mr] of marks) {
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      ctx.clearRect(0, 0, w, h);

      // drifting cheetah-spot rosettes (background parallax)
      for (const s of spots) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += 0.0008 * dt;
        if (s.x - s.r > w) {
          s.x = -s.r;
          s.y = Math.random() * h;
        }
        drawRosette(s);
      }

      // kinetic speed lines
      for (const st of streaks) {
        st.x += st.speed * dt;
        if (st.x - st.len > w) {
          Object.assign(st, makeStreak(false));
          st.x = -st.len;
        }
        const grad = ctx.createLinearGradient(st.x - st.len, st.y, st.x, st.y);
        if (st.gold) {
          grad.addColorStop(0, "rgba(184, 144, 31, 0)");
          grad.addColorStop(1, `rgba(184, 144, 31, ${st.alpha * 1.4})`);
        } else {
          grad.addColorStop(0, "rgba(86, 105, 142, 0)");
          grad.addColorStop(1, `rgba(86, 105, 142, ${st.alpha})`);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = st.gold ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(st.x - st.len, st.y);
        ctx.lineTo(st.x, st.y);
        ctx.stroke();
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
