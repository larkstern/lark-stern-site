"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

const links = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/#values", label: "Why Us" },
  { href: "/#biosphere", label: "BioSphere" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
        <a href="/" onClick={() => setOpen(false)}>
          <Logo compact />
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-steel transition-colors hover:text-navy"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#contact"
            className="rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Book a demo
          </a>
        </div>

        {/* mobile hamburger */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`block h-0.5 w-6 bg-navy transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-navy transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-navy transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* mobile menu panel */}
      <div
        className={`overflow-hidden border-t border-line bg-canvas/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <div className="flex flex-col px-6 pb-5 pt-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3 text-base text-navy"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#contact"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full bg-navy px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Book a demo
          </a>
        </div>
      </div>
    </motion.header>
  );
}
