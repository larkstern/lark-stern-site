#!/usr/bin/env node
/**
 * One-time migration: content/blog/<slug>/index.mdx + public/blog/<slug>/*
 * -> Sanity documents + assets.
 *
 * Usage:
 *   node scripts/migrate-to-sanity.mjs --dataset=development
 *   node scripts/migrate-to-sanity.mjs --dataset=production
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and a SANITY_API_TOKEN with write
 * access (Sanity dashboard -> API -> Tokens -> Editor). The app's own
 * runtime client (lib/sanity/client.ts) is read-only and has no token -
 * this script is the one place a write token is used, and only locally.
 *
 * Best-effort converter: handles the markdown patterns actually used across
 * the 19 migrated posts (paragraphs, **bold**, _italic_, blockquotes,
 * bullet/numbered lists, links, and the three custom MDX tags). It is not a
 * general MDX parser - spot-check every migrated post against its live page
 * before deleting content/blog/ or public/blog/.
 *
 * NOTE: <PostVideo> sources are kept as-is, pointing at public/blog/<slug>/
 * (not re-uploaded as Sanity file assets). If/when public/blog/ is deleted,
 * those posts' videos need a separate pass to upload the video file itself.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { createClient } from "@sanity/client";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  })
);

const dataset = args.dataset ?? "development";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in the environment - set both (see .env.local.example) before running this."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const CONTENT_DIR = join(process.cwd(), "content", "blog");

let keyCounter = 0;
function key() {
  return `k${(keyCounter++).toString(36)}`;
}

async function uploadImage(absolutePath) {
  if (!existsSync(absolutePath)) return null;
  const buffer = await readFile(absolutePath);
  const filename = absolutePath.split(/[\\/]/).pop();
  const asset = await client.assets.upload("image", buffer, { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

function publicPath(relativeSrc) {
  return join(process.cwd(), "public", relativeSrc.replace(/^\//, ""));
}

/** Splits a line into Portable Text spans: **bold**, _italic_/*italic*, <u>..</u>, [text](url). */
function inlineToSpans(text) {
  const spans = [];
  const markDefs = [];
  const remaining = text.replace(/<\/?u>/g, "");

  const pattern = /\*\*(.+?)\*\*|[_*](.+?)[_*]|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(remaining))) {
    if (match.index > lastIndex) {
      spans.push({ _type: "span", _key: key(), text: remaining.slice(lastIndex, match.index), marks: [] });
    }
    if (match[1] !== undefined) {
      spans.push({ _type: "span", _key: key(), text: match[1], marks: ["strong"] });
    } else if (match[2] !== undefined) {
      spans.push({ _type: "span", _key: key(), text: match[2], marks: ["em"] });
    } else if (match[3] !== undefined) {
      const markKey = key();
      markDefs.push({ _type: "link", _key: markKey, href: match[4] });
      spans.push({ _type: "span", _key: key(), text: match[3], marks: [markKey] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < remaining.length) {
    spans.push({ _type: "span", _key: key(), text: remaining.slice(lastIndex), marks: [] });
  }
  return { spans: spans.length ? spans : [{ _type: "span", _key: key(), text: remaining, marks: [] }], markDefs };
}

function textParagraphToBlock(para) {
  const isQuote = para.startsWith(">");
  const isList = /^[-*]\s+/.test(para) || /^\d+\.\s+/.test(para);

  if (isList) {
    return para.split("\n").map((line) => {
      const { spans, markDefs } = inlineToSpans(line.replace(/^([-*]|\d+\.)\s+/, ""));
      return {
        _type: "block",
        _key: key(),
        style: "normal",
        listItem: /^\d+\.\s+/.test(line) ? "number" : "bullet",
        level: 1,
        children: spans,
        markDefs,
      };
    });
  }

  const headingMatch = para.match(/^(#{1,6})\s+(.*)$/);
  const { spans, markDefs } = inlineToSpans(
    headingMatch ? headingMatch[2] : para.replace(/^>\s?/, "")
  );
  return {
    _type: "block",
    _key: key(),
    style: headingMatch ? `h${headingMatch[1].length}` : isQuote ? "blockquote" : "normal",
    children: spans,
    markDefs,
  };
}

async function bodyToPortableText(mdxBody) {
  const blocks = [];
  const paragraphs = mdxBody.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  for (const para of paragraphs) {
    const figureMatch = para.match(
      /^<Figure\s+src="([^"]+)"(?:\s+alt="([^"]*)")?(?:\s+caption="([^"]*)")?(?:\s+wrap=\{?(true|false)\}?)?\s*\/>$/
    );
    const galleryMatch = para.match(/^<Gallery\s+images="([^"]+)"\s*\/>$/);
    const videoMatch = para.match(/^<PostVideo\s+src="([^"]+)"(?:\s+poster="([^"]*)")?\s*\/>$/);

    if (figureMatch) {
      const [, src, alt, caption] = figureMatch;
      const image = await uploadImage(publicPath(src));
      if (image) {
        blocks.push({ ...image, _type: "figure", _key: key(), alt: alt ?? "", caption, wrap: figureMatch[4] === "true" });
      }
      continue;
    }

    if (galleryMatch) {
      const images = [];
      for (const p of galleryMatch[1].split("|").filter(Boolean)) {
        const image = await uploadImage(publicPath(p));
        if (image) images.push({ ...image, _key: key() });
      }
      if (images.length) blocks.push({ _type: "gallery", _key: key(), images });
      continue;
    }

    if (videoMatch) {
      const [, src, poster] = videoMatch;
      const posterImage = poster ? await uploadImage(publicPath(poster)) : null;
      blocks.push({
        _type: "postVideo",
        _key: key(),
        url: src.startsWith("http") ? src : `https://www.lark-stern.com${src}`,
        poster: posterImage ?? undefined,
      });
      continue;
    }

    const converted = textParagraphToBlock(para);
    if (Array.isArray(converted)) blocks.push(...converted);
    else blocks.push(converted);
  }

  return blocks;
}

async function migratePost(slug) {
  const file = await readFile(join(CONTENT_DIR, slug, "index.mdx"), "utf8");
  const { data, content } = matter(file);

  const coverImage = data.coverImage ? await uploadImage(publicPath(data.coverImage)) : null;

  // A few posts repeat the cover photo as the body's first Figure - drop
  // that one duplicate rather than porting the old render-time regex check.
  let body = content;
  if (coverImage && data.coverImage) {
    body = body.replace(new RegExp(`<Figure\\s+src="${data.coverImage}"[^>]*/>`), "");
  }

  const doc = {
    _id: `post-${slug}`,
    _type: "post",
    title: data.title ?? slug,
    slug: { _type: "slug", current: slug },
    category: data.category || undefined,
    author: data.author ?? "Lark & Stern",
    publishedAt: new Date(data.publishedAt).toISOString(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    excerpt: data.excerpt ?? "",
    coverImage: coverImage ?? undefined,
    hashtags: data.hashtags ?? undefined,
    body: await bodyToPortableText(body),
  };

  await client.createOrReplace(doc);
  console.log(`  ok: ${slug}`);
}

async function main() {
  console.log(`Migrating content/blog/* -> Sanity dataset "${dataset}"`);
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const slug of slugs) {
    try {
      await migratePost(slug);
    } catch (err) {
      console.error(`  FAILED: ${slug}:`, err.message);
    }
  }
  console.log(`Done. ${slugs.length} posts processed - spot-check each one against /post/<slug>.`);
}

main();
