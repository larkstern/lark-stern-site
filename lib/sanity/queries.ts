import { sanityClient } from "./client";
import { urlFor } from "./image";

export type Post = {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category?: string;
  excerpt: string;
  /** Resolved Sanity CDN URL, already absolute - callers must not prefix it. */
  coverImage?: string;
  timeToRead: number;
  hashtags?: string[];
  /** Portable Text blocks - rendered via <PortableText> + components/PostMedia.tsx. */
  body: unknown[];
};

export type PostMeta = Omit<Post, "body">;

type RawPost = Omit<Post, "coverImage" | "timeToRead"> & {
  coverImage: unknown;
  timeToRead?: number;
};

const POST_PROJECTION = `{
  "slug": slug.current,
  title,
  publishedAt,
  updatedAt,
  author,
  category,
  excerpt,
  coverImage,
  timeToRead,
  hashtags,
  body
}`;

/** ~200 words a minute, rounded up. Used when a post omits an explicit read time. */
function estimateReadTime(body: unknown[]): number {
  const text = body
    .filter((block): block is { _type: string; children?: { text?: string }[] } =>
      typeof block === "object" && block !== null && (block as any)._type === "block"
    )
    .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function resolvePost(raw: RawPost): Post {
  return {
    ...raw,
    coverImage: raw.coverImage ? urlFor(raw.coverImage as any).width(1600).url() : undefined,
    timeToRead: raw.timeToRead ?? estimateReadTime(raw.body),
  };
}

/** Every post, newest first. */
export async function getAllPosts(): Promise<Post[]> {
  const raw = await sanityClient.fetch<RawPost[]>(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) ${POST_PROJECTION}`
  );
  return raw.map(resolvePost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const raw = await sanityClient.fetch<RawPost | null>(
    `*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`,
    { slug }
  );
  return raw ? resolvePost(raw) : null;
}

export async function getPostSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(
    `*[_type == "post" && defined(slug.current)].slug.current`
  );
}

/**
 * Category names in publication order, so the filter row stays stable as posts
 * are added rather than reshuffling on every publish.
 */
export async function getCategories(posts: PostMeta[]): Promise<string[]> {
  const seen = new Set<string>();
  for (const post of posts) {
    if (post.category) seen.add(post.category);
  }
  return Array.from(seen).sort();
}
