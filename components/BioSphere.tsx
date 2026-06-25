"use client";

import { motion } from "framer-motion";
import MoleculeField from "./MoleculeField";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const features = [
  {
    kicker: "Compliance",
    title: "Part 11 signatures, built in",
    body: "A controlled document workflow with 21 CFR Part 11 / EU Annex 11–compliant electronic signatures. Review, approve, and release without leaving the validated environment.",
  },
  {
    kicker: "Traceability",
    title: "A record that survives inspection",
    body: "Issues, risks, and requirements traced end-to-end in a tamper-evident audit trail engineered for regulatory inspection. When the auditor asks, the answer is already there.",
  },
  {
    kicker: "AI-assisted drafting",
    title: "First drafts in minutes — humans attest",
    body: "An AI draft-generation assistant produces validation deliverables from your branded templates, grounded in the project's structured context. Every AI draft requires an explicit human Authorship Attestation before it moves forward.",
  },
];

export default function BioSphere() {
  return (
    <section id="biosphere" className="relative overflow-hidden bg-paper py-24">
      {/* ambient molecular / cellular network */}
      <MoleculeField className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cheetah/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Intro — compact, secondary to the consulting story */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-5"
          >
            <p className="kicker">Our Platform</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-5xl">
              BioSphere<span className="text-cheetah">.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-steel">
              The project-aware, GxP-compliant documentation platform we built
              for our own programmes — purpose-built for digital transformation
              in pharmaceutical, biotech, medical device, and regulated
              manufacturing. Methodology-agnostic Blueprints structure every
              workspace around its canonical deliverables.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Every deliverable structured. Every signature compliant. Every
              change on the record.
            </p>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(30,55,104,0.6)] transition-transform hover:scale-105"
            >
              See BioSphere live →
            </a>
          </motion.div>

          {/* Feature trio */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-1 xl:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                className="glass-panel group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cheetah/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="kicker">{f.kicker}</p>
                <h3 className="mt-3 text-base font-semibold text-navy">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
