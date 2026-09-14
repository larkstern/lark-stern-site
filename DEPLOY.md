# Deploying Lark & Stern to Vercel

This is a standard Next.js 14 app — Vercel auto-detects everything. No config changes needed.
Plan on ~15 minutes.

## What you need
- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account (sign in with GitHub)

---

## Step 1 — Put the project in a GitHub repo

From inside the `Overhaul` folder:

```bash
git init
git add .
git commit -m "Lark & Stern site"
```

Create an empty repo on GitHub (e.g. `lark-stern-site`), then:

```bash
git remote add origin https://github.com/<your-username>/lark-stern-site.git
git branch -M main
git push -u origin main
```

> `node_modules/` and `.next/` are already git-ignored, so only source is pushed.

## Step 2 — Import into Vercel

1. Go to **vercel.com/new**.
2. Choose **Import Git Repository** and pick `lark-stern-site`.
3. Vercel auto-detects **Next.js**. Leave all defaults:
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output: *(automatic)*
   - Install Command: `npm install`
   - Environment variables: **none needed**
4. Click **Deploy**. In ~1–2 min you get a live URL like `lark-stern-site.vercel.app`.

Check that URL first — the cheetah video (`public/cheetah-hero.mp4`), Team, and Blog pages should all work.

**CLI alternative:** `npm i -g vercel`, then run `vercel` in the folder and follow the prompts; `vercel --prod` for production.

## Step 3 — Connect your domain (lark-stern.com)

In the Vercel project → **Settings → Domains** → add both:
- `lark-stern.com`
- `www.lark-stern.com`

Vercel then shows the exact DNS records to create. As of now they are:

| Record | Name/Host | Value |
|--------|-----------|-------|
| `A`    | `@` (apex) | `76.76.21.21` |
| `CNAME`| `www`     | `cname.vercel-dns.com` |

**Always use the exact values Vercel displays** — treat the table above as a guide, not gospel (Vercel's IPs can change).

### Where to change DNS
Your domain currently runs through **Wix**. Edit the DNS records wherever the domain is managed:
- If registered **through Wix**: Wix dashboard → *Domains* → your domain → *Advanced / DNS Records*.
- If registered **elsewhere** (GoDaddy, Namecheap, etc.): in that registrar's DNS panel.

⚠️ **Protect your email.** Only change/add the **A (`@`)** and **CNAME (`www`)** records to point at Vercel.
**Do not** touch `MX` records or replace nameservers — that's what keeps any `@lark-stern.com` email working.

### Safer rollout (recommended)
Test on a subdomain before moving the live site:
1. Add `new.lark-stern.com` in Vercel.
2. Create a `CNAME` for `new` → `cname.vercel-dns.com`.
3. Verify the full site there, then repeat for the apex/`www` to go live.

## Step 4 — Done
Vercel issues HTTPS/SSL automatically once DNS verifies (can take a few minutes to ~an hour to propagate).
Every future `git push` to `main` auto-deploys.

---

---

## Letting colleagues publish (Google Docs)

Colleagues write posts in Google Docs and an hourly automation puts them on the site -
no GitHub, no Markdown, no new logins. The one-time setup (a Google service account and
two GitHub secrets) is in **[SETUP-google-docs.md](SETUP-google-docs.md)**. The public
site works with or without this configured; it only controls the Docs-to-site sync.

---

## Before you cancel the Wix plan

- **Find out what posts your blog to LinkedIn.** Wix has no built-in auto-share, so
  something external is doing it: check Wix → *Apps → Installed Apps*, any Zapier/Make
  account, and the small "via …" line under a recent auto-post on the LinkedIn Page.
  If it reads the RSS feed, repoint it at `https://www.lark-stern.com/blog-feed.xml` -
  the new site serves that same path, so it should keep working.
- **Keep the Wix site published for ~30 days** after DNS moves, as a rollback.
- `scripts/verify-migration.mjs` compares every post against the live Wix pages. Once Wix
  is gone, so is that reference - run it before you cancel if you want a final check.

---

## Notes
- The blog is fully migrated: all 19 posts live in `content/blog/` and render at
  `/post/<slug>`, the same URLs Wix used. `vercel.json` also redirects `/blog/<slug>`
  to `/post/<slug>` for any stray links.
- `preview.html` and `team.html` are standalone design mirrors for local sign-off; they
  aren't served by Next and don't affect the build. `blog.html` predates the migration
  and no longer matches the real blog.
- The hero video and poster live in `public/` and are served automatically at `/cheetah-hero.mp4` and
  `/cheetah-hero-poster.jpg`. Post media lives under `public/blog/<slug>/`.
- To later move email or the whole domain off Wix entirely, do that separately and deliberately — it's not
  required to launch the site on Vercel.
