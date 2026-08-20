# Ledgeline Storage — concept build

A fictional self-storage facility in Washington County, Utah, built as an EZHD
demo template. The premise: storage websites are uniformly bad, and they are bad
in one specific way — they hide the two things every customer actually wants
(**is there a unit, and what does it really cost**) behind a stock photo and a
"call for pricing" form. This build puts both on the page.

**The pitch line:** *your customer picks a door, sees the real move-in total, and
reserves it, without ever calling you.*

## Run it

```bash
node server.js       # → http://localhost:4176
```

Also registered as the `ledgeline` entry in `EZHD/.claude/launch.json`.

## What's in it

| # | Section | What it demonstrates |
|---|---------|----------------------|
| 01 | **The board** | 95 units drawn to scale as an interactive facility plan. Hover for a readout, click a door for a detail drawer. Filter by size, feature and rate; a list view mirrors it for phones and screen readers. |
| 02 | **Sizes** | Seven top-down scale drawings with contents laid in at true footprint — no stock photography anywhere on the site. |
| 03 | **Move-in math** | A live calculator: prorated first month, protection, lock, and an itemised **$0.00 admin fee**. |
| 04 | **Access** | A gate keypad that runs its own entry sequence and slides the gate open, plus an eight-row spec board. |
| 05 | **Find us** | Schematic drawn map, drive times, gate/office hours. |
| 06 | **Answers** | Eight plain-language FAQs. |
| 07 | **Reserve** | Form, honestly labelled as unwired. |

## How it's built

Vanilla HTML/CSS/JS. **No GSAP, no ScrollTrigger, no Lenis, no framework, no
build step, no external requests.** 11 requests, ~197 KB uncompressed over the
wire (roughly half that once a real host gzips the CSS and JS), FCP ~100 ms.

```
index.html          markup + JSON-LD (SelfStorage)
og.png              1200x630 link-preview card (re-capture after visual changes)
css/main.css        design system + all motion
js/inventory.js     the facility model — single source of truth
js/main.js          behaviour
assets/fonts/       Space Grotesk + IBM Plex Mono, vendored woff2
verify/shots.mjs    headless Chrome capture + assertions
```

### One source of truth

`js/inventory.js` authors the yard in **feet** — nine buildings, each an origin
plus one unit footprint and a count — and derives all 95 units from it. The plan
view, the list, the filters, the availability counters, the size cards, the
calculator and the reserve dropdown all read the same array, so no number on the
page can contradict another. Occupancy is a **hash of the unit id**, not a random
number, so the board is identical on every load and in every browser.

### The motion language: roll-up door

Deliberately unlike the other EZHD demos (Solmesa's cinematic glide, Bridger
Hollow's illustrated parallax, Iron Never Changes' screen-print stamps). Here:

- **Nothing fades and nothing slides up.** Every reveal is a clip edge travelling
  down the block with a bright door edge riding it, then passing through.
- The page opens behind a **row of twelve doors** that roll up in sequence.
- Counters **tick** to their value; the unit drawer opens as a **door panel**.
- Native scroll. No smoothing library.
- The left rail is an **ops readout** (live gate state, section, open count), not
  navigation chrome.

## Gotchas found building it (don't re-introduce)

1. **IntersectionObserver intersects a target against its own `clip-path`.** A
   block clipped to zero height reports ratio 0 for ever and can never trigger
   the reveal that would open it — a deadlock. The closed state keeps a 3 px
   sliver (which doubles as the door's top rail) and the observer uses
   `threshold: 0`.
2. **`html.js .r` (0,2,1) out-specifies `.r.is-open` (0,2,0).** The class was
   applied correctly while every block stayed visually shut. Any rule that
   reverses a `html.js`-scoped rule must carry the same prefix — and **assert the
   computed style, not the class**, or the test passes while the page is blank.
3. **`Math.imul` for FNV-1a.** A plain `*` overflows double precision on a 32-bit
   multiply and shreds the low bits. FNV also avalanches poorly on the last byte,
   so sequential unit ids landed in one bucket and whole rows read as empty — it
   needs a murmur3 finalizer.
4. **rAF is paused in a background tab**, so a counter started there freezes on a
   partial value — and these are the headline figures. Every tick carries a
   `setTimeout` failsafe that lands the true number.
5. **A size class can span two rates** (drive-up vs climate 10×10, covered vs
   open 12×40). Anywhere a single price stands for the class it must say
   "from", or a bigger unit looks mispriced next to a smaller one.
6. **The drawer is a sibling of `<main>`**, so it never inherits `.board`'s dark
   token overrides. It must redeclare `--card`/`--paper` or its near-white text
   renders on a near-white panel.
7. The in-app Browser pane runs pages as a **hidden tab** — rAF paused,
   IntersectionObserver starved. Verify with `verify/shots.mjs` against system
   Chrome, never from the pane.

## Verify

```bash
node verify/shots.mjs
```

Drives system Chrome headless at 1440×900 and 390×844, captures every section,
and asserts: all 95 units drawn, hero/rail counters agree with the model, no
horizontal scroll at either width, the drawer opens with its scale drawing, the
size filter matches the expected count, the gate runs, and **no reveal block is
still clipped** after a full scroll. Screenshots land in `verify/` (gitignored).
Playwright comes from `../entrada-pitch/node_modules` via a symlink — restore it
with `cd ../entrada-pitch && npm i`.

## Honesty

Ledgeline is invented. The yard, the 95 units, the rates, the address
(2200 N Ledgeline Way) and the phone number (a reserved 555 line) are all
illustrative, the footer says so, the page is `noindex`, and the reserve form
tells you outright that nothing was submitted. Nothing here can be booked.

## Draft wiring

Live as **Draft 04** at ez-hd.co/drafts/ledgeline since 2026-08-20. The draft copy
carries chrome this master doesn't: draft-framed title/description/og, a claim link in
the footer, and the fixed DRAFT 04 ribbon (offset for the ops rail on wide screens,
lifting above the mobile sticky bar). **Edit the master here, re-copy to
`drafts/ledgeline/`, then re-apply that chrome** — never edit the draft directly.
The copy excludes README.md, server.js, verify/ and node_modules.
