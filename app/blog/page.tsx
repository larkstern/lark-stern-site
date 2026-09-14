import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllPosts, getCategories, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Lark & Stern | Blog",
  description:
    "News, Lunch & Learn recaps, and team growth from the Lark & Stern team.",
};

const ALL = "All Posts";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string };
}) {
  const posts = await getAllPosts();
  const categories = [ALL, ...(await getCategories(posts))];

  const active =
    searchParams.category && categories.includes(searchParams.category)
      ? searchParams.category
      : ALL;

  const activeTag = searchParams.tag;

  const visible = activeTag
    ? posts.filter((p) => p.hashtags?.includes(activeTag))
    : active === ALL
      ? posts
      : posts.filter((p) => p.category === active);

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

          {activeTag ? (
            <div className="mt-8 flex items-center gap-2 font-mono text-sm text-steel">
              <span>
                Tagged <span className="text-navy">#{activeTag}</span>
              </span>
              <a href="/blog" className="text-cheetah underline underline-offset-2">
                clear
              </a>
            </div>
          ) : (
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = category === active;
              const href = category === ALL ? "/blog" : `/blog?category=${encodeURIComponent(category)}`;
              return (
                <a
                  key={category}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "border-navy bg-navy text-white"
                      : "border-line text-steel hover:border-cheetah/40 hover:text-navy"
                  }`}
                >
                  {category}
                </a>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {visible.map((post) => (
              <a
                key={post.slug}
                href={`/post/${post.slug}`}
                className="glass-panel group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
              >
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-navy via-steel to-cheetah-deep">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="spot-field absolute inset-0 opacity-30" />
                  )}
                  {post.category ? (
                    <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-navy">
                      {post.category}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-semibold leading-snug text-navy">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-steel">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4 font-mono text-xs text-mist">
                    <span>{post.author}</span>
                    <span>
                      {formatDate(post.publishedAt)} · {post.timeToRead} min read
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {!visible.length ? (
            <p className="mt-10 text-sm text-mist">Nothing here yet.</p>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
