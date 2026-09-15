import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = join(process.cwd(), "content", "blog");

export type Post = {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  /** Two of the migrated posts were published without one. */
  category?: string;
  excerpt: string;
  coverImage?: string;
  timeToRead: number;
  /** Original Wix post id, kept so a post can be traced back to the export. */
  wixId?: string;
  hashtags?: string[];
  body: string;
};

export type PostMeta = Omit<Post, "body">;

/**
 * Turn any frontmatter date into a real Date, whatever shape it arrives in.
 * YAML silently parses an unquoted ISO timestamp into a Date object, a quoted
 * one stays a string, and a naive "2025-05-19T11:17" has no timezone - so accept
 * all three rather than assume one. A naive value is read as UTC (what Wix used).
 */
export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const s = String(value ?? "");
  // Bare "YYYY-MM-DDTHH:mm" with nothing after it: pin to UTC.
  return new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00Z` : s);
}

/** Formats as "12 Jun 2026" - unambiguous, and matches the site's dry register. */
export function formatDate(iso: string | Date): string {
  return toDate(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ~200 words a minute, rounded up. Used when frontmatter omits a read time. */
function estimateReadTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Normalise a frontmatter date to a stable ISO string for storage and sorting. */
function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

async function readPost(slug: string): Promise<Post> {
  const file = await readFile(join(CONTENT_DIR, slug, "index.mdx"), "utf8");
  const { data, content } = matter(file);

  return {
    slug,
    title: data.title ?? slug,
    // Coerce to a string here so nothing downstream has to care whether YAML
    // handed us a Date or a string. Sorting and toDate() both expect a string.
    publishedAt: toIso(data.publishedAt),
    updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
    author: data.author ?? "Lark & Stern",
    // A post with no category is stored as an empty string; treat that as absent.
    category: data.category || undefined,
    excerpt: data.excerpt ?? "",
    coverImage: data.coverImage,
    timeToRead: data.timeToRead ?? estimateReadTime(content),
    wixId: data.wixId,
    hashtags: data.hashtags,
    body: content,
  };
}

/**
 * Every post, newest first. A single unreadable post is skipped with a warning
 * rather than crashing the whole blog - one bad file should never take the site
 * down, which is exactly what happened when a saved date broke every page.
 */
export async function getAllPosts(): Promise<Post[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const results = await Promise.allSettled(
    entries.filter((e) => e.isDirectory()).map((e) => readPost(e.name))
  );

  const posts: Post[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") posts.push(result.value);
    else console.warn(`Skipping unreadable post: ${result.reason}`);
  }

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    return await readPost(slug);
  } catch {
    return null;
  }
}

export async function getPostSlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
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
