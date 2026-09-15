/**
 * Verify the migration against the live Wix site.
 *
 * Wix server-renders post bodies into the page HTML, which gives us a completely
 * independent copy of every article to check our MDX against. This downloads all
 * 19 live pages, extracts the article text, and reports any word that exists on
 * the live page but is missing from our file.
 *
 *   node scripts/verify-migration.mjs
 *
 * Run this while the Wix site is still up. Once it is gone, so is the reference.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content", "blog");
const SITE = "https://www.lark-stern.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

// Words that legitimately differ between the two: Wix chrome that sits inside the
// article region, and our own author-name expansion.
const IGNORE = new Set([
  "min", "read", "views", "view", "comment", "comments", "like", "likes",
  "share", "shared", "recent", "posts", "post", "writer", "log", "in",
  "search", "all", "see", "more", "subscribe", "facebook", "linkedin",
  "twitter", "x", "keeanferreira", "tanyalerm", "tanyalerm5", "apr", "may",
  "jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar",
]);

const tokenise = (text) =>
  text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .split(" ")
    .filter((w) => w.length > 2 && !IGNORE.has(w));

/** Strip HTML tags, scripts and styles down to visible text. */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Narrow the page down to the article. Wix wraps each content block in a
 * `data-hook="rcv-blockN"` element, so the body runs from the first to the last.
 */
function extractArticle(html) {
  const first = html.indexOf('data-hook="rcv-block');
  if (first === -1) return null;
  // Start at the "<" that opens the element, not mid-attribute, or tag-stripping
  // leaves a dangling attribute soup behind.
  const start = html.lastIndexOf("<", first);
  // Wix closes the body with an explicit end marker, just before the post footer
  // (categories, share buttons, related posts) that we do not want to compare.
  const marker = html.indexOf('data-hook="rcv-block-last"');
  const end =
    marker === -1
      ? html.lastIndexOf('data-hook="rcv-block')
      : html.lastIndexOf("<", marker);
  return html.slice(start, end);
}

/** Strip frontmatter, JSX components and Markdown syntax down to prose. */
function mdxToText(mdx) {
  return mdx
    .replace(/^---[\s\S]*?\n---\n/, " ")
    .replace(/<[A-Z][\s\S]*?\/>/g, (tag) =>
      " " +
      [...tag.matchAll(/"([^"]*)"/g)]
        .map((m) => m[1])
        .filter((v) => !v.startsWith("/blog/"))
        .join(" ") +
      " "
    )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const slugs = (await readdir(CONTENT, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  console.log(`Checking ${slugs.length} posts against ${SITE}\n`);
  console.log(`${"post".padEnd(58)} ${"live".padStart(5)} ${"ours".padStart(5)}  missing`);
  console.log("-".repeat(84));

  let totalMissing = 0;
  const problems = [];

  for (const slug of slugs) {
    const mdx = await readFile(join(CONTENT, slug, "index.mdx"), "utf8");
    const ourWords = new Set(tokenise(mdxToText(mdx)));

    const res = await fetch(`${SITE}/post/${slug}`, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.log(`${slug.padEnd(58)}  HTTP ${res.status} - could not fetch`);
      problems.push({ slug, reason: `HTTP ${res.status}` });
      continue;
    }

    const article = extractArticle(await res.text());
    if (!article) {
      console.log(`${slug.padEnd(58)}  no article region found`);
      problems.push({ slug, reason: "no article region" });
      continue;
    }

    const liveWords = new Set(tokenise(htmlToText(article)));
    if (liveWords.size < 30) {
      console.log(`${slug.padEnd(58)}  only ${liveWords.size} words extracted - check the selector`);
      problems.push({ slug, reason: `suspiciously small article (${liveWords.size} words)` });
      continue;
    }
    const missing = [...liveWords].filter((w) => !ourWords.has(w));
    totalMissing += missing.length;

    const flag = missing.length === 0 ? "ok" : `${missing.length}  ${missing.slice(0, 6).join(", ")}`;
    console.log(
      `${slug.padEnd(58).slice(0, 58)} ${String(liveWords.size).padStart(5)} ` +
        `${String(ourWords.size).padStart(5)}  ${flag}`
    );
    if (missing.length) problems.push({ slug, missing });
  }

  console.log("-".repeat(84));
  if (!problems.length) {
    console.log("\nAll posts verified: every word on the live pages is present in our copy.");
    return;
  }

  console.log(`\n${problems.length} post(s) need a look, ${totalMissing} distinct missing word(s):\n`);
  for (const p of problems) {
    console.log(`  ${p.slug}`);
    console.log(`    ${p.reason ?? p.missing.join(", ")}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error("\nVerification failed:", err.message);
  process.exit(1);
});
