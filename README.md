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

Posts are authored in Sanity (a hosted CMS) and read at build/request time via
`lib/posts.ts` -> `lib/sanity/queries.ts`. There is no local content file for a
post - `content/blog/` and `public/blog/` are the pre-migration Wix export, kept
only until the Sanity migration is verified (see below).

- Posts render at `/post/<slug>` - the same URLs Wix published, so existing links
  and LinkedIn shares keep working. Do not change a published slug (the slug
  field in Sanity).
- `/blog` is the index, with working category filters.
- `/blog-feed.xml` is the RSS feed, served at the same path Wix used.

### Writing a post

Go to `/studio` on the live site (or `localhost:3000/studio` locally) and sign
in with Sanity. No GitHub, no Markdown. Fields: Title, Category, Author, Cover
image, Excerpt, Body (rich text - headings, bold/italic, lists, links, images,
plus Figure/Gallery/Video blocks for the same layouts the old MDX posts used).
A document only appears on the live site once published (Sanity's own
draft/publish state).

Who can access `/studio` is managed in the Sanity project's dashboard
(Members -> Invite) - reaching the URL grants nothing by itself; publishing
requires being an invited project member.

### Sanity project setup

- Provisioned via Vercel -> Project -> Integrations -> Sanity, which sets
  `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` in the Vercel
  project automatically. For local dev, copy `.env.local.example` to
  `.env.local` and fill in the same project id.
- Two datasets: `production` (live site) and `development` (local testing -
  create this one by hand in the Sanity dashboard, the integration only
  creates `production`).
- Schema: `sanity/schemaTypes/post.ts`.

### Scripts

```bash
node scripts/migrate-wix.mjs        # (one-time, historical) the original Wix import
node scripts/verify-migration.mjs   # (one-time, historical) diff against the live Wix page
node scripts/migrate-to-sanity.mjs --dataset=development   # move content/blog/* into Sanity
```

`migrate-to-sanity.mjs` needs `SANITY_API_TOKEN` (write access - see
`.env.local.example`). It's a best-effort MDX-to-rich-text converter; spot-check
every migrated post against its live page before deleting `content/blog/` or
`public/blog/`.

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
