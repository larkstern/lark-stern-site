"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Respect reduced-motion: pause the loop and rest on the poster frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) v.pause();
    else v.play().catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-canvas">
      {/* Full-bleed cheetah video */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover [transform:scaleX(-1)]"
        autoPlay
        loop
        muted
        playsInline
        poster="/cheetah-hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/cheetah-hero.mp4" type="video/mp4" />
      </video>

      {/* faint measurement grid */}
      <div className="grid-overlay pointer-events-none absolute inset-0 z-[1] opacity-50" />

      {/* One-sided wash: keep the overlaid copy legible at left, cheetah crisp at right.
          Desktop fades left→right; mobile fades top→bottom (cheetah sits centre). */}
      <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[linear-gradient(to_right,rgba(251,252,254,0.97)_0%,rgba(251,252,254,0.82)_40%,rgba(251,252,254,0)_66%)] lg:block" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(251,252,254,0.94)_0%,rgba(251,252,254,0.55)_45%,rgba(251,252,254,0.35)_100%)] lg:hidden" />

      {/* Copy — overlaid, left-aligned */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="max-w-xl lg:w-1/2 lg:pr-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="kicker mb-6"
          >
            Enable · Efficient · Delivery
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease }}
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-navy md:text-6xl"
          >
            Manufacturing systems excellence,{" "}
            <span className="bg-gradient-to-r from-cheetah-deep via-cheetah to-gold bg-clip-text text-transparent">
              accelerated.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-steel"
          >
            Lark &amp; Stern delivers validated manufacturing systems for
            pharmaceutical and regulated industries — proven EBR, MES, SAP, and
            GAMP&nbsp;5 expertise, delivered with the speed, agility, and
            absolute precision of a cheetah.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#solutions"
              className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(30,55,104,0.6)] transition-transform hover:scale-105"
            >
              Explore our solutions
            </a>
            <a
              href="#contact"
              className="rounded-full border border-line bg-card px-7 py-3 text-sm font-medium text-navy shadow-card transition-colors hover:border-cheetah/50"
            >
              Book a demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-14 grid max-w-xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line text-left shadow-card sm:grid-cols-3"
          >
            {[
              ["40–60%", "faster implementation than custom development"],
              ["21 CFR 11", "& EU Annex 11 — FDA/EMA compliant delivery"],
              ["GxP", "pharma · biologics · cell & gene · med-device"],
            ].map(([stat, label]) => (
              <div key={stat} className="bg-card/85 px-5 py-4 backdrop-blur-sm">
                <div className="font-mono text-lg text-cheetah md:text-xl">
                  {stat}
                </div>
                <div className="mt-1 text-xs leading-snug text-steel">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
