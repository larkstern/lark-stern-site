/**
 * Convert a Google Doc (exported as HTML) into a blog post MDX string.
 *
 * Google exports a doc as HTML with structure intact - <h1>/<h2> for headings,
 * <ul>/<ol> for lists, links as <a>, and bold/italic as inline styles
 * (font-weight:700 / font-style:italic) rather than <b>/<i> tags. We read that
 * structure the same way the Wix migration read Ricos JSON: as real structure,
 * not by guessing from appearance.
 *
 * Convention a colleague follows in the doc:
 *   - The doc's NAME becomes the post title and URL slug.
 *   - The first paragraphs may be "Key: Value" settings (Category, Publish,
 *     Author). Parsing stops at the first paragraph that isn't one.
 *   - Everything after is the post body.
 *
 * Exported so both the live sync (scripts/sync-google-docs.mjs) and the offline
 * demo (scripts/demo-gdoc.mjs) share exactly one converter.
 */

const VALID_CATEGORIES = ["Lunch & Learn", "Team Growth", "Something exciting"];

/* --------------------------------------------------------------- tiny DOM */

/**
 * A dependency-free HTML tokenizer → shallow tree. The export is machine-
 * generated and well-formed, so a full parser would be overkill; this walks
 * tags and text into nested nodes we can recurse.
 */
function parseHtml(html) {
  const body = html.replace(/^[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*$/i, "");
  const tokens = body.match(/<\/?[a-zA-Z][^>]*>|[^<]+/g) || [];
  const root = { tag: "root", attrs: {}, children: [] };
  const stack = [root];
  const VOID = new Set(["img", "br", "hr", "meta"]);

  for (const token of tokens) {
    if (token.startsWith("</")) {
      if (stack.length > 1) stack.pop();
    } else if (token.startsWith("<")) {
      const tag = (token.match(/^<\s*([a-zA-Z0-9]+)/) || [])[1]?.toLowerCase();
      if (!tag) continue;
      const node = { tag, attrs: parseAttrs(token), children: [] };
      stack[stack.length - 1].children.push(node);
      if (!VOID.has(tag) && !token.endsWith("/>")) stack.push(node);
    } else {
      const text = decodeEntities(token);
      if (text) stack[stack.length - 1].children.push({ tag: "#text", text });
    }
  }
  return root;
}

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&apos;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
}

/* ------------------------------------------------------------ inline text */

const isBold = (style = "") => /font-weight:\s*(700|bold)/.test(style);
const isItalic = (style = "") => /font-style:\s*italic/.test(style);

// MDX would treat these as syntax; the current docs contain none, but be safe.
const escapeMdx = (s) => s.replace(/([<{}])/g, (c) => ({ "<": "&lt;", "{": "&#123;", "}": "&#125;" }[c]));

/** Whitespace stays OUTSIDE emphasis markers, or Markdown won't parse them. */
function wrap(text, before, after = before) {
  const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return m && m[2] ? `${m[1]}${before}${m[2]}${after}${m[3]}` : text;
}

/** Render a node's inline content (text, bold, italic, links) to Markdown. */
function inline(node, inherited = {}) {
  if (node.tag === "#text") {
    const text = escapeMdx(node.text);
    if (!text.trim()) return text;
    let out = text;
    // Headings are already emphasised by being headings; Google marks their text
    // bold, but re-bolding inside a heading is wrong.
    if (inherited.bold && !inherited.suppressBold) out = wrap(out, "**");
    if (inherited.italic) out = wrap(out, "_");
    return out;
  }

  if (node.tag === "a") {
    const href = node.attrs.href || "";
    const label = node.children.map((c) => inline(c, inherited)).join("");
    return href ? wrap(label, "[", `](${href})`) : label;
  }

  const style = node.attrs.style || "";
  const next = {
    bold: inherited.bold || isBold(style),
    italic: inherited.italic || isItalic(style),
    suppressBold: inherited.suppressBold,
  };
  return node.children.map((c) => inline(c, next)).join("");
}

const plain = (node) =>
  node.tag === "#text"
    ? node.text
    : (node.children || []).map(plain).join("");

/* ---------------------------------------------------------------- blocks */

function headingLevel(node) {
  const m = node.tag.match(/^h([1-6])$/);
  if (!m) return null;
  // The doc's own H1 becomes the page title, so the body's top level is H2.
  return Math.min(Math.max(Number(m[1]) + 1, 2), 6);
}

function renderList(node, ordered, depth = 0) {
  const lines = [];
  node.children
    .filter((c) => c.tag === "li")
    .forEach((li, i) => {
      const text = li.children
        .filter((c) => c.tag !== "ul" && c.tag !== "ol")
        .map((c) => inline(c))
        .join("")
        .trim();
      const indent = "  ".repeat(depth);
      if (text) lines.push(`${indent}${ordered ? `${i + 1}.` : "-"} ${text}`);
      for (const sub of li.children.filter((c) => c.tag === "ul" || c.tag === "ol")) {
        lines.push(renderList(sub, sub.tag === "ol", depth + 1));
      }
    });
  return lines.join("\n");
}

/* ----------------------------------------------------------------- main */

/**
 * @param {object} doc            { title, html }  - title is the doc's name
 * @param {object} [opts]
 * @param {(src:string,alt:string)=>string} [opts.onImage]  map a doc image to a
 *        local path; return the path to use. Omit to drop images.
 * @returns {{ slug, frontmatter, body, mdx, settings, warnings }}
 */
export function gdocToMdx(doc, opts = {}) {
  const warnings = [];
  const root = parseHtml(doc.html);
  const blocks = root.children.filter((n) => n.tag !== "#text" || n.text.trim());

  // 1. Pull leading "Key: Value" settings paragraphs off the top.
  const settings = {};
  let bodyStart = 0;
  for (const node of blocks) {
    if (node.tag !== "p") break;
    const text = plain(node).trim();
    if (!text) {
      bodyStart++;
      continue;
    }
    const m = text.match(/^([A-Za-z ]+):\s*(.*)$/);
    const key = m && m[1].trim().toLowerCase();
    if (key === "category" || key === "publish" || key === "author") {
      settings[key] = m[2].trim();
      bodyStart++;
    } else {
      break;
    }
  }

  // 2. Convert the rest to MDX blocks.
  const out = [];
  let imageIndex = 0;
  for (const node of blocks.slice(bodyStart)) {
    const level = headingLevel(node);
    if (level) {
      const text = inline(node, { suppressBold: true }).trim();
      if (text) out.push(`${"#".repeat(level)} ${text}`);
    } else if (node.tag === "p") {
      // A paragraph that is only an image.
      const img = findImage(node);
      if (img && !plain(node).trim()) {
        const line = emitImage(img, opts, ++imageIndex, warnings);
        if (line) out.push(line);
      } else {
        const text = inline(node).trim();
        if (text) out.push(text);
      }
    } else if (node.tag === "ul" || node.tag === "ol") {
      const list = renderList(node, node.tag === "ol");
      if (list) out.push(list);
    } else if (node.tag === "img") {
      const line = emitImage(node, opts, ++imageIndex, warnings);
      if (line) out.push(line);
    } else if (node.tag === "table") {
      out.push(renderTable(node));
    } else {
      const text = inline(node).trim();
      if (text) out.push(text);
    }
  }

  // 3. Settings → frontmatter, with validation a colleague can act on.
  const title = doc.title.trim();
  const slug = slugify(title);

  let category = settings.category || "";
  if (category && !VALID_CATEGORIES.includes(category)) {
    warnings.push(
      `Category "${category}" is not one of ${VALID_CATEGORIES.join(", ")} - leaving it blank.`
    );
    category = "";
  }

  const published = /^(yes|true|y)$/i.test(settings.publish || "");
  const body = out.join("\n\n");
  const excerpt = firstSentences(out);

  const frontmatter = {
    title,
    publishedAt: new Date().toISOString().slice(0, 16),
    author: settings.author || "Lark & Stern",
    category,
    excerpt,
    timeToRead: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
    source: "google-docs",
  };

  return { slug, published, settings, frontmatter, body, warnings, mdx: assemble(frontmatter, body) };
}

function findImage(node) {
  if (node.tag === "img") return node;
  for (const child of node.children || []) {
    const found = findImage(child);
    if (found) return found;
  }
  return null;
}

function emitImage(img, opts, index, warnings) {
  const src = img.attrs.src;
  if (!src) return "";
  const alt = img.attrs.alt || "";
  if (!opts.onImage) {
    warnings.push(`Skipped an image (image handling not enabled).`);
    return "";
  }
  const localPath = opts.onImage(src, alt, index);
  return `<Figure src="${localPath}"${alt ? ` alt=${JSON.stringify(alt)}` : ""} />`;
}

function renderTable(node) {
  const rows = [];
  for (const tr of descendants(node, "tr")) {
    rows.push(
      childrenTagged(tr, ["td", "th"]).map((c) => inline(c).trim().replace(/\|/g, "\\|") || " ")
    );
  }
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (cells) => `| ${Array.from({ length: width }, (_, i) => cells[i] ?? " ").join(" | ")} |`;
  const [head, ...rest] = rows;
  return [line(head), `|${" --- |".repeat(width)}`, ...rest.map(line)].join("\n");
}

function descendants(node, tag, acc = []) {
  for (const c of node.children || []) {
    if (c.tag === tag) acc.push(c);
    descendants(c, tag, acc);
  }
  return acc;
}
const childrenTagged = (node, tags) => (node.children || []).filter((c) => tags.includes(c.tag));

function firstSentences(blocks, max = 220) {
  const para = blocks.find((b) => !b.startsWith("#") && !b.startsWith("<") && !b.startsWith("|"));
  if (!para) return "";
  const clean = para.replace(/[*_[\]]|\(https?:[^)]*\)/g, "").trim();
  return clean.length > max ? clean.slice(0, clean.lastIndexOf(" ", max)) + "…" : clean;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const yamlLine = (k, v) =>
  v === undefined || v === null || v === "" ? null : `${k}: ${JSON.stringify(v)}`;

function assemble(frontmatter, body) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => yamlLine(k, v))
    .filter(Boolean)
    .join("\n");
  return `---\n${fm}\n---\n\n${body}\n`;
}

export { slugify, VALID_CATEGORIES };
