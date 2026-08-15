# EZHD — handoff

Everything a fresh session needs to work on this site. Read this first.

---

## What it is

Marketing site for **EZHD**, a two-person digital studio in Utah (websites, hosting,
local SEO, photo/video content). Pitch: one accountable partner instead of four vendors.

**It is one file.** `index.html` — ~184 KB, ~4,550 lines, containing all HTML, CSS and JS.
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
Deployed payload is ~1.7 MB of a 9.5 MB repo. Verify exclusions still 404 after any
change to that file.

## Local preview

The preview server script lives in the session scratchpad, which is **temporary and gets
cleaned up between sessions**. If `preview_start` fails with `MODULE_NOT_FOUND`, that is
why — recreate it, the project itself is fine.

A minimal static server on port **5070** serving `~/Downloads/EZHD` is all it needs.
Do not use port 5060 — that is SIP and browsers block it as an unsafe port.

---

## Page structure

Nine sections, in order:

| id | what |
|---|---|
| `intro` | Title card: badge + EZHD wordmark over a receding ring field (`#introC`, canvas 2D). Nav is hidden here and fades in once you scroll past |
| `hero` | "Your marketing isn't five vendors." Full-measure type, lede, CTAs, four stats |
| `system` | **01 — The system.** Exploded axonometric of the marketing system (`#sysC`), assembled by scroll. Sticky stage inside a 270vh track |
| `services` | 02 — Three offerings, 3D card tilt |
| `process` | 03 — Edit-bay timeline banner (`#flowC`) + scroll-scrubbed rail |
| `work` | 04 — Capability marquee + filterable grid |
| `scope` | 05 — Scope builder. **No prices anywhere** — deliberate |
| `duty` | 06 — Who does what + "straight talk on results" |
| `contact` | 07 — Form + direct card (Zac Evans, Dylan Evans) |

### The canvases

Three hand-rolled renderers, all canvas 2D, no libraries:

- `#introC` — concentric rings receding on a perspective divide, echoing the badge's rings
- `#sysC` — **true axonometric** (parallel projection, no perspective divide — that is what
  makes it read as a drawing rather than a render). `X=(x-y)cos30, Y=(x+y)sin30-z`.
  Five layers assemble on scroll, each on its own delay
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
6. **No proof of work.** The site sells capability but shows no case studies. First client
   is Alloy Homes (a home builder). This is the biggest remaining weakness.

## Suggested service additions (discussed, not built)

Strongest: a **Brand & print** pillar (logo, identity, yard signs, vehicle graphics —
currently "quoted separately", so the most common first purchase is not on the menu).
Then review generation, drone/aerial, job-site progress documentation, website
rescue/audit, lead-capture setup.

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
