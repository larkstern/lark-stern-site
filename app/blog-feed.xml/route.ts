import { getAllPosts, toDate } from "@/lib/posts";

// Served at /blog-feed.xml - the exact path the Wix site used, so anything
// subscribed to the old feed keeps working across the cutover.

const SITE = "https://www.lark-stern.com";

const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, "]]&gt;")}]]>`;

export async function GET() {
  const posts = await getAllPosts();
  const updated = posts[0]?.publishedAt ?? new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = `${SITE}/post/${post.slug}`;
      const cover = post.coverImage ? `${SITE}${post.coverImage}` : null;
      return [
        "<item>",
        `<title>${cdata(post.title)}</title>`,
        `<description>${cdata(post.excerpt)}</description>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        post.category ? `<category>${cdata(post.category)}</category>` : "",
        `<pubDate>${toDate(post.publishedAt).toUTCString()}</pubDate>`,
        cover ? `<enclosure url="${cover}" length="0" type="image/jpeg"/>` : "",
        `<dc:creator>${cdata(post.author)}</dc:creator>`,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">' +
    "<channel>" +
    `<title>${cdata("Lark & Stern | Blog")}</title>` +
    `<link>${SITE}/blog</link>` +
    `<description>${cdata("News, Lunch & Learn recaps, and life inside Lark & Stern.")}</description>` +
    "<language>en</language>" +
    `<lastBuildDate>${toDate(updated).toUTCString()}</lastBuildDate>` +
    `<atom:link href="${SITE}/blog-feed.xml" rel="self" type="application/rss+xml"/>` +
    items +
    "</channel></rss>";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
