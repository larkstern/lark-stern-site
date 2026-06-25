"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const clients = [
  "AstraZeneca",
  "Bristol Myers Squibb",
  "Thermo Fisher Scientific",
  "STEMCELL Technologies",
  "Pangaea Solutions",
  "UST",
  "iSSi",
  "Endeavor",
];

export default function Story() {
  return (
    <section id="story" className="relative py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-steel/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="kicker">Our Story</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-5xl">
              Founded for GxP. Built for what&apos;s next.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-steel">
              <p>
                Founded in 2021 in Vancouver, Canada, Lark &amp; Stern
                specializes in manufacturing systems implementation for
                pharmaceutical and regulated industries — tailored solutions for
                the unique challenges of GxP manufacturing environments.
              </p>
              <p>
                Our strategic partnership with Pangaea Solutions positions us as
                a premier implementer of SiMPL, their Electronic Batch Record
                accelerator built within SAP — faster implementations with lower
                risk than custom development.
              </p>
              <p>
                From our Canadian headquarters we serve pharmaceutical leaders
                worldwide, while our South African delivery center provides
                world-class consulting with strategic timezone coverage for
                European and North American clients. Today, we&apos;re extending
                that delivery record with AI — and with BioSphere, our
                GxP-compliant documentation platform.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="flex flex-col justify-center"
          >
            <div className="glass-panel p-8">
              <p className="kicker">Trusted by Industry Leaders</p>
              <p className="mt-4 text-sm leading-relaxed text-steel">
                From innovative biotechnology companies to global pharmaceutical
                manufacturers — united by their commitment to quality,
                compliance, and operational excellence.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                {clients.map((c) => (
                  <div
                    key={c}
                    className="bg-paper px-5 py-4 text-sm font-medium text-navy"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-8 font-mono text-xs text-steel">
                <span>HQ — Vancouver, Canada</span>
                <span>Delivery — Pretoria, South Africa</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
