import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { postComponents } from "@/components/PostMedia";
import { getPost, getPostSlugs, getAllPosts, formatDate } from "@/lib/posts";

// The route lives at /post/<slug> to match the URLs the Wix site published -
// every existing LinkedIn share and inbound link points there.

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Lark & Stern | Post not found" };

  const url = `https://www.lark-stern.com/post/${post.slug}`;
  // post.coverImage is already an absolute Sanity CDN URL - do not prefix it.
  const image = post.coverImage;

  return {
    title: `${post.title} | Lark & Stern`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Lark & Stern",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const others = (await getAllPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="relative bg-canvas">
      <Nav />

      <article>
        <header className="mx-auto max-w-3xl px-6 pt-36">
          <p className="kicker">{post.category ?? "From the Pack"}</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-navy md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-5 font-mono text-xs text-mist">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{post.timeToRead} min read</span>
          </div>
        </header>

        {post.coverImage ? (
          <div className="mx-auto mt-10 max-w-4xl px-6">
            <img
              src={post.coverImage}
              alt=""
              className="w-full rounded-2xl border border-line shadow-card"
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="prose prose-lark max-w-none flow-root">
            <PortableText value={post.body as any} components={postComponents} />
          </div>
        </div>
      </article>

      {others.length ? (
        <section className="border-t border-line bg-paper py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="kicker">Keep reading</p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {others.map((other) => (
                <a
                  key={other.slug}
                  href={`/post/${other.slug}`}
                  className="glass-panel group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-cheetah/40 hover:shadow-cardHover"
                >
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-navy via-steel to-cheetah-deep">
                    {other.coverImage ? (
                      <img
                        src={other.coverImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="spot-field absolute inset-0 opacity-30" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {other.category ? (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cheetah">
                        {other.category}
                      </span>
                    ) : null}
                    <h2 className="mt-2 text-base font-semibold leading-snug text-navy">
                      {other.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-steel">
                      {other.excerpt}
                    </p>
                    <span className="mt-4 font-mono text-xs text-mist">
                      {formatDate(other.publishedAt)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
