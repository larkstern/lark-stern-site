# Lark & Stern — Cheetah / Light Theme Site

Single-page landing site: Next.js 14 (App Router) · Tailwind CSS · Framer Motion.

A light/white redesign built around the cheetah identity (speed, agility, precision),
consulting-led, with BioSphere kept as a secondary platform section.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Quick preview (no install)

Open `preview.html` directly in a browser — a dependency-free mirror of the home page
(full-bleed cheetah video hero + BioSphere molecular field). `team.html` mirrors the Team
route for design sign-off. (`blog.html` predates the migration and no longer reflects the
real blog - the live routes do.)

## Blog

All 19 posts were migrated off Wix and live in this repo as MDX. There is no CMS
server and no database - a post is a text file.

```
content/blog/<slug>/index.mdx     frontmatter + body
public/blog/<slug>/               that post's images and video
```

- Posts render at `/post/<slug>` - the same URLs Wix published, so existing links
  and LinkedIn shares keep working. Do not change a published slug.
- `/blog` is the index, with working category filters.
- `/blog-feed.xml` is the RSS feed, served at the same path Wix used.

### Writing a post

Posts are written in **Google Docs** and pulled into the site automatically -
colleagues need no GitHub, Markdown, or logins beyond Google. They copy a template
doc, write, and set "Publish: Yes"; an hourly GitHub Action converts it to MDX and
commits it. Full setup and the colleague-facing instructions are in
[SETUP-google-docs.md](SETUP-google-docs.md).

To add a post yourself by hand, just create `content/blog/<slug>/index.mdx` with
the same frontmatter as an existing post, and push.

### Scripts

```bash
npm run sync-blog                  # pull published Google Docs into the repo
node scripts/migrate-wix.mjs       # (one-time) re-run the Wix import from the saved export
node scripts/verify-migration.mjs  # (one-time) diff every post against the live Wix page
```

`scripts/_wix-export.json` is the raw Wix export - the safety net if anything needs
re-converting after Wix is gone. `verify-migration.mjs` only works while the Wix
site is still up. The Google Docs converter lives in `scripts/lib/gdoc-to-mdx.mjs`.

## Structure

- `app/page.tsx` — home composition (Hero → Solutions → Values → BioSphere → Story → Footer)
- `app/team/page.tsx` — Team page (route `/team`)
- `app/blog/page.tsx` - blog index, reads `content/blog/`
- `app/post/[slug]/page.tsx` - individual post
- `lib/posts.ts` - the only thing that reads post files
- `components/PostMedia.tsx` - `<Figure>`, `<Gallery>`, `<PostVideo>` used inside posts
- `app/layout.tsx` — fonts (Inter / JetBrains Mono / Playfair), metadata, light theme
- `components/MoleculeField.tsx` — ambient molecular/cellular network behind BioSphere
- `components/CheetahField.tsx` — ambient canvas animation: kinetic speed lines + drifting cheetah-spot rosettes
- `components/CheetahRunner.tsx` — running-cheetah silhouette that sprints across the hero with motion-blur trails
- `components/Hero.tsx` — hero + stat strip (cheetah animation background)
- `components/Solutions.tsx` — core services (EBR/SiMPL, MES, SAP, Validation) with benefits/timelines
- `components/Values.tsx` — What Defines Us (Speed, Agility, Focus, Efficiency, Precision, Collaboration)
- `components/BioSphere.tsx` — compact platform section (compliance, traceability, AI-assisted drafting)
- `components/Story.tsx` — Our Story + trusted-by clients
- `components/Footer.tsx` — contact / demo CTAs

## Notes

- Light theme surfaces in `tailwind.config.ts`: canvas `#FBFCFE`, paper `#F2F5FA`, card `#FFFFFF`.
- Brand palette: navy `#1E3768` (headings), steel `#56698E` (body), mist `#8E9BB4`,
  pale `#C7CDDA`, gold accent `#B8901F`. Cheetah accent: tawny `#C8772E` / deep `#9C5A1E`,
  used for the running-cheetah identity, kickers, and key stats.
- Animations respect `prefers-reduced-motion` (the cheetah sprint and canvas field collapse to a static frame).
- BioSphere copy reflects the product highlights with AI framing softened (draft-assistant + human
  Authorship Attestation); refine against `BioSphere_Functional_Specification.md` when available.
- CTAs point to `hello@lark-stern.com` — update if a different contact address is preferred.
