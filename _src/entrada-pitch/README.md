# Entrada at Snow Canyon — Concept Site

A cinematic redesign concept for [golfentrada.com](https://www.golfentrada.com/), built to out-class the
incumbent MembersFirst template site in design, smoothness, and interactivity.

## Run it

```bash
node server.js
```

Then open **http://localhost:4173**. No internet needed — fonts, GSAP, Lenis, and all
imagery are bundled locally.

## What's inside

- **Cinematic preloader** — spiral-sun mark draws itself, wordmark rises, counter, curtain lift
- **Hero** — 3168px golden-hour Snow Canyon image, masked character reveal of their real
  tagline "Gateway to the Extraordinary", mouse drift + scroll parallax, live St. George clock
- **Marquee** — club credentials ticker that speeds up with scroll velocity
- **Manifesto** — word-by-word scroll scrub + animated stat counters (Golfweek #5, 7,000+ yds, 300 sun days)
- **The Course** — David McLay Kidd story + signature-holes scrollytelling (15–18) with
  sticky crossfading imagery and flipping hole numbers
- **Life at Entrada** — pinned horizontal gallery (Sol Mesa, Pool, Academy, The Inn, Events);
  native swipe on mobile
- **Membership** — 3D tilt cards with cursor glare (Equity Golf / Club Lifestyle / Corporate & National)
- **The Setting** — duotone parallax backdrop with animated topographic contour lines
- **Inquire** — floating-label form with success state (demo only, sends nothing)
- Custom cursor, magnetic buttons, film grain, smooth scroll (Lenis + GSAP ScrollTrigger),
  fullscreen menu, hide/reveal nav, scroll progress bar
- Fully responsive; respects `prefers-reduced-motion`; works without JS (content is never hidden)

## The pitch page

Open **http://localhost:4173/pitch.html** — a client-facing proposal with a drag
before/after slider (their live site vs. this concept), real Lighthouse numbers
(94 vs 72 performance, 2.5MB vs 35.9MB, 23 vs 82 requests, 1.6s vs 3.2s LCP),
a film strip of the concept, scope bullets, and a path-to-launch. Screenshots and
audit reports live in `pitch-assets/` (re-capture anytime: `node pitch-assets/capture.mjs`,
re-verify: `node pitch-assets/verify.mjs`).

Also added since v1: a living hero (slow dissolve through three panoramas, desktop),
an illustrative SVG routing map with clickable pins 15–18 synced to the hole explorer,
responsive `srcset` variants for every photo, a mobile sticky inquire bar, a skip link,
and a background-tab-proof preloader.

## Notes for the pitch

- Imagery is a blend: the club's own marketing photos pulled from golfentrada.com
  (`assets/img/real-*.jpg`, originals in `assets/img/real/`) for recognition — real Sol Mesa,
  pool, lava holes, weddings — plus AI-generated cinematic shots (hero, hole 16, dusk closer)
  directed to match the landscape. Club photos are the club's own assets, fine for this
  private pitch; confirm rights/swap for licensed files in production. `assets/PROMPTS.md`
  has a staged place-accurate generation shoot for when media credits are topped up.
- Hole names/stats and membership categories are illustrative; footnoted as such on-page.
- Real club facts used: Golfweek's Best 2026 #5 Private Club in Utah, David McLay Kidd design,
  300+ days of sun, 7,000+ yards, Sol Mesa, Cactus Rye, The Inn, Troon Privé, address & phone.
