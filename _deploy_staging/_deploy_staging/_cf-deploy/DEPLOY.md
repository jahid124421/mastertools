# 🚀 Deploying MasterTools

MasterTools is a **static site** — pure HTML/CSS/JS, no build step, no server code.
It runs entirely in the browser. You can host it free on any static platform.

## What's in the box (launch-ready)
- `index.html`, `css/`, `js/` — the app (207 tools).
- `vendor/` — **all** third-party libraries hosted locally (pdf-lib, pdf.js, jsPDF, XLSX,
  mammoth, JSZip, bcrypt, QRCode, JsBarcode, pdf-lib-plus-encrypt, and the ffmpeg engine).
  The site loads these from `vendor/`, so it is **self-contained** — no CDN needed.
  The only thing that still uses the internet is the optional AI transcription model
  (Whisper), which downloads once from Hugging Face on first use.
- `robots.txt`, `sitemap.xml` — SEO basics. **Replace `REPLACE-WITH-YOUR-DOMAIN`** with your real domain in both.
- `404.html` — SPA fallback so deep links load the app.
- `_headers`, `netlify.toml`, `vercel.json` — security headers + SPA routing for the common hosts.
- `favicon` — inline SVG in `index.html` (no extra file needed).

## Option A — Netlify (drag & drop, ~1 min)
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Done. `netlify.toml` applies routing + headers automatically.

## Option B — Cloudflare Pages
1. Push this folder to a Git repo (see below) and connect it in Cloudflare Pages, **or** use `wrangler pages deploy .`
2. Build command: *(none)*. Output directory: `.`
3. `_headers` is applied automatically.

## Option C — Vercel
1. `npm i -g vercel` then run `vercel` in this folder (or import the repo at vercel.com).
2. Framework preset: **Other**. `vercel.json` handles routing + headers.

## Option D — GitHub Pages
1. Create a repo, push these files.
2. Settings → Pages → deploy from branch (root).
3. Note: GitHub Pages can't set custom headers, but the site doesn't require any — everything still works.

## Push to Git (for B/C/D)
```bash
git init
git add .
git commit -m "MasterTools launch"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Before you go live
- [ ] Replace `REPLACE-WITH-YOUR-DOMAIN` in `robots.txt` and `sitemap.xml`.
- [ ] Drop your ad code into the `.ad-slot` elements (search `ad-slot` in `index.html` / `js/app.js`).
- [ ] (Optional) Add analytics (Plausible / GA) before `</body>` in `index.html`.

## Notes on the media tools
- **Video → MP3 / Compressor / Clip maker** produce **true MP3 / MP4** via the
  ffmpeg.wasm **single-thread** core, which is **vendored locally** in `vendor/ffmpeg/`
  (`ffmpeg-core.js` + `ffmpeg-core.wasm`, ~32 MB total). The site loads it from there —
  no CDN dependency, works offline. jsDelivr is only an automatic fallback if the local
  file is ever missing, and if even that fails the tools fall back to native WebM recording.
  This uses the single-thread core on purpose, so it needs **no** `Cross-Origin-Embedder-Policy`
  and never interferes with the other tools' libraries.
  - Keep the `vendor/` folder when you deploy. (The 32 MB wasm is under GitHub's 100 MB
    file limit, so plain `git push` works.)
- **Transcriber / Subtitles / Speech-to-Text** download a ~50 MB Whisper model on first
  use (transformers.js), then cache it. `microphone=(self)` is allowed in the headers.

## SEO: per-tool pages (optional, later)
The app is a hash-router SPA, so search engines index the homepage. To rank each tool
independently, pre-render one static `/tool-name/index.html` per tool from the catalog
in `js/tools-data.js`, then expand `sitemap.xml`. This is an enhancement, not required to launch.
