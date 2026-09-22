import { defineField, defineType } from "sanity";

// Field set mirrors the frontmatter every migrated MDX post already used
// (lib/posts.ts), so the site's read side needed no shape changes.
export default defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: ["Lunch & Learn", "Team Growth", "Something exciting"],
      },
    }),
    defineField({
      name: "author",
      type: "string",
      initialValue: "Lark & Stern",
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "updatedAt", type: "datetime" }),
    defineField({ name: "excerpt", type: "text", rows: 3 }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "hashtags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        {
          // Replaces the migrated MDX <Figure> component.
          type: "image",
          name: "figure",
          title: "Figure",
          options: { hotspot: true },
          fields: [
            { name: "caption", type: "string" },
            {
              name: "wrap",
              type: "boolean",
              title: "Wrap text beside image",
              initialValue: false,
            },
          ],
        },
        {
          // Replaces the migrated MDX <Gallery>.
          type: "object",
          name: "gallery",
          title: "Gallery",
          fields: [
            {
              name: "images",
              type: "array",
              of: [{ type: "image" }],
              validation: (rule) => rule.min(1),
            },
          ],
          preview: { select: { media: "images.0" } },
        },
        {
          // Replaces the migrated MDX <PostVideo>.
          type: "object",
          name: "postVideo",
          title: "Video",
          fields: [
            { name: "url", type: "url", title: "Video URL (mp4)" },
            { name: "poster", type: "image", title: "Poster image" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
