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
(full-bleed cheetah video hero + BioSphere molecular field). `team.html` and `blog.html`
mirror the Team and Blog routes and cross-link via the nav, for design sign-off.

## Structure

- `app/page.tsx` — home composition (Hero → Solutions → Values → BioSphere → Story → Footer)
- `app/team/page.tsx` — Team page (route `/team`)
- `app/blog/page.tsx` — Blog page (route `/blog`)
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
