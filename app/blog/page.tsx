import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lark & Stern | Blog",
  description:
    "News, Lunch & Learn recaps, and team growth from the Lark & Stern team.",
};

const categories = ["All Posts", "Lunch & Learn", "Team Growth"];

const posts = [
  {
    title: "The Riddle Board: Where Every Week Brings a New Mystery",
    date: "Jun 12",
    read: "2 min read",
    category: "Team Growth",
    excerpt:
      "To celebrate this ongoing tradition, we asked everyone to share some of their favourite riddles from the board. A weekly mystery that keeps the team thinking, laughing, and connecting.",
    href: "https://www.lark-stern.com/post/the-riddle-board-where-every-week-brings-a-new-mystery",
  },
  {
    title: "SAPHEX 2026: Connection, Innovation & Impact",
    date: "Jun 2",
    read: "2 min read",
    category: "Team Growth",
    excerpt:
      "The recent SAPHEX Expo, held on 25 & 26 March 2026 at the Sandton Convention Centre, again proved why it remains a standout event in the pharmaceutical calendar — meaningful engagement, industry insights, and valuable connections.",
    href: "https://www.lark-stern.com/post/saphex-2026-connection-innovation-impact",
  },
  {
    title: "Lunch & Learn Recap: Mastering New Skills Blazingly Fast",
    date: "Apr 2",
    read: "2 min read",
    category: "Lunch & Learn",
    excerpt:
      "At our latest Lunch & Learn, presented by Ethan Vletter, we unpacked what it really takes to learn new skills quickly. The key takeaway? It's not about working harder — it's about working smarter by focusing on the system behind the skill.",
    href: "https://www.lark-stern.com/post/lunch-learn-recap-mastering-new-skills-blazingly-fast",
  },
];

export default function BlogPage() {
  return (
    <main className="relative bg-canvas">
      <Nav />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pt-36 pb-10">
          <p className="kicker">From the Pack</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy md:text-6xl">
            Blog.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
            News, Lunch &amp; Learn recaps, and life inside Lark &amp; Stern.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <span
                key={c}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  i === 0
                    ? "border-navy bg-navy text-white"
                    : "border-line text-steel hover:border-cheetah/40 hover:text-navy"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <a
                key={p.title}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
              >
                {/* themed cover band */}
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-navy via-steel to-cheetah-deep">
                  <div className="spot-field absolute inset-0 opacity-30" />
                  <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-navy">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-semibold leading-snug text-navy">
                    {p.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                    {p.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4 font-mono text-xs text-mist">
                    <span>Lark &amp; Stern</span>
                    <span>
                      {p.date} · {p.read}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-10 text-sm text-mist">
            Posts currently link to the live articles. When you&apos;re ready, we can
            migrate full post content into the app.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
