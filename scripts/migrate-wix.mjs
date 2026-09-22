/**
 * One-time migration: pull every Wix blog post into content/blog/ as MDX.
 *
 * Wix renders post bodies from a JSON document (Ricos rich content). This reads
 * that same document - the one the Wix front-end itself fetches - so headings,
 * lists, captions and link targets arrive as structured data rather than having
 * to be reverse-engineered out of styled markup.
 *
 *   node scripts/migrate-wix.mjs
 *
 * Re-runnable: media already on disk is not downloaded again.
 * Check the result with: node scripts/verify-migration.mjs
 */
import { mkdir, writeFile, readFile, access, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.lark-stern.com";
const BLOG_APP_ID = "14bcded7-0066-7c35-14d7-466cb3f09103";
const EXPORT_FILE = join(ROOT, "scripts", "_wix-export.json");

// Wix's categories endpoint 404s on this site, so the names are recovered from
// the RSS feed and pinned here by id. Two posts have no category at all.
const CATEGORIES = {
  "67b5bb4ca6c4a8109e631802": "Lunch & Learn",
  "67b5bbd0a6c4a8109e631812": "Team Growth",
  "69b15a3dd10b0e3fea123536": "Something exciting",
};

// Wix stores author handles, not display names.
const AUTHORS = {
  keeanferreira: "Keean Ferreira",
  tanyalerm5: "Tanya Lerm",
};

// Ricos node types.
const N = {
  PARAGRAPH: 0,
  TEXT: 1,
  HEADING: 2,
  BULLETED_LIST: 3,
  ORDERED_LIST: 4,
  LIST_ITEM: 5,
  BLOCKQUOTE: 6,
  VIDEO: 8,
  GALLERY: 11,
  IMAGE: 14,
  TABLE: 21,
  TABLE_CELL: 26,
  TABLE_ROW: 27,
  CAPTION: 30,
};

// Ricos decorations. Colour (7) and font size (8) are deliberately dropped: they
// are almost always plain black at default size, and would fight the site theme.
const D = { BOLD: 0, ITALIC: 1, UNDERLINE: 2, LINK: 6 };

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

async function getJSON(url, headers = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Fetch every post, or reuse the committed export if it is already present. */
async function fetchPosts() {
  if (await exists(EXPORT_FILE)) {
    console.log("Using committed export at scripts/_wix-export.json");
    return JSON.parse(await readFile(EXPORT_FILE, "utf8"));
  }

  console.log("Fetching Wix app instance token...");
  const model = await getJSON(`${SITE}/_api/v2/dynamicmodel`);
  const instance = model?.apps?.[BLOG_APP_ID]?.instance;
  if (!instance) throw new Error("Could not read the blog app instance token");

  // `fieldsets` must be ONE comma-joined string. Repeating the param returns HTTP 400.
  const fieldsets = "content,categories,tags,owner,seo,urls";
  const url = `${SITE}/_api/communities-blog-node-api/_api/posts?offset=0&size=100&fieldsets=${fieldsets}`;

  console.log("Fetching posts...");
  const posts = await getJSON(url, { Authorization: instance });
  if (!Array.isArray(posts)) {
    throw new Error(`Unexpected response: ${JSON.stringify(posts).slice(0, 300)}`);
  }

  await writeFile(EXPORT_FILE, JSON.stringify(posts, null, 2), "utf8");
  console.log(`Saved raw export (${posts.length} posts) to scripts/_wix-export.json`);
  return posts;
}

/* ------------------------------------------------------------------ text */

// MDX treats < and { as syntax. The current 19 posts contain neither, but future
// content might, so escape defensively.
const escapeMdx = (s) =>
  s.replace(/</g, "&lt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");

// Wix is full of non-breaking spaces, which wrap badly in a fluid layout.
const normalise = (s) => s.replace(/\u00a0/g, " ");

/**
 * Apply a decoration, keeping whitespace OUTSIDE the markers. Wix stores trailing
 * spaces inside bold runs ("**text. **"), which Markdown will not parse as
 * emphasis at all.
 */
function wrap(text, before, after = before) {
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return text;
  return `${match[1]}${before}${match[2]}${after}${match[3]}`;
}

function renderText(node) {
  const data = node.textData;
  if (!data) return "";
  let text = escapeMdx(normalise(data.text ?? ""));
  if (!text) return "";

  let bold = false;
  let italic = false;
  let underline = false;
  let link = null;

  for (const dec of data.decorations ?? []) {
    if (dec.type === D.BOLD && (dec.fontWeightValue ?? 0) >= 600) bold = true;
    else if (dec.type === D.ITALIC) italic = true;
    else if (dec.type === D.UNDERLINE) underline = true;
    else if (dec.type === D.LINK) link = dec.linkData?.link?.url ?? null;
  }

  if (bold) text = wrap(text, "**");
  if (italic) text = wrap(text, "_");
  // Underlining a link would be redundant, and nested tags read badly.
  if (underline && !link) text = wrap(text, "<u>", "</u>");
  if (link) text = wrap(text, "[", `](${link})`);
  return text;
}

/** Concatenate all inline text beneath a node. */
function inline(node) {
  return (node.nodes ?? [])
    .map((child) => (child.type === N.TEXT ? renderText(child) : inline(child)))
    .join("");
}

/* ----------------------------------------------------------------- media */

function makeMediaCollector(slug) {
  const queue = [];
  const counters = { image: 0, gallery: 0 };

  const add = (url, filename) => {
    if (!queue.some((m) => m.filename === filename)) queue.push({ url, filename });
    return `/blog/${slug}/${filename}`;
  };

  const collector = {
    queue,

    /**
     * Wix's CDN resizes on demand, so no local image library is needed.
     * Always request .jpg: a PNG source stays ~1.8 MB as .png or .webp, but
     * converts to ~0.13 MB as .jpg.
     */
    image(wixId, filename) {
      if (!wixId) return null;
      const name = filename ?? `image-${++counters.image}.jpg`;
      const url = `https://static.wixstatic.com/media/${wixId}/v1/fit/w_1600,h_1600,al_c,q_85/file.jpg`;
      return add(url, name);
    },

    galleryImage(wixId) {
      return collector.image(wixId, `gallery-${++counters.gallery}.jpg`);
    },

    // Only the 480p rendition exists on Wix; 240p/360p/720p all return 403.
    video(wixId) {
      return wixId ? add(`https://video.wixstatic.com/${wixId}`, "video.mp4") : null;
    },

    videoPoster(wixId) {
      return wixId ? add(`https://static.wixstatic.com/${wixId}`, "video-poster.jpg") : null;
    },
  };

  return collector;
}

/* ---------------------------------------------------------------- blocks */

const attr = (name, value) => {
  if (!value) return "";
  // Arrays need an expression container; plain strings read better as "..." -
  // unless they contain a double quote, which a JSX string literal cannot escape.
  if (Array.isArray(value) || String(value).includes('"')) {
    return ` ${name}={${JSON.stringify(value)}}`;
  }
  return ` ${name}=${JSON.stringify(value)}`;
};

/**
 * `demoteHeadings` is true for posts where every heading-level node is the
 * ONLY body content (no real paragraph anywhere) - some Wix authors used the
 * "Heading" style purely to make body text bigger, not to mark real section
 * titles. Rendered as literal `#`/`##`, those become a page that is entirely
 * bold headings; rendered as plain text, they read as the prose they are.
 */
function renderBlock(node, media, depth = 0, demoteHeadings = false) {
  switch (node.type) {
    case N.PARAGRAPH: {
      // Empty paragraphs are Wix's spacers, not content.
      const text = inline(node).trim();
      if (!text || isHashtagLine(text)) return [];
      return [text];
    }

    case N.HEADING: {
      const text = inline(node).trim();
      if (!text || isHashtagLine(text)) return [];
      if (demoteHeadings) return [text];
      // h1 belongs to the page title, so body headings start at h2.
      const level = Math.min(Math.max(node.headingData?.level ?? 2, 2), 6);
      return [`${"#".repeat(level)} ${text}`];
    }

    case N.BULLETED_LIST:
    case N.ORDERED_LIST: {
      const ordered = node.type === N.ORDERED_LIST;
      const lines = [];
      (node.nodes ?? []).forEach((item, i) => {
        const parts = (item.nodes ?? []).flatMap((c) => renderBlock(c, media, depth + 1, demoteHeadings));
        if (!parts.length) return;
        const indent = "  ".repeat(depth);
        lines.push(`${indent}${ordered ? `${i + 1}.` : "-"} ${parts[0]}`);
        // Continuation lines (nested lists, extra paragraphs) hang under the marker.
        for (const extra of parts.slice(1)) lines.push(`${indent}  ${extra}`);
      });
      return lines.length ? [lines.join("\n")] : [];
    }

    case N.BLOCKQUOTE: {
      const parts = (node.nodes ?? []).flatMap((c) => renderBlock(c, media, depth, demoteHeadings));
      if (!parts.length) return [];
      const quoted = parts
        .join("\n\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return [quoted];
    }

    case N.IMAGE: {
      const data = node.imageData ?? {};
      const src = media.image(data.image?.src?.id);
      if (!src) return [];
      const caption = normalise(data.caption ?? "").trim();
      const alt = caption || data.altText || "";
      // Wix positions most images as full-width blocks (alignment 0), but some
      // are set to sit beside text instead - render those smaller and floated.
      const wrap = (data.containerData?.alignment ?? 0) !== 0;
      return [
        `<Figure${attr("src", src)}${attr("alt", alt)}${attr("caption", caption)}${wrap ? " wrap" : ""} />`,
      ];
    }

    case N.GALLERY: {
      const images = (node.galleryData?.items ?? [])
        .map((item) => media.galleryImage(item.image?.media?.src?.url))
        .filter(Boolean);
      // Joined string, not an array - see the comment on Gallery in PostMedia.tsx.
      return images.length ? [`<Gallery${attr("images", images.join("|"))} />`] : [];
    }

    case N.VIDEO: {
      const data = node.videoData ?? {};
      const src = media.video(data.video?.src?.id);
      if (!src) return [];
      const poster = media.videoPoster(data.thumbnail?.src?.id);
      return [`<PostVideo${attr("src", src)}${attr("poster", poster)} />`];
    }

    case N.TABLE: {
      const rows = (node.nodes ?? []).map((row) =>
        (row.nodes ?? []).map((cell) => inline(cell).trim().replace(/\|/g, "\\|") || " ")
      );
      if (!rows.length) return [];
      const width = Math.max(...rows.map((r) => r.length));
      const line = (cells) =>
        `| ${Array.from({ length: width }, (_, i) => cells[i] ?? " ").join(" | ")} |`;
      // Markdown requires a header row; Wix tables use their first row as one.
      const [head, ...body] = rows;
      return [[line(head), `|${" --- |".repeat(width)}`, ...body.map(line)].join("\n")];
    }

    default:
      // Captions, list items and any unrecognised wrapper: descend into children.
      return (node.nodes ?? []).flatMap((c) => renderBlock(c, media, depth, demoteHeadings));
  }
}

/**
 * Wix stores each post's tags twice: once as a clean `post.hashtags` array,
 * and again as a literal "#tag #tag ..." line typed into the body itself
 * (rendered live as clickable tag links). We use the clean array to build
 * real links and skip the literal line so the raw text is not duplicated.
 */
const isHashtagLine = (text) => /^(#[^\s#]+\s*)+$/.test(text.trim());

/* ------------------------------------------------------------------ post */

/**
 * Store the date as naive "YYYY-MM-DDTHH:mm" (no seconds, no timezone). Wix gives
 * full ISO ("2025-05-19T11:17:33.037Z"); keep the UTC wall-clock reading and drop
 * the rest. Naive is more stable to display - a 19:30 UTC post would otherwise
 * show as the next day east of GMT - and lib/posts.ts reads it back as UTC.
 */
const toDatetime = (iso) => (iso ? iso.slice(0, 16) : null);

const yaml = (key, value) =>
  value === undefined || value === null || value === ""
    ? null
    : `${key}: ${JSON.stringify(value)}`;

/** True when a post has no real paragraph text anywhere - see renderBlock. */
function shouldDemoteHeadings(nodes) {
  let sawHeading = false;
  for (const node of nodes ?? []) {
    if (node.type === N.HEADING) sawHeading = true;
    if (node.type === N.PARAGRAPH) {
      const text = inline(node).trim();
      if (text && !isHashtagLine(text)) return false; // real body paragraph exists
    }
  }
  return sawHeading;
}

function toMdx(post, media) {
  const demoteHeadings = shouldDemoteHeadings(post.richContent?.nodes);
  const body = (post.richContent?.nodes ?? [])
    .flatMap((node) => renderBlock(node, media, 0, demoteHeadings))
    .join("\n\n");

  // Wix's clean tag list, turned into real links back to the filtered blog index.
  const tagLinks = (post.hashtags ?? [])
    .map((tag) => `[#${tag}](/blog?tag=${encodeURIComponent(tag)})`)
    .join(" ");

  const cover = media.image(post.coverImage?.src?.id, "cover.jpg");
  const handle = post.owner?.name ?? post.owner?.slug ?? "";

  const frontmatter = [
    yaml("title", normalise(post.title ?? "").trim()),
    // No `slug` key: the directory name is the slug.
    // firstPublishedDate, NOT createdDate - Wix rewrites createdDate to the export time.
    yaml("publishedAt", toDatetime(post.firstPublishedDate)),
    yaml("updatedAt", toDatetime(post.lastPublishedDate)),
    yaml("author", AUTHORS[handle] ?? handle),
    yaml("category", CATEGORIES[post.categoryIds?.[0]] ?? null),
    yaml("excerpt", normalise(post.excerpt ?? "").trim()),
    yaml("coverImage", cover),
    yaml("timeToRead", post.timeToRead),
    yaml("wixId", post._id),
    yaml("hashtags", post.hashtags?.length ? post.hashtags : null),
  ].filter(Boolean);

  const fullBody = tagLinks ? `${body}\n\n${tagLinks}` : body;
  return `---\n${frontmatter.join("\n")}\n---\n\n${fullBody}\n`;
}

async function download(url, dest) {
  if (await exists(dest)) return 0;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} downloading ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return (await stat(dest)).size;
}

async function main() {
  const posts = await fetchPosts();
  console.log(`\n${posts.length} posts to migrate\n`);

  let downloaded = 0;
  let bytes = 0;

  const ordered = [...posts].sort((a, b) =>
    a.firstPublishedDate.localeCompare(b.firstPublishedDate)
  );

  for (const post of ordered) {
    const { slug } = post;
    const media = makeMediaCollector(slug);
    const mdx = toMdx(post, media);

    const contentDir = join(ROOT, "content", "blog", slug);
    const mediaDir = join(ROOT, "public", "blog", slug);
    await mkdir(contentDir, { recursive: true });
    await mkdir(mediaDir, { recursive: true });
    await writeFile(join(contentDir, "index.mdx"), mdx, "utf8");

    for (const asset of media.queue) {
      const size = await download(asset.url, join(mediaDir, asset.filename));
      if (size) {
        downloaded++;
        bytes += size;
      }
    }

    const words = mdx.split(/\s+/).filter(Boolean).length;
    console.log(
      `  ${post.firstPublishedDate.slice(0, 10)}  ${slug.padEnd(58).slice(0, 58)}` +
        `${String(words).padStart(5)}w  ${String(media.queue.length).padStart(2)} asset(s)`
    );
  }

  console.log(
    `\nDone. ${downloaded} new asset(s), ${(bytes / 1048576).toFixed(1)} MB downloaded.`
  );
  console.log("Next: node scripts/verify-migration.mjs");
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  process.exit(1);
});
