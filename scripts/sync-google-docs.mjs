/**
 * Pull blog posts from a Google Drive folder into content/blog/.
 *
 * Runs unattended in GitHub Actions on a schedule. For every Google Doc in the
 * configured folder that is marked "Publish: Yes", it converts the doc to MDX
 * (via scripts/lib/gdoc-to-mdx.mjs - the same converter proven in the demo),
 * downloads any images, and writes content/blog/<slug>/. A doc marked
 * "Publish: No" is removed from the site if it was there before.
 *
 * Auth: a Google service account with the Drive + Docs APIs enabled, whose email
 * has been given (read) access to the folder. Credentials come from env:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  - the service account key file, as a JSON string
 *   GOOGLE_DRIVE_FOLDER_ID       - the "Lark & Stern - Blog" folder id
 *
 * The commit + deploy is handled by the workflow, not here. This script only
 * writes files and prints a summary; it never calls git.
 */
import { mkdir, writeFile, rm, readdir, readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "googleapis";
import { gdocToMdx } from "./lib/gdoc-to-mdx.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content", "blog");

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SA_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!FOLDER_ID || !SA_JSON) {
  console.error(
    "Missing GOOGLE_DRIVE_FOLDER_ID or GOOGLE_SERVICE_ACCOUNT_JSON. See SETUP-google-docs.md."
  );
  process.exit(1);
}

/** Posts this sync owns. Hand-written and migrated posts are never touched. */
const OWNED = "google-docs";

function driveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(SA_JSON),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

/** List every Google Doc in the folder. */
async function listDocs(drive) {
  const docs = [];
  let pageToken;
  do {
    const { data } = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
      fields: "nextPageToken, files(id, name, modifiedTime)",
      pageSize: 100,
      pageToken,
      // Let the query see folders that live in a company Shared drive, not just
      // a personal My Drive folder. Harmless for the My Drive case.
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    docs.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return docs;
}

async function exportHtml(drive, fileId) {
  const { data } = await drive.files.export(
    { fileId, mimeType: "text/html" },
    { responseType: "text" }
  );
  return data;
}

/** Download an image referenced in the exported HTML into the post's folder. */
async function downloadImage(url, destDir, index) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image ${res.status}`);
  const type = res.headers.get("content-type") || "";
  const ext = type.includes("png") ? "png" : type.includes("gif") ? "gif" : "jpg";
  const filename = index === 1 ? `cover.${ext}` : `image-${index}.${ext}`;
  await writeFile(join(destDir, filename), Buffer.from(await res.arrayBuffer()));
  return filename;
}

async function existingOwnedSlugs() {
  const slugs = new Set();
  let entries;
  try {
    entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  } catch {
    return slugs;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      const mdx = await readFile(join(CONTENT_DIR, e.name, "index.mdx"), "utf8");
      if (/^source:\s*["']?google-docs/m.test(mdx)) slugs.add(e.name);
    } catch {
      /* ignore */
    }
  }
  return slugs;
}

async function main() {
  const drive = driveClient();
  const docs = await listDocs(drive);
  console.log(`Found ${docs.length} doc(s) in the folder.\n`);

  const previouslySynced = await existingOwnedSlugs();
  const keep = new Set();
  let published = 0;
  let drafts = 0;

  for (const doc of docs) {
    // Skip the template itself.
    if (/template/i.test(doc.name)) continue;

    const html = await exportHtml(drive, doc.id);

    // First pass: read settings/slug without committing to images.
    const preview = gdocToMdx({ title: doc.name, html });
    if (!preview.published) {
      drafts++;
      console.log(`  draft   ${doc.name}  (Publish is not "Yes")`);
      continue;
    }

    const slug = preview.slug;
    const mediaDir = join(ROOT, "public", "blog", slug);
    const contentDir = join(CONTENT_DIR, slug);
    await mkdir(mediaDir, { recursive: true });
    await mkdir(contentDir, { recursive: true });

    // Second pass: this time download each image and rewrite it to a local path.
    let imageCount = 0;
    const result = gdocToMdx(
      { title: doc.name, html },
      {
        onImage: (src, _alt, index) => {
          // Downloading happens after; here we just reserve the path.
          imageCount = Math.max(imageCount, index);
          return `/blog/${slug}/__img${index}__`;
        },
      }
    );

    // Resolve the reserved image paths by downloading, then patch the MDX.
    let mdx = result.mdx;
    const imgUrls = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
    for (let i = 1; i <= imgUrls.length; i++) {
      try {
        const filename = await downloadImage(imgUrls[i - 1], mediaDir, i);
        mdx = mdx.replace(`/blog/${slug}/__img${i}__`, `/blog/${slug}/${filename}`);
        // The first image also becomes the cover.
        if (i === 1) {
          mdx = mdx.replace(
            /^(---\n[\s\S]*?)\n---/,
            (_, fm) => `${fm}\ncoverImage: ${JSON.stringify(`/blog/${slug}/${filename}`)}\n---`
          );
        }
      } catch (err) {
        console.warn(`    ! image ${i} on "${doc.name}" failed: ${err.message}`);
      }
    }

    await writeFile(join(contentDir, "index.mdx"), mdx, "utf8");
    keep.add(slug);
    published++;
    const warn = result.warnings.length ? `  [${result.warnings.join("; ")}]` : "";
    console.log(`  publish ${doc.name}  → /post/${slug}  (${imgUrls.length} image(s))${warn}`);
  }

  // Anything we synced before but is no longer "Publish: Yes" comes down.
  for (const slug of previouslySynced) {
    if (!keep.has(slug)) {
      await rm(join(CONTENT_DIR, slug), { recursive: true, force: true });
      await rm(join(ROOT, "public", "blog", slug), { recursive: true, force: true });
      console.log(`  remove  ${slug}  (no longer published)`);
    }
  }

  console.log(`\nDone. ${published} published, ${drafts} draft(s).`);
}

main().catch((err) => {
  console.error("\nSync failed:", err.message);
  process.exit(1);
});
