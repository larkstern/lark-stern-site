"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-line bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="text-center"
        >
          <p className="kicker">Begin</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-navy md:text-5xl">
            Your transformation, validated.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-steel">
            Talk to the team about your programme — or see BioSphere live on a
            workspace built around your methodology.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@lark-stern.com?subject=Demo%20Request"
              className="rounded-full bg-navy px-8 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(30,55,104,0.7)] transition-transform hover:scale-105"
            >
              Book a demo
            </a>
            <a
              href="mailto:hello@lark-stern.com"
              className="rounded-full border border-line bg-card px-8 py-3.5 text-sm font-medium text-navy shadow-card transition-colors hover:border-cheetah/50"
            >
              Contact us
            </a>
          </div>
        </motion.div>

        <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-line pt-10 md:flex-row">
          <Logo />
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs text-steel">
            <span>Vancouver, Canada</span>
            <span>Pretoria, South Africa</span>
            <a
              href="https://www.linkedin.com/company/lark-stern-consulting-inc/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gold"
            >
              LinkedIn ↗
            </a>
          </div>
          <p className="text-xs text-steel/70">
            © {new Date().getFullYear()} Lark &amp; Stern
          </p>
        </div>
      </div>
    </footer>
  );
}
