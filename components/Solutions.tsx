"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const solutions = [
  {
    index: "01",
    title: "Electronic Batch Records (EBR)",
    body: "Productized EBR delivery with SiMPL — an Electronic Batch Record accelerator built within SAP, implemented in partnership with Pangaea Solutions. Leverages your existing SAP infrastructure for faster time-to-value than custom development, now accelerated further by AI-assisted configuration and documentation.",
    facts: [
      ["Benefits", "50–70% faster batch review · 60–80% fewer documentation errors · FDA/EMA compliant"],
      ["Timeline", "4–12 months"],
      ["Ideal for", "Pharmaceutical, biologics, cell & gene therapy, CMOs"],
    ],
    tags: ["SiMPL", "SAP-native", "FDA / EMA"],
  },
  {
    index: "02",
    title: "Manufacturing Execution Systems (MES)",
    body: "End-to-end MES implementation for pharmaceutical and regulated manufacturing environments — from initial requirements through validation and go-live support. Batch execution and scheduling, equipment integration, material tracking and genealogy, quality checks and analytics.",
    facts: [
      ["Timeline", "6–18 months"],
      ["Industries", "Pharmaceutical, biologics, medical devices, specialty chemicals, regulated food & beverage"],
    ],
    tags: ["Batch execution", "Genealogy", "Quality analytics"],
  },
  {
    index: "03",
    title: "SAP Manufacturing & Integration",
    body: "Deep expertise in SAP manufacturing modules for regulated industries: PP and PP-PI implementation, QM for GxP compliance, MM for pharma supply chain, MES-to-ERP integration, and master data with full traceability. System-agnostic recommendations driven by your requirements — not vendor relationships.",
    facts: [
      ["Timeline", "Varies by scope"],
      ["Approach", "Expert in SAP, objective by principle"],
    ],
    tags: ["PP / PP-PI", "QM · MM", "MES ↔ ERP"],
  },
  {
    index: "04",
    title: "Validation & Regulatory Compliance",
    body: "GAMP 5 computer system validation and regulatory compliance ensuring your systems meet FDA, EMA, and global GxP requirements: CSV and validation documentation, risk assessments and traceability, data integrity (ALCOA+), 21 CFR Part 11 / EU Annex 11, and regulatory audit support — with AI-drafted, human-attested documentation through BioSphere.",
    facts: [
      ["Timeline", "3–9 months"],
      ["Principle", "Compliance architected in from day one — never retrofitted"],
    ],
    tags: ["GAMP 5", "ALCOA+", "Part 11 / Annex 11"],
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="relative py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-steel/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-3xl"
        >
          <p className="kicker">Our Solutions</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-5xl">
            Bridging manufacturing operations and technology.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            We specialize in SAP-based manufacturing solutions for regulated
            industries — Electronic Batch Records, Manufacturing Execution
            Systems, and validated system integration. Our three-tiered
            approach — <span className="font-medium text-navy">Business → Process → Technology</span> —
            ensures digital transformation delivers measurable operational
            value, not just deployed software.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {solutions.map((s, i) => (
            <motion.div
              key={s.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease }}
              className="glass-panel group p-8 transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-cheetah">{s.index}</span>
                <h3 className="text-xl font-semibold text-navy">{s.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-steel">{s.body}</p>
              <dl className="mt-5 space-y-2 border-t border-line pt-4">
                {s.facts.map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-xs leading-relaxed">
                    <dt className="w-20 shrink-0 font-mono uppercase tracking-wider text-mist">
                      {k}
                    </dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-steel transition-colors group-hover:border-cheetah/30 group-hover:text-cheetah"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
