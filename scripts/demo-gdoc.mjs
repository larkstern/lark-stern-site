/**
 * Offline demo of the Google Docs → MDX pipeline.
 * Decodes a doc's exported HTML (saved as base64) and runs the real converter,
 * then writes the post into content/blog/ so it renders on the local site.
 *
 *   node scripts/demo-gdoc.mjs <title> <path-to-base64-html>
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gdocToMdx } from "./lib/gdoc-to-mdx.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const [title, b64Path] = process.argv.slice(2);
if (!title || !b64Path) {
  console.error("usage: node scripts/demo-gdoc.mjs <title> <base64-html-file>");
  process.exit(1);
}

const html = Buffer.from((await readFile(b64Path, "utf8")).trim(), "base64").toString("utf8");
const result = gdocToMdx({ title, html });

console.log("=".repeat(70));
console.log("Doc title :", title);
console.log("Slug      :", result.slug, " → /post/" + result.slug);
console.log("Settings  :", JSON.stringify(result.settings));
console.log("Publish?  :", result.published ? "YES - would go live" : "no (draft)");
console.log("Warnings  :", result.warnings.length ? result.warnings.join("; ") : "none");
console.log("=".repeat(70));
console.log(result.mdx);
console.log("=".repeat(70));

if (result.published) {
  const dir = join(ROOT, "content", "blog", result.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.mdx"), result.mdx, "utf8");
  console.log(`Wrote content/blog/${result.slug}/index.mdx`);
} else {
  console.log("Not published - nothing written.");
}
