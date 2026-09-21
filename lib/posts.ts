// Compatibility layer: app/blog/page.tsx, app/post/[slug]/page.tsx, and
// app/blog-feed.xml/route.ts all import from "@/lib/posts" and need no
// changes of their own - only where the data actually comes from moved,
// from content/blog/*/index.mdx to Sanity.
export type { Post, PostMeta } from "./sanity/queries";
export {
  getAllPosts,
  getPost,
  getPostSlugs,
  getCategories,
} from "./sanity/queries";
export { toDate, formatDate } from "./date-utils";
