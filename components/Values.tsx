"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const values = [
  {
    name: "Speed",
    line: "Swift delivery accelerating time-to-market",
    body: "Our productized SiMPL solution accelerates deployment by 40–60% versus custom development — validated and production-ready faster, without sacrificing quality or compliance.",
  },
  {
    name: "Agility",
    line: "Flexibility adapting to changing requirements",
    body: "When requirements evolve mid-project, we pivot seamlessly while maintaining compliance. Our pharmaceutical experience means we anticipate changes and adjust without extending timelines.",
  },
  {
    name: "Focus",
    line: "Unwavering commitment to client goals",
    body: "Systems built for actual production needs and regulatory requirements — not technical capabilities. That eliminates scope creep and delivers validated, audit-ready solutions.",
  },
  {
    name: "Efficiency",
    line: "Streamlined processes, optimized resources",
    body: "Proven frameworks from pharmaceutical implementations avoid reinventing common solutions. Our accelerators reduce documentation time by 40–60% while maintaining compliance.",
  },
  {
    name: "Precision & Excellence",
    line: "Well-architected, reliable, validated systems",
    body: "GAMP 5 validated implementations that withstand FDA/EMA scrutiny. Validation and audit readiness are architected into foundations from day one — not afterward.",
  },
  {
    name: "Collaboration",
    line: "Thriving independently or embedded in teams",
    body: "We work effectively with manufacturing, quality, IT, and validation teams — independent or embedded, creating unified efforts that drive successful outcomes.",
  },
];

export default function Values() {
  return (
    <section id="values" className="relative py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-3xl"
        >
          <p className="kicker">What Defines Us</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-5xl">
            The instincts of a cheetah. The discipline of GxP.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
            Speed without precision is just risk. Our values are the cheetah&apos;s
            — swift, agile, focused — held to the exacting standards of validated
            manufacturing.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
              className="glass-panel p-7 transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
            >
              <h3 className="text-lg font-semibold text-navy">
                <span className="mr-2 text-cheetah">/</span>
                {v.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-navy/80">{v.line}</p>
              <p className="mt-3 text-sm leading-relaxed text-steel">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
