# Publishing blog posts from Google Docs

Colleagues write posts in Google Docs. An automation checks the folder every hour
and puts anything marked **Publish: Yes** on the website. No GitHub, no Markdown,
no logins beyond Google.

This file is the one-time setup. Most of it is done; the part only you can do is
the Google service account (steps 3-5), because it needs your Google Cloud account.

---

## How a colleague writes a post (share this part with them)

1. Open the **"Lark & Stern - Blog"** folder in Google Drive.
2. Open **"📄 TEMPLATE - make a copy of me to write a post"** → **File → Make a copy**.
3. **Rename the copy** to the post's headline. That becomes the title and the web
   address (e.g. *Meet the Team 2027* → `lark-stern.com/post/meet-the-team-2027`).
4. At the very top, set:
   - **Category:** one of `Lunch & Learn`, `Team Growth`, `Something exciting`
   - **Publish:** `No` while drafting, `Yes` when it's ready to go live
5. Write the post below the line - headings, bold, bullet lists, links, pasted
   photos all work. The first photo becomes the cover image.
6. That's it. Within about an hour of setting **Publish: Yes**, it's on the site.
   Change it back to **No** to take a post down again.

---

## What's already set up

- The converter and the hourly automation (`.github/workflows/sync-blog.yml`) are
  in the repo.
- You create the **"Lark & Stern - Blog"** folder and the template doc in your
  company Shared drive (see step 1 below) - that is where colleagues write.
- Posts land in `content/blog/`, images in `public/blog/`, exactly like the
  migrated Wix posts. Hand-written or migrated posts are never touched by the sync -
  it only manages posts it created (they carry `source: "google-docs"`).

## What you need to do once (the Google side)

### 1. Find the folder ID
Open the **"Lark & Stern - Blog"** folder in Drive (in the company Shared drive).
The URL ends in a long id:
`https://drive.google.com/drive/folders/`**`THIS_IS_THE_ID`**
Copy that value - it is your `GOOGLE_DRIVE_FOLDER_ID`.

### 2. Create a Google Cloud project
- Go to <https://console.cloud.google.com> → create a project (any name).
- **APIs & Services → Enable APIs** → enable **Google Drive API**.

### 3. Create a service account
- **APIs & Services → Credentials → Create credentials → Service account**.
- Give it a name like `blog-sync`. Skip the optional role steps → **Done**.
- Open the new service account → **Keys → Add key → Create new key → JSON**.
  A `.json` file downloads. That whole file is `GOOGLE_SERVICE_ACCOUNT_JSON`.

### 4. Share the folder with the service account
- The service account has an email like `blog-sync@your-project.iam.gserviceaccount.com`.
- **If the folder is in your (or a colleague's) My Drive:** right-click the
  "Lark & Stern - Blog" folder → **Share** → add that email as **Viewer**.
- **If the folder lives in a company Shared drive:** add the same email as a
  member - either of the whole Shared drive, or of just that folder
  (right-click the folder → **Share**) - with **Viewer**. The sync already
  handles Shared drives; nothing else changes.
- Either way, the service account can only see what you share with it - not the
  rest of anyone's Drive.

> ⚠️ If your Google Workspace admin restricts sharing with outside accounts, a
> service account counts as "external" and the share may be blocked. If so, ask
> the admin to allow it for this folder, or keep the folder in a personal My
> Drive and share it from there.

### 5. Add two secrets to GitHub
In the repo → **Settings → Secrets and variables → Actions → New repository secret**:
- `GOOGLE_DRIVE_FOLDER_ID` → the id from step 1
- `GOOGLE_SERVICE_ACCOUNT_JSON` → paste the entire contents of the JSON file from step 3

### 6. Try it
- Repo → **Actions → "Sync blog from Google Docs" → Run workflow**.
- It reads the folder, commits any published posts, and Vercel deploys them.
- After this first manual run it also runs itself every hour.

---

## Running it yourself (optional)

To sync from your own machine instead of waiting for the hourly run:

```bash
export GOOGLE_DRIVE_FOLDER_ID=<your-folder-id>
export GOOGLE_SERVICE_ACCOUNT_JSON="$(cat path/to/key.json)"
npm run sync-blog
```

It writes/updates files under `content/blog/` and `public/blog/`; commit and push
as usual.

---

## Good to know

- **Publish is a toggle.** `Yes` puts a post up; changing it back to `No` takes it
  down on the next run.
- **Don't rename a published doc** unless you mean to change its URL - the address
  is built from the name, so renaming a live post breaks existing links.
- **Photos** are pulled in and re-hosted on the site. Very large phone photos make
  a large page; sensible sizes are best. Verify images look right the first time a
  post uses one - image URLs are the one part worth eyeballing on the first real post.
- **The template doc is ignored** by the sync (any doc with "template" in its name).
