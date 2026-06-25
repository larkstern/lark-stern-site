import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lark & Stern | Meet the Team",
  description: "Meet the team behind our innovative implementations.",
};

const team = [
  {
    name: "Karl Maritz",
    role: "Chief Executive Officer",
    initials: "KM",
    linkedin: "https://linkedin.com/in/karl-maritz-a72924135",
  },
  {
    name: "Frieda van der Merwe",
    role: "Internal Operations Manager",
    initials: "FM",
    linkedin: "https://linkedin.com/in/frieda-van-der-merwe-a87628221",
  },
];

export default function TeamPage() {
  return (
    <main className="relative bg-canvas">
      <Nav />

      <section className="relative overflow-hidden">
        <div className="spot-field pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 pt-36 pb-16">
          <p className="kicker">Our People</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-6xl">
            Meet the team.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
            The people behind our implementations — pairing deep regulated-manufacturing
            expertise with the speed, agility, and precision that define Lark &amp; Stern.
            Headquartered in Vancouver, Canada, with our delivery center in Pretoria,
            South Africa.
          </p>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="glass-panel group flex flex-col items-start p-8 transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-navy via-navy to-cheetah-deep font-serif text-2xl font-bold text-white shadow-card">
                  {m.initials}
                </div>
                <h2 className="mt-6 text-xl font-semibold text-navy">{m.name}</h2>
                <p className="mt-1 text-sm font-medium text-cheetah">{m.role}</p>
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm text-steel transition-colors hover:text-navy"
                >
                  LinkedIn ↗
                </a>
              </div>
            ))}

            {/* Careers / growth card */}
            <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-line bg-paper p-8">
              <p className="kicker">We&apos;re growing</p>
              <h2 className="mt-3 text-xl font-semibold text-navy">
                Join the pack.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                We&apos;re always looking for sharp people who move fast and hold the
                line on quality. See open roles or introduce yourself.
              </p>
              <a
                href="mailto:hello@lark-stern.com?subject=Careers%20at%20Lark%20%26%20Stern"
                className="mt-5 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
