# Bridger Hollow Creamery — Concept Site

A fully illustrated concept site for a **fictional** farmstead creamery in Wellsville,
Cache Valley, Utah — single Jersey herd, cave-aged cheese, farm store, and a Curd Club.
Built as an EZHD website template: where the Entrada concept is cinematic photography in
the desert dark, this one is warm, light, and 100% hand-drawn SVG — no photos, no image
licenses, no external requests.

## Run it

```bash
node server.js
```

Then open **http://localhost:4174**. No internet needed — fonts (Fraunces + Karla),
GSAP, Lenis, and every illustration are bundled or inline.

## What's inside

- **Preloader** — cheese-wheel mark draws itself (rim, wedge cut, eyes pop in), wordmark rises, counter
- **Hero** — five-layer illustrated Cache Valley scene (sky/sun/clouds, Bear River Range,
  Wellsville Mountains, hayfields, barn + herd) with per-layer scroll parallax and mouse
  drift, drifting clouds, live Wellsville clock
- **Marquee** — butter-yellow credentials ticker that speeds up with scroll velocity
- **The Story** — word-by-word scroll scrub + animated stat counters (40 Jerseys, 4 hrs, 400 days,
  and years-since-1998, computed at runtime so it never goes stale)
- **The Cheese** — illustrated pasture panorama with parallax + signature-cheese
  scrollytelling (Wellsville Reserve / Stone Barn Cheddar / Hollow Bloom / Sardine Canyon
  Blue) with sticky crossfading still-life illustrations
- **The Farm** — pinned horizontal gallery of five illustrated scenes (Herd, Make Room,
  Cave, Scoop Window, Market Day); native swipe on mobile
- **The Curd Club** — 3D tilt cards with cursor glare (Quarterly / Wheelhouse / Whole Cow)
- **Visit** — hay-windrow line backdrop, info chips, and an illustrative Cache Valley map
  (Wellsville Mountains, Bear River Range, Cutler Marsh, Little Bear River, Sardine
  Canyon, Logan, pulsing farm pin)
- **Say Hello** — floating-label form with success state (demo only, sends nothing)
- Custom cursor, magnetic buttons, smooth scroll (Lenis + GSAP ScrollTrigger),
  fullscreen butter menu, hide/reveal nav, scroll progress bar, mobile sticky CTA
- Fully responsive; respects `prefers-reduced-motion`; works without JS (content is never hidden)

## Notes

- The business, people, address, phone, and awards are **fictional** — the footer says so.
  Real places referenced for local flavor: Wellsville, Cache Valley, the Wellsville
  Mountains, Bear River Range, Cutler Marsh, Little Bear River, Sardine Canyon, Logan,
  and the American West Heritage Center.
- Every visual is inline SVG drawn for this site — swap-friendly if a real client's
  photography arrives later, and extremely fast (no image payloads at all).
