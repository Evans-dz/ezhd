# DESIGN.md — EZHD

> The design contract. Every session reads this before touching markup or CSS,
> instead of re-deriving taste from 88KB of inline stylesheet and drifting.
>
> **Operational detail lives in `HANDOFF.md`** — deploy, repo layout, the
> contact form, the canvas renderers, traps. This file is only the design
> decisions. Where the two overlap, HANDOFF.md is the older and more detailed
> record; do not contradict it.
>
> Reverse-derived from the existing build 2026-09-03 by `/ezhd-adopt`.
> Sections marked TODO were not decided in code and need a human call.

---

## 1. Motion language

**Name:** Drawn, then broadcast.

**Where it comes from:** EZHD's own trade. The drafting side is the work being
made — sheet grid, title block, crosshair cursor, plotter pen. The broadcast
side is the work going live — REC, running timecode, channel chips, ON AIR,
waveform. The site performs its own service on itself.

**How it shows up:** three places and no more.
- **The intro** (`#introC`, behind the hero since 2026-09-25 — the full-screen title card was cut so the first screen says what EZHD does): DRAW (~1.3s plotter sweep, centre-out) → LOCK
  (~0.2s glitch tick: jitter, ghost pass, sync line) → LIVE. At lock, `<body>`
  gains `.is-live` and the HUD powers on.
- **The HUD chrome**: `● REC` top-left (intro only), `TC` timecode top-right
  (wall clock + frames at 24fps), title block bottom-left with the sheet number
  following the section crossing the viewport's middle band.
- **Section entrances**: `--ez-out` for anything arriving, `--ez-ui` for
  anything responding to a pointer. Never mixed.

**What it must never do:** the broadcast layer is **ornament**. Every element in
it is `aria-hidden`, `pointer-events:none`, and the page must compose fully if
the script never runs. It must never carry information, never gate content, and
never appear in a client build — this language is EZHD's own and does not
travel.

**Easing tokens:**
```css
--ez-out: cubic-bezier(.16, 1, .3, 1);   /* entrances — decelerate hard */
--ez-ui:  cubic-bezier(.4, 0, .2, 1);    /* UI response */
```

## 2. Palette & roles

**Three colours only.** Ion Blue, Drift Silver, Void, plus the neutral ramp.
No other chromatic colour, ever. **If more than ~10% of the screen is blue, ion
is overused.**

| Role | Token | Value | Used for |
|---|---|---|---|
| surface | `--void` | `#04060A` | page base |
| alt surface | `--pit` | `#06090E` | alternating section |
| raised | `--panel` | `#0A0E15` | cards |
| raised hover | `--raise` | `#0F141D` | hover cards |
| line | `--dline` | `#1A2231` | hairlines |
| line strong | `--edge` | `#26303F` | stronger borders |
| ink | `--silver` | `#DDE3EA` | primary text on black |
| ink bright | `--white` | `#F4F6F8` | headlines |
| muted | `--dash` | `#939FAE` | secondary text |
| muted 2 | `--dash-2` | `#7C889A` | captions — **retuned for 4.5:1, do not darken** |
| accent | `--ion` | `#4FC3F7` | the one accent |
| accent deep | `--ion-2` / `--ion-3` | `#1E9BD7` / `#0A5F91` | fills behind white text |
| bloom | `--glow` | `#9BE0FF` | highlight core |

Contrast floor 4.5:1 body, 3:1 large text and UI edges. Single theme — dark
only, `color-scheme: dark`.

## 3. Type

- **Display:** Archivo, fallback Helvetica Neue / Arial (`--dsp`)
- **Body:** IBM Plex Sans (`--bdy`)
- **Mono:** IBM Plex Mono (`--mno`) — carries the broadcast/drafting voice
- **Small scale, fully tokenised:** `--ui .76` / `--label .72` / `--label-sm .66`
  / `--body-sm .95` / `--small .88` / `--fine .82`. **Zero hardcoded font-size
  below 1rem.** The file previously carried eighteen sizes under .9rem and read
  as assembled rather than designed. Keep it that way.
- **TODO — the display scale above 1rem is NOT tokenised.** There are 8+
  distinct `clamp()` values in the stylesheet with no shared ratio. Either
  derive a scale and tokenise it the way the small scale was, or record here
  that per-component clamps are deliberate.
- **Loading:** TODO — confirm the faces are self-hosted woff2 with
  `font-display: swap` and preloaded. No CDN.

## 4. Components — what is different here

| Element | The decision | The reason |
|---|---|---|
| Broadcast chrome | Ornament layer, `aria-hidden` + `pointer-events:none`, page composes without it | It is a "bug" in the broadcast sense — it overlays content on purpose |
| Service cards | `CH 01–06` chips, tally dot lights on hover | Channel metaphor, carries the broadcast half |
| Cursor | Crosshair hairlines + X·Y readout; viewfinder brackets inside `#proof` | Drafting half. Fine pointers only — killed for coarse and reduced motion |
| Canvases | Four hand-rolled 2D renderers, no libraries | Zero-build holds even for the heavy visuals |
| Form success | Stamps APPROVED | Drafting sign-off |
| Sheet grid | `.sheet`, **must stay the first child of `<body>`** | Positioned sections paint over it in DOM order |

## 5. Layout

- Container `--max: 1240px`; gutter `--pad: clamp(1.15rem, 4.5vw, 4.5rem)`
- Panel padding `--pad-panel: clamp(1.45rem, 2.7vw, 2.1rem)`; ion edge `3px`
- **TODO — 10 max-width breakpoints exist** (420, 560, 620, 720, 760, 820, 900,
  980, 1180 + capability queries). That is drift. Decide the three or four that
  are real and collapse the rest.
- Title block hidden under 900px.

## 6. Depth

Glow, not elevation. Shadows are ion-tinted bloom
(`0 0 8px rgba(79,195,247,.7)`, `0 30px 70px -34px rgba(79,195,247,.3)`) rather
than neutral drop shadows. Borders do the structural work; glow signals state.
Hold that — a neutral grey shadow anywhere in this build is a mistake.

## 7. Do / Don't

**Do**
- ES5 only in the page script: `var` and `function`. No arrows, `const`/`let`,
  template literals, optional chaining. Verified: 0 violations across 79KB.
- One IIFE per section, sharing `window.EZ` (`$`, `$$`, `clamp`, `lerp`, `CALM`,
  `HOVER`, `SMALL`, `lifecycle`). Null-guard everything so one missing node
  cannot break another section.
- Give every animation a static end state. Several elements ship at
  `opacity:0` — **if you add one, add its reduced-motion fallback in the same
  edit.**

**Don't**
- Don't use em dashes in copy, titles, meta or JSON-LD (removed site-wide 2026-09-25: they read as AI-written). Use a period, comma, colon or parentheses; label separators are " · ".
- Don't add scroll gimmicks back (3D card tilt, crosshair cursor, count-up stats were removed 2026-09-25). No pill-shaped buttons or tags: corners are square (2px max).
- Don't add a fourth colour.
- Don't let the broadcast layer become load-bearing.
- Don't reuse this motion language on a client build.

## 8. Responsive

Mobile is the real traffic. Coarse-pointer branch kills the cursor layer and the
hover tallies entirely — mobile gets the composed page, not a degraded desktop.
Tap targets ≥44px; `verify/audit.mjs` fails under 24 and warns under 44.

## 9. Data source of truth

**TODO — there isn't one, and this is the contract EZHD holds clients to.**

There is no `CONFIG` / `DATA` / `SERVICES` object. Service names, copy, sheet
count and contact details are inline in 65KB of markup. Extract them to
`js/config.js` the way `butter-bakery` and `sew-true` do.

Known values that are currently hardcoded and should move:
- `ACCESS_KEY` / `EMAIL` / `ENDPOINT` (Web3Forms — the key is public by design)
- `SHEET n OF 10` — the sheet count is asserted in the title block

## 10. Launch checklist

- [ ] Data extracted to `js/config.js`, nothing hardcoded in markup
- [ ] Display type scale tokenised or declared deliberate (§3)
- [ ] Breakpoints collapsed to the ones that are real (§5)
- [ ] `node ~/Projects/EZHD/ezhd-lab/verify/audit.mjs --url http://localhost:5070` clean, and again against https://ez-hd.co after deploy
- [ ] Skill pass over source: `/web-design-guidelines`
- [ ] `noindex` — n/a, this site is live
