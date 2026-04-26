# keyandboard.com

A single Next.js app that serves three sites from one repo and one Vercel deploy:

| Domain | What it shows |
| --- | --- |
| `keyandboard.com` | Union view: both founders + all projects (deduped) |
| `baranorhan.dev` | Baran's projects + bio + theme |
| `kayrauckilinc.dev` | Kayra's projects + bio + theme |

The variant is chosen at request time from the `Host` header
(`src/lib/site.ts` + `src/app/page.tsx`). No middleware, no rewrites.

## Editing content (no redeploy)

All content lives in `content/` as JSON:

```
content/
  site.json                # global stats / config
  founders/
    baran.json             # baran's profile + projects
    kayra.json             # kayra's profile + projects
```

Each `<id>.json` file holds:

- `profile` — bio, links, avatar, **and** that founder's site config
  (domain, theme colors, "wide" spacing, pixel-heavy toggle).
- `projects[]` — every project that founder owns. List the other founder
  in `coFounders` if it's a joint project. The keyandboard.com union
  page de-dupes by `slug` and merges owners.

### Live edits via GitHub

Set the env var below on Vercel and the app fetches each JSON file
from `raw.githubusercontent.com` at request time with 60s ISR cache —
edit the file on GitHub, refresh, see it live, no redeploy.

```
CONTENT_SOURCE_URL=https://raw.githubusercontent.com/<user>/<repo>/main/content
```

If unset (e.g. local dev), it falls back to the JSON files on disk.

## Project covers

Projects can specify `cover` (any image path). If omitted, one of the
ten generated pixel-art covers in `public/covers/default-{1..10}.svg`
is picked deterministically by `slug` hash, so the same project always
gets the same cover.

Regenerate the default covers any time with:

```bash
node scripts/gen-covers.mjs
```

## Local preview of each site

Without DNS, append `?_site=baran`, `?_site=kayra`, or `?_site=keyandboard`:

```
http://localhost:3000/?_site=baran
http://localhost:3000/?_site=kayra
http://localhost:3000/                 # union view
```

Or simulate a host header:

```bash
curl -H "Host: baranorhan.dev" http://localhost:3000/
```

## Hosting all three domains on one Vercel project

`keyandboard.com`, `baranorhan.dev`, and `kayrauckilinc.dev` all run from
this **single repo + single Vercel project**. There's no separate
codebase per founder — host detection in `src/lib/site.ts` picks the view.

1. Push to GitHub, link the repo on Vercel.
2. In **Project → Settings → Domains**, add all three:
   - `keyandboard.com` (+ `www.keyandboard.com`)
   - `baranorhan.dev`
   - `kayrauckilinc.dev`
   Vercel shows you the DNS records to set at each registrar.
3. **Project → Settings → Environment Variables**, add:
   ```
   CONTENT_SOURCE_URL=https://raw.githubusercontent.com/<you>/<repo>/main/content
   ```
   This makes the deployed app fetch JSON from GitHub at request time
   (60s ISR), so editing `content/founders/*.json` on GitHub goes live
   without a redeploy.
4. Done — every JSON edit, every component change, hits all three
   domains on the next deploy or content refresh.

## Per-founder pixel-art wallpapers

Each founder has a full-screen pixel-art background (Win-XP "Bliss"
inspired) generated from their accent color:

- `public/wallpapers/baran.svg` — green rolling hills
- `public/wallpapers/kayra.svg` — cyan ocean + horizon

Set per-founder in `content/founders/<id>.json`:

```json
"theme": {
  "wallpaper": "/wallpapers/baran.svg",
  "wallpaperOpacity": 0.4
}
```

Regenerate any time:

```bash
node scripts/gen-wallpapers.mjs
```

To swap a founder's vibe, edit the founder's accent color or the
`bliss()` scene logic in `scripts/gen-wallpapers.mjs`.

## Adding a new founder later

1. Drop `content/founders/<id>.json` (use `baran.json` as a template).
2. Add `<id>` to `FOUNDER_IDS` in `src/lib/content.ts`.
3. Add a host rule for the new domain in `src/lib/site.ts`.

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run lint` — eslint
- `node scripts/gen-covers.mjs` — regenerate the 10 default pixel covers
