# EZHD — handoff

Everything a fresh session needs to work on this site. Read this first.

---

## What it is

Marketing site for **EZHD**, a two-person digital studio in Utah. Six services,
mirroring the Google Business Profile (primary category "Marketing agency"): website
design & build, website care plan (hosting), local SEO & GBP management, brand & design
(logo/identity/print), content & social (photo/video/editing/post), and paid ads.
Pitch: one accountable partner instead of seven vendors. Keep the site, the GBP services
list, and the JSON-LD block in `<head>` in sync — they are three copies of the same
catalogue.

**It is one file.** `index.html` — ~210 KB, ~5,200 lines, containing all HTML, CSS and JS.
No build step, no framework, no dependencies. The only external request is Google Fonts.
Do not introduce a bundler, npm, or a framework without asking — the single-file property
is deliberate and the deploy depends on it.

## Where it lives

| | |
|---|---|
| Local | `~/Downloads/EZHD` |
| Repo | https://github.com/Evans-dz/ezhd (public, branch `main`) |
| Live | **https://ez-hd.co** — note the hyphen |
| Vercel | project `ezhd`, team `evans-5279's projects` (`team_bhQiH15quSpv0dotYkkRIcog`) |
| Registrar | IONOS |

**The domain is `ez-hd.co`, hyphenated.** It was built against `ezhd.co` for a long
time and every URL had to be corrected. If you ever see `ezhd.co` without the hyphen in
the source, it is a bug. (`ezhdco@gmail.com` is the contact address and is correct —
no dot, different string.)

## Deploying

Vercel auto-deploys on push. There is nothing else to do.

```bash
cd ~/Downloads/EZHD && git add -A && git commit -m "..." && git push
```

Project settings are Framework Preset **Other**, build command and output directory
both **empty**. It is served as static files.

`.vercelignore` keeps the brand kit in the repo but off the public site
(`ezhd-brand-kit.zip`, `brand/png/`, `brand/preview.html`, `brand/README.txt`).
Deployed payload is ~10 MB of a ~34 MB repo (the drafts and work screenshots are
most of it). Verify exclusions still 404 after any change to that file.

Social: Instagram is https://www.instagram.com/ezhd_co/ — linked in the footer
Follow column, the contact card, and every JSON-LD block's `sameAs`. Facebook
is planned; add it to all three spots when the client sends the URL.

## Local preview

The preview server script lives in the session scratchpad, which is **temporary and gets
cleaned up between sessions**. If `preview_start` fails with `MODULE_NOT_FOUND`, that is
why — recreate it, the project itself is fine.

A minimal static server on port **5070** serving `~/Downloads/EZHD` is all it needs.
Do not use port 5060 — that is SIP and browsers block it as an unsafe port.

---

## Page structure

Ten sections, in order:

| id | what |
|---|---|
| `intro` | Title card: badge + EZHD wordmark over a receding ring field (`#introC`, canvas 2D). Nav is hidden here and fades in once you scroll past |
| `hero` | "Your marketing isn't seven vendors." Full-measure type, lede, CTAs, four stats |
| `system` | **01 — The system.** Exploded axonometric of the marketing system (`#sysC`), assembled by scroll. Sticky stage inside a 270vh track. **Seven layers**, bottom-up: brand, domain+hosting, site, local search, content, paid ads, reporting |
| `services` | 02 — Six offerings in a 2×3 grid, 3D card tilt |
| `process` | 03 — Edit-bay timeline banner (`#flowC`) + scroll-scrubbed rail |
| `airtime` | 04 — **AIRTIME.** The content/social half of the pitch. Two movements: "what we shoot" (six 9:16 storyboard frames, inline SVG line art, each annotated with a real camera move) and "where it goes" (a five-channel platform rack — no YouTube: EZHD does not offer it). Nav links here as "Content" |
| `proof` | 05 — Active projects: browser-chrome cards over real screenshots (`work/*.jpg`) — Alloy Homes + ConnectShield, third slot is an open CTA. Nav links here as "Work" |
| `drafts` | 06 — The Drafts: debranded concept builds served as live demos under `drafts/` (see below). Claim buttons carry `data-claim`; 90-broadcast.js prefills the contact form's message |
| `work` | 07 — Capability marquee + filterable grid (12 tiles) |
| `scope` | 08 — Scope builder. **No prices anywhere** — deliberate |
| `duty` | 09 — Who does what + "straight talk on results" |
| `contact` | 10 — Form + direct card (Zac Evans, Dylan Evans) |

**Two client rules that outrank design taste**, both set 2026-08-17:
1. **Never state a content quantity.** No "8 pieces a month", no included-post
   counts, no "up to N reels" — cadence is custom per client and quoted on the
   call. The scope builder expresses this as light/standard/heavy tiers
   (`#tierBox`, radios named `cadence`); `read()` in the estimator appends the
   choice to the content row's summary line. If a piece-count reappears
   anywhere on the page, it is a bug.
2. **Never show client social content.** The `#airtime` storyboard frames are
   permanent illustration, not placeholders waiting for real reels — the client
   explicitly does not want other businesses' reels on this site.

**The drafts** (`drafts/<name>/`): full multi-file demo sites for fictional
businesses that a visitor can claim. The single-file rule protects `index.html`
only — drafts are ordinary static pages (Vercel serves their `index.html` at the
directory URL) and may use their own stacks (Solmesa runs GSAP/Lenis, vendored).
Draft 01 is **Solmesa**, the debranded Entrada pitch: every real-property photo
was replaced with the pitch's own AI-generated art (`assets/PROMPTS.md` in the
original documents the generation), the name/address/architect/rankings/logo
mark were all swapped, pages carry `noindex` and a fixed DRAFT ribbon linking
back to `/#drafts`. **Never ship anything from the original's `assets/img/real/`
folder — those are the actual club's photos.** The originals live untouched in
`~/Downloads/Alloy-Homes-main/entrada-pitch/`.

**The service pages** (`services/<slug>/`, added 2026-08-18): six dedicated,
geo-targeted pages — web-design, website-hosting, local-seo, brand-design,
social-media-management, paid-advertising — because a one-pager cannot rank for
per-service local searches (Whitespark: #1 local organic factor is a dedicated
service page; #2 is geographic relevance). Each is a self-contained static HTML
file cloned from the web-design exemplar: same <style> skeleton, unique ~600-word
copy, Service JSON-LD, canonical, three cross-links, FAQ, CTA to /#contact.
Geography: the GBP service area (screenshotted 2026-08-18) runs the length of
the state and over its borders — Cache Valley (Logan, Smithfield), Salt Lake
City, Park City, Cedar City, and the Washington County cluster (St. George,
Washington, Hurricane, Ivins, Santa Clara, La Verkin), plus Beaver, Kanab,
Panguitch, Brian Head, Duck Creek Village, and out-of-state Mesquite NV,
Las Vegas NV, Colorado City AZ. Every service page's areaServed mirrors that
list; body copy names Cache Valley and St. George on every page and spreads
the rest across pages so no single page reads stuffed. The client
rules above apply in full (no quantities, no guaranteed results, no prices, no
YouTube). Index cards link out via `.svc__more`; the footer carries a "Service
sheets" column; all six are in sitemap.xml. When adding a service, clone the
exemplar and update: sitemap, footer, the card link, and the main JSON-LD
offer's url.

**Work screenshots** (`work/alloy-homes.jpg`, `work/ezhd-site.jpg`): captured with
headless Chrome at DSF 2, JPEG q82 via sips. The trick for self-shots:
`--force-prefers-reduced-motion` lands the fully-composed static page — without it
every reveal is caught at opacity 0 and the frame is black.

### The broadcast chrome (added 2026-08-17)

The site's visual concept is **drawn, then broadcast** — the drafting identity
(sheet grid, title block, crosshair cursor) fused with a live-signal identity
(REC, running timecode, channel chips, ON AIR, waveform). Two pseudo-files own it:
`15-broadcast.css` and `90-broadcast.js`. Everything in the layer is ornament:
every element is `aria-hidden`, `pointer-events:none`, and the page composes
fully if the script never runs.

- The intro (`#introC`) has three phases: DRAW (~1.3s, a plotter pen sweeps the
  ring field in, centre-out), LOCK (~0.2s glitch tick — jitter, ghost pass, sync
  line), LIVE (the familiar receding field). At lock, `<body>` gains `.is-live`,
  which powers on the HUD. Reduced motion goes straight to LIVE + `.is-live`.
- HUD: `● REC` (top-left, intro only — it yields via `#nav.is-lit ~ .hud__rec`
  so it never sits on a section eyebrow) and `TC` timecode top-right (wall clock
  + frames at 24fps, setInterval 42ms, paused on `visibilitychange`, static
  under reduced motion).
- Title block bottom-left (`.tb__block`): PROJECT / SHEET n OF 10 / DRAWN BY /
  CHECKED BY. The sheet number follows the section crossing the viewport's
  middle band (IO with `-45%` rootMargin). Hidden under 900px. It deliberately
  overlays content — it is a broadcast "bug".
- Cursor: crosshair hairlines + X·Y readout (fine pointers only); inside
  `#proof` it swaps to viewfinder brackets (`body.in-vf`). Killed for coarse
  pointers and reduced motion.
- `#services` cards carry `CH 01–06` chips whose tally dot lights on hover;
  `#sysC` draws an ON AIR tally in the sheet corner once assembly completes;
  the proof feature card runs an audio-waveform canvas (`#wkWave`); the form's
  success state stamps APPROVED; the footer signs off with "End of transmission".
- The drafting-sheet grid is `.sheet`, the FIRST child of `<body>` — it must
  stay first: positioned sections paint over it in DOM order.

### The canvases

Four hand-rolled renderers, all canvas 2D, no libraries (the fourth, `#wkWave`,
is the proof section's audio strip — see the broadcast chrome above):

- `#introC` — concentric rings receding on a perspective divide, echoing the badge's rings
- `#sysC` — **true axonometric** (parallel projection, no perspective divide — that is what
  makes it read as a drawing rather than a render). `X=(x-y)cos30, Y=(x+y)sin30-z`.
  Seven layers assemble on scroll, each on its own delay
- `#flowC` — edit-bay timeline: film frames, b-roll, audio waveform, playhead

All share `EZ.lifecycle()` from the core script: caps DPR at 2, pauses off-screen via
IntersectionObserver and on `visibilitychange`, renders one static frame under
`prefers-reduced-motion`.

---

## Conventions — follow these

**ES5 only in the page script.** `var` and `function`. No arrows, `const`/`let`, template
literals, or optional chaining. Every section is its own IIFE using a shared `window.EZ`
(`$`, `$$`, `clamp`, `lerp`, `CALM`, `HOVER`, `SMALL`, `lifecycle`). Null-guard everything
so one missing node cannot break other sections.

**Colour — three only.** Ion Blue `#4FC3F7`, Drift Silver `#DDE3EA`, Void `#04060A`,
plus the neutral ramp. No other chromatic colour, ever. Ion is an accent: if more than
~10% of the screen is blue, it is overused.

**Type scale is fully tokenised.** There are zero hardcoded `font-size` values below 1rem
— they all use `--ui / --label / --label-sm / --body-sm / --small / --fine`. Keep it that
way; the file previously carried eighteen different sizes under .9rem and it read as
assembled rather than designed. Same for `--pad-panel` and `--accent-edge`.

**Reduced motion must land a complete, composed page.** Every animation needs a static
end state. Several elements ship at `opacity:0` — if you add one, add its reduced-motion
fallback in the same edit.

**Accessibility.** One `<h1>` (the hero). Decorative canvases are `aria-hidden`; meaningful
ones have `role="img"` + a label that actually describes what is drawn. Body text must
clear 4.5:1 — `--dash-2` was retuned to `#7C889A` for exactly this reason, do not darken it.

---

## Contact form

Posts to **Web3Forms** → `ezhdco@gmail.com`. Access key is in `index.html` near
`var EMAIL`. That key is public by design — it ships in the HTML and only permits
submitting, never reading.

Falls back to a `mailto:` handoff if the request fails, if `fetch` is missing, or if the
key is a placeholder. There is an offscreen honeypot (`botcheck`). Verified working
end to end against the live endpoint.

**Not yet confirmed:** whether replies in Gmail go to the lead or to Web3Forms. If they go
to the wrong place, add a `replyto` field to the POST body.

---

## Outstanding

1. **Real form submission from https://ez-hd.co** and confirm it lands (check spam, mark
   "not spam" once).
2. **`www.ez-hd.co`** — Vercel showed "Invalid Configuration"; hit **Refresh** on that row
   so it issues a certificate. It already 307s to the root, which is the desired direction.
3. **`_domainconnect` CNAME at IONOS** still points at Vercel — harmless leftover, delete
   when convenient. Check the HOST NAME column, not the value; it is identical to `www`'s.
4. **Feedback window** — the site says 2 business days (process lede + duty list). The user
   said 3 was fine and wanted it reverted; never confirmed. One-line change.
5. **Reply-to on the form** (see above).
6. ~~No proof of work.~~ **Done** — `#proof` section with Alloy Homes (live at
   https://alloy.homes) and the site itself. Add real client shoots as they happen.
7. **Confirm the new scope language.** Services 03 (Local SEO & GBP), 04 (Brand &
   design), and 06 (Paid advertising) were written from the GBP services list, not from
   a signed services agreement. The section lede says these line items are agreement
   language — Zac/Dylan must confirm or adjust every line item before this deploys.
8. **og.png predates the six-service positioning** — regenerate it if its text still
   says websites/hosting only.

## Service additions (built 2026-08-15)

The **Brand & print** pillar, local search, and paid ads are now first-class services
(six cards, seven system layers, 12 capability tiles, expanded scope builder). Still
unbuilt from the old list: review generation, drone/aerial, job-site progress
documentation, website rescue/audit, lead-capture setup.

---

## Traps worth knowing

- **`overflow-x:hidden` on body kills `position:sticky`.** The system section needs sticky,
  so body uses `overflow-x:clip` (with `hidden` first as an old-browser fallback). Do not
  revert it.
- **Cutting blocks out of `index.html` by string anchors is dangerous** — an end-anchor
  matched too far once and swallowed a section marker, breaking the page. Cut by line
  boundaries computed from anchors instead, and always `git commit` before surgery.
- **The browser preview throttles `requestAnimationFrame` when its tab is not fronted.**
  Scroll-driven and eased animations will look frozen or half-finished in screenshots.
  Front the tab, or read state directly instead of trusting a screenshot.
- **Bare `1fr` grid tracks floor at min-content.** "MARKETING" at display size is ~880px,
  which silently starved a sibling column to 150px. Use `minmax(0, …)`.
- Quick Look (`qlmanage`) ignores SVG aspect ratio and clips wide artwork. Use headless
  Chrome for rasterising: `--headless --screenshot --window-size=W,H
  --default-background-color=00000000`.

## People

- **Zac Evans** — Founder · EZHD · (435) 224-6987
- **Dylan Evans** — Social & Content Lead · EZHD · (435) 994-5235
- Shared: **ezhdco@gmail.com**

Brand kit (24 SVG + 40 PNG, six colourways in badge/lockup/wordmark) is in `brand/`.
Originals from the designer are at `~/Downloads/Vista Logos/` — untouched.
